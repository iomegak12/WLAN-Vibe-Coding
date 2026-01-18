import { useState } from 'react';
import pmsService from '../../../services/pmsService';

const useImageReorder = () => {
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState(null);

  const reorderImages = async (productId, imageIds) => {
    setReordering(true);
    setError(null);

    try {
      await pmsService.reorderProductImages(productId, imageIds);
      setReordering(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reorder images';
      setError(errorMessage);
      setReordering(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    reorderImages,
    reordering,
    error,
  };
};

export default useImageReorder;
