import { useState } from 'react';
import pmsService from '../../../services/pmsService';

const useSetPrimaryImage = () => {
  const [setting, setSetting] = useState(false);
  const [error, setError] = useState(null);

  const setPrimaryImage = async (productId, imageId) => {
    setSetting(true);
    setError(null);

    try {
      await pmsService.setPrimaryImage(productId, imageId);
      setSetting(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to set primary image';
      setError(errorMessage);
      setSetting(false);
      return { success: false, error: errorMessage };
    }
  };

  return {
    setPrimaryImage,
    setting,
    error,
  };
};

export default useSetPrimaryImage;
