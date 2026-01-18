/**
 * QR/Barcode Endpoint Tester
 * 
 * To use this:
 * 1. Open browser console on the Products page
 * 2. Copy and paste this entire code
 * 3. Run: testQRBarcode('YOUR_PRODUCT_ID')
 * 
 * Example: testQRBarcode('6967a6e3c4613dcc20340dcc')
 */

window.testQRBarcode = async function(productId) {
  console.log('🔍 Testing QR/Barcode endpoints...');
  console.log('Product ID:', productId);
  console.log('');
  
  // Test QR Code
  console.log('📱 Testing QR Code endpoint...');
  const qrUrl = `http://localhost:5002/api/v1/products/${productId}/qr`;
  console.log('URL:', qrUrl);
  
  try {
    const qrResponse = await fetch(qrUrl);
    console.log('Status:', qrResponse.status, qrResponse.statusText);
    console.log('Content-Type:', qrResponse.headers.get('content-type'));
    
    if (qrResponse.ok) {
      const blob = await qrResponse.blob();
      console.log('Blob type:', blob.type);
      console.log('Blob size:', blob.size, 'bytes');
      
      if (blob.type.startsWith('image/')) {
        const imgUrl = URL.createObjectURL(blob);
        console.log('✅ QR Code image received!');
        console.log('View it here:', imgUrl);
        
        // Open in new tab
        const win = window.open();
        win.document.write(`<img src="${imgUrl}" alt="QR Code" style="max-width: 100%; height: auto;" />`);
        win.document.title = 'QR Code - ' + productId;
      } else {
        console.log('⚠️ Response is not an image');
        const text = await blob.text();
        console.log('Response:', text);
      }
    } else {
      const text = await qrResponse.text();
      console.log('❌ Error response:', text);
    }
  } catch (error) {
    console.log('❌ QR Code fetch failed:', error.message);
  }
  
  console.log('');
  
  // Test Barcode
  console.log('🏷️ Testing Barcode endpoint...');
  const barcodeUrl = `http://localhost:5002/api/v1/products/${productId}/barcode`;
  console.log('URL:', barcodeUrl);
  
  try {
    const barcodeResponse = await fetch(barcodeUrl);
    console.log('Status:', barcodeResponse.status, barcodeResponse.statusText);
    console.log('Content-Type:', barcodeResponse.headers.get('content-type'));
    
    if (barcodeResponse.ok) {
      const blob = await barcodeResponse.blob();
      console.log('Blob type:', blob.type);
      console.log('Blob size:', blob.size, 'bytes');
      
      if (blob.type.startsWith('image/')) {
        const imgUrl = URL.createObjectURL(blob);
        console.log('✅ Barcode image received!');
        console.log('View it here:', imgUrl);
        
        // Open in new tab
        const win = window.open();
        win.document.write(`<img src="${imgUrl}" alt="Barcode" style="max-width: 100%; height: auto;" />`);
        win.document.title = 'Barcode - ' + productId;
      } else {
        console.log('⚠️ Response is not an image');
        const text = await blob.text();
        console.log('Response:', text);
      }
    } else {
      const text = await barcodeResponse.text();
      console.log('❌ Error response:', text);
    }
  } catch (error) {
    console.log('❌ Barcode fetch failed:', error.message);
  }
  
  console.log('');
  console.log('📊 Test complete!');
  console.log('');
  console.log('If both failed:');
  console.log('  1. Make sure backend is running on port 5002');
  console.log('  2. Check if product exists');
  console.log('  3. Verify QR/Barcode endpoints are implemented');
  console.log('');
  console.log('If you see 404 errors:');
  console.log('  - QR/Barcode endpoints are not implemented yet');
  console.log('  - Follow TESTING_GUIDE.md to enable the feature');
};

console.log('✅ QR/Barcode tester loaded!');
console.log('Usage: testQRBarcode("YOUR_PRODUCT_ID")');
console.log('Example: testQRBarcode("6967a6e3c4613dcc20340dcc")');
