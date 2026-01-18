import { useState } from 'react';
import pmsService from '../../../services/pmsService';

const useImageDelete = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const deleteImage = async (productId, imageId) => {
    setDeleting(true);
    setError(null);

    try {
      await pmsService.deleteProductImage(productId, imageId);
      setDeleting(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete image';
      setError(errorMessage);
      setDeleting(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    deleteImage,
    deleting,
    error,
  };
};

export default useImageDelete;
