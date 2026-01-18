/**
 * Utility to populate product images using Unsplash API
 * 
 * Usage: Import this in a component and call populateAllProductImages()
 * 
 * Note: You'll need to sign up for a free Unsplash API key at https://unsplash.com/developers
 * and replace UNSPLASH_ACCESS_KEY below
 */

import pmsService from '../services/pmsService';

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Replace with your key
const IMAGES_PER_PRODUCT = 5;

// Map categories to search terms for better image relevance
const getCategorySearchTerm = (categoryName, subcategoryName, productName, brand) => {
  const terms = [];
  
  // Use product name first for most specific results
  if (productName) {
    terms.push(productName);
  }
  
  // Add brand
  if (brand) {
    terms.push(brand);
  }
  
  // Add subcategory
  if (subcategoryName) {
    terms.push(subcategoryName);
  }
  
  // Fallback to category
  if (categoryName && terms.length === 0) {
    terms.push(categoryName);
  }
  
  return terms.join(' ');
};

/**
 * Fetch images from Unsplash
 */
const fetchUnsplashImages = async (searchQuery, count = 5) => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Unsplash');
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching Unsplash images:', error);
    return [];
  }
};

/**
 * Convert image URL to File object
 */
const urlToFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error('Error converting URL to file:', error);
    return null;
  }
};

/**
 * Upload images for a single product
 */
const uploadProductImages = async (product, showProgress) => {
  const searchTerm = getCategorySearchTerm(
    product.categoryName,
    product.subCategoryName,
    product.name,
    product.brand
  );
  
  showProgress(`Fetching images for: ${product.name} (${searchTerm})`);
  
  // Fetch images from Unsplash
  const images = await fetchUnsplashImages(searchTerm, IMAGES_PER_PRODUCT);
  
  if (images.length === 0) {
    showProgress(`⚠️ No images found for: ${product.name}`);
    return { success: false, productName: product.name, reason: 'No images found' };
  }
  
  showProgress(`Found ${images.length} images for: ${product.name}`);
  
  // Upload each image
  let uploadedCount = 0;
  for (let i = 0; i < images.length; i++) {
    try {
      const image = images[i];
      const imageUrl = image.urls.regular; // Get regular size image
      const filename = `${product.sku}-${i + 1}.jpg`;
      
      showProgress(`  Uploading image ${i + 1}/${images.length} for ${product.name}...`);
      
      // Convert URL to File
      const file = await urlToFile(imageUrl, filename);
      if (!file) {
        showProgress(`  ⚠️ Failed to download image ${i + 1}`);
        continue;
      }
      
      // Upload to backend
      const isPrimary = i === 0; // First image is primary
      await pmsService.uploadProductImage(product.id, file, isPrimary);
      uploadedCount++;
      
      showProgress(`  ✅ Uploaded image ${i + 1}/${images.length}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      showProgress(`  ❌ Failed to upload image ${i + 1}: ${error.message}`);
    }
  }
  
  return {
    success: uploadedCount > 0,
    productName: product.name,
    uploadedCount,
    totalImages: images.length
  };
};

/**
 * Main function to populate images for all products
 */
export const populateAllProductImages = async (showProgress = console.log) => {
  if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    showProgress('❌ Please set your Unsplash API key in populateProductImages.js');
    return {
      success: false,
      error: 'Unsplash API key not configured'
    };
  }
  
  try {
    showProgress('🔍 Fetching all products...');
    
    // Fetch all products
    const response = await pmsService.getProducts({ limit: 100 });
    const products = response.data?.items || [];
    
    if (products.length === 0) {
      showProgress('⚠️ No products found in database');
      return {
        success: false,
        error: 'No products found'
      };
    }
    
    showProgress(`📦 Found ${products.length} products. Starting image population...`);
    showProgress('');
    
    const results = [];
    
    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      showProgress(`\n[${i + 1}/${products.length}] Processing: ${product.name}`);
      showProgress('─'.repeat(60));
      
      const result = await uploadProductImages(product, showProgress);
      results.push(result);
      
      // Add delay between products
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Summary
    showProgress('\n');
    showProgress('═'.repeat(60));
    showProgress('📊 SUMMARY');
    showProgress('═'.repeat(60));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    showProgress(`✅ Successful: ${successful.length} products`);
    showProgress(`❌ Failed: ${failed.length} products`);
    
    if (successful.length > 0) {
      const totalImages = successful.reduce((sum, r) => sum + (r.uploadedCount || 0), 0);
      showProgress(`📸 Total images uploaded: ${totalImages}`);
    }
    
    if (failed.length > 0) {
      showProgress('\nFailed products:');
      failed.forEach(r => {
        showProgress(`  - ${r.productName}: ${r.reason || 'Upload error'}`);
      });
    }
    
    return {
      success: true,
      total: products.length,
      successful: successful.length,
      failed: failed.length,
      results
    };
    
  } catch (error) {
    showProgress(`❌ Error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Populate images for a single product by ID
 */
export const populateSingleProductImages = async (productId, showProgress = console.log) => {
  if (UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
    showProgress('❌ Please set your Unsplash API key in populateProductImages.js');
    return { success: false, error: 'Unsplash API key not configured' };
  }
  
  try {
    showProgress(`🔍 Fetching product ${productId}...`);
    
    const response = await pmsService.getProductById(productId);
    const product = response.data;
    
    showProgress(`📦 Processing: ${product.name}`);
    showProgress('─'.repeat(60));
    
    const result = await uploadProductImages(product, showProgress);
    
    showProgress('\n' + '═'.repeat(60));
    if (result.success) {
      showProgress(`✅ Successfully uploaded ${result.uploadedCount} images`);
    } else {
      showProgress(`❌ Failed: ${result.reason || 'Unknown error'}`);
    }
    
    return result;
    
  } catch (error) {
    showProgress(`❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};
