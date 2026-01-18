import axios from 'axios';

// Create separate Axios instances for each service
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for httpOnly refresh tokens
});

export const pmsApi = axios.create({
  baseURL: import.meta.env.VITE_PMS_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Token management
// Note: refreshToken is stored in httpOnly cookie by backend, not localStorage
const getAccessToken = () => localStorage.getItem('accessToken');
const setAccessToken = (token) => {
  localStorage.setItem('accessToken', token);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// Request interceptor - Add auth token to requests
const requestInterceptor = (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const requestErrorHandler = (error) => {
  return Promise.reject(error);
};

// Response interceptor - Handle token refresh
const responseInterceptor = (response) => {
  // For blob responses (QR codes, barcodes, etc.), return the full response
  if (response.config.responseType === 'blob') {
    return response;
  }
  // For JSON responses, unwrap the data
  return response.data;
};

const responseErrorHandler = async (error) => {
  const originalRequest = error.config;

  // If error is 401 and we haven't tried to refresh yet
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      // Try to refresh the token (refreshToken sent automatically via httpOnly cookie)
      const response = await authApi.post('/auth/refresh');

      // Backend structure: { success, data: { tokens: { accessToken } } }
      const newAccessToken = response.data?.tokens?.accessToken || response.data?.accessToken || response.accessToken;
      
      if (newAccessToken) {
        setAccessToken(newAccessToken);
        // refreshToken is automatically updated in httpOnly cookie by backend

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      }
    } catch (refreshError) {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }

  // For other errors, just reject
  return Promise.reject(error);
};

// Apply interceptors to both API instances
[authApi, pmsApi].forEach((api) => {
  api.interceptors.request.use(requestInterceptor, requestErrorHandler);
  api.interceptors.response.use(responseInterceptor, responseErrorHandler);
});

// Helper to set tokens (used after login)
// Note: refreshToken is set by backend in httpOnly cookie
export const setTokens = (accessToken) => {
  setAccessToken(accessToken);
};

// Helper to clear tokens (used on logout)
export const clearAuthTokens = clearTokens;

// Export configured instances
export default { authApi, pmsApi, setTokens, clearAuthTokens };
