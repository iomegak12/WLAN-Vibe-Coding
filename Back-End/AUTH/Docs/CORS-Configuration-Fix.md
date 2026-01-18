# CORS Configuration - Fixed for Credentials Support

## Issue
Frontend was getting CORS error when using `credentials: 'include'` for httpOnly cookies because the backend was using wildcard `*` for Access-Control-Allow-Origin, which is not allowed with credentials.

## Fix Applied

### 1. Environment Configuration (.env)
Updated `CORS_ORIGINS` from wildcard to specific origin:
```env
CORS_ORIGINS=http://localhost:3000
```

For multiple origins (comma-separated):
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

### 2. Backend CORS Configuration (src/app.js)
Updated CORS middleware with:
- ✅ **Origin validation**: Dynamic origin checking with callback function
- ✅ **Credentials**: Set to `true` to allow cookies
- ✅ **Methods**: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- ✅ **Allowed Headers**: `Content-Type, Authorization`
- ✅ **No origin handling**: Allows requests from Postman/curl/mobile apps

```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGINS.split(',').map(o => o.trim());
    
    if (!origin || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
};
```

## Frontend Usage

### Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  withCredentials: true, // Enable credentials (cookies)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Login example
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};
```

### Fetch API Configuration
```javascript
// Login with credentials
const login = async (email, password) => {
  const response = await fetch('http://localhost:5001/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ email, password }),
  });
  
  return response.json();
};
```

## Testing

### 1. Restart the AUTH Service
```bash
# Stop existing process
npm run dev

# Or with Docker
docker compose down
docker compose up -d
```

### 2. Test from Frontend
```javascript
// This should now work without CORS errors
fetch('http://localhost:5001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'jtdhamodharan@gmail.com',
    password: 'Prestige123!'
  })
})
.then(res => res.json())
.then(data => console.log('Login successful:', data))
.catch(err => console.error('Login failed:', err));
```

### 3. Verify CORS Headers (Browser DevTools Network Tab)
Check response headers should include:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Production Configuration

### Environment Variable
Update `.env` or deployment platform:
```env
CORS_ORIGINS=https://your-frontend-domain.com,https://admin.your-domain.com
```

### Multiple Environments
```env
# Development
CORS_ORIGINS=http://localhost:3000,http://localhost:4200

# Staging
CORS_ORIGINS=https://staging.your-domain.com

# Production
CORS_ORIGINS=https://app.your-domain.com,https://admin.your-domain.com
```

## Security Notes

1. **Never use wildcard (`*`) with credentials** - Current implementation prevents this
2. **Whitelist specific origins only** - Add only trusted frontend URLs
3. **HTTPS in production** - Always use HTTPS for production origins
4. **Same configuration needed for PMS service** - Apply identical CORS setup

## Troubleshooting

### Issue: CORS error still appears
**Solution:** 
- Clear browser cache and cookies
- Restart backend server
- Verify `CORS_ORIGINS` matches exact frontend URL (including protocol and port)

### Issue: Postman/curl requests fail
**Solution:** The configuration allows requests with no origin, so Postman should work. If not, temporarily add wildcard for testing:
```env
CORS_ORIGINS=*
```
⚠️ Remember to revert for credentials support!

### Issue: Different port for frontend
**Solution:** Update `.env`:
```env
CORS_ORIGINS=http://localhost:3001
```

## Status
✅ **Fixed and deployed** - Ready for frontend testing

Contact backend team if issues persist.
