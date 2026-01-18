import { pmsApi } from './api';

// PMS (Product Management Service) functions
const pmsService = {
  // Categories
  async getCategories(params = {}) {
    const response = await pmsApi.get('/categories', { params });
    return response.data;
  },

  async getCategoryById(id) {
    const response = await pmsApi.get(`/categories/${id}`);
    return response.data;
  },

  async createCategory(categoryData) {
    const response = await pmsApi.post('/categories', categoryData);
    return response.data;
  },

  async updateCategory(id, categoryData) {
    const response = await pmsApi.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await pmsApi.delete(`/categories/${id}`);
    return response.data;
  },

  async getCategoryDependencies(id) {
    const response = await pmsApi.get(`/subcategories`, { params: { categoryId: id, limit: 1 } });
    return {
      subcategoryCount: response.data?.pagination?.total || 0
    };
  },

  // Sub-categories
  async getSubCategories(params = {}) {
    const response = await pmsApi.get('/subcategories', { params });
    return response.data;
  },

  async getSubCategoryById(id) {
    const response = await pmsApi.get(`/subcategories/${id}`);
    return response.data;
  },

  async createSubCategory(subCategoryData) {
    const response = await pmsApi.post('/subcategories', subCategoryData);
    return response.data;
  },

  async updateSubCategory(id, subCategoryData) {
    const response = await pmsApi.put(`/subcategories/${id}`, subCategoryData);
    return response.data;
  },

  async deleteSubCategory(id) {
    const response = await pmsApi.delete(`/subcategories/${id}`);
    return response.data;
  },

  async getSubCategoryDependencies(id) {
    // This will check product count when products module is ready
    // For now, return 0
    return {
      productCount: 0
    };
  },

  // Products
  async getProducts(params = {}) {
    const response = await pmsApi.get('/products', { params });
    return response.data;
  },

  async getProductById(id) {
    const response = await pmsApi.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await pmsApi.post('/products', productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await pmsApi.put(`/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await pmsApi.delete(`/products/${id}`);
    return response.data;
  },

  // Product images
  async uploadProductImage(productId, imageFile, isPrimary = false) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('isPrimary', isPrimary);

    const response = await pmsApi.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProductImage(productId, imageId) {
    const response = await pmsApi.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  },

  async setPrimaryImage(productId, imageId) {
    const response = await pmsApi.put(`/products/${productId}/images/${imageId}/primary`);
    return response.data;
  },

  async reorderProductImages(productId, imageIds) {
    const response = await pmsApi.put(`/products/${productId}/images/reorder`, { imageIds });
    return response.data;
  },

  // QR Code and Barcode
  async getProductQRCode(productId) {
    const response = await pmsApi.get(`/products/${productId}/qr`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getProductBarcode(productId) {
    const response = await pmsApi.get(`/products/${productId}/barcode`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async regenerateQRCode(productId) {
    const response = await pmsApi.post(`/products/${productId}/qr/regenerate`);
    return response.data;
  },

  async regenerateBarcode(productId) {
    const response = await pmsApi.post(`/products/${productId}/barcode/regenerate`);
    return response.data;
  },
};

export default pmsService;
