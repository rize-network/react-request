import { useState } from 'react';
import { upload } from './utils/upload';
import { debounce } from './utils/func';

export const useUploadRequest = function (url: string, options = {}) {
  const [data, setData] = useState(undefined);
  const [file, setFile] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const {
    onSuccess = (newData: any) => {
      console.log('onSuccess', { newData });
    },
    onError = (newError: Error) => {
      console.log('onError', { error: newError });
    },
  }: {
    onSuccess?: (d: any) => void;
    onError?: (e: Error) => void;
  } = options;

  const run = debounce((file: any) => {
    setLoading(true);
    setProgress(0);
    setFile(file);
    upload({
      file: file,
      url,
      onProgress: (newProgress: number) => {
        setProgress(newProgress);
      },
      onSuccess: (response: any) => {
        setError(undefined);
        setLoading(false);
        if (response.data && response.data !== undefined) {
          setData(response.data);
          onSuccess(response.data);
        }
      },
      onFailure: (response: any) => {
        setLoading(false);
        setError(response);
        onError(response);
      },
    });
  }, 1000);

  const result: {
    data: any;
    run: void;
    loading: boolean;
    error?: Error;
    progress?: any;
    file?: any;
  } = {
    data,
    file,
    run,
    loading,
    error,
    progress,
  };

  return result;
};
