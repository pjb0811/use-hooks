import { useCallback } from 'react';

const useFileToDataUrl = () => {
  const readAsDataUrl = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as a data URL.'));
        }
      };

      reader.onerror = () => {
        reject(reader.error ?? new Error('Failed to read file.'));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  return readAsDataUrl;
};

export default useFileToDataUrl;
