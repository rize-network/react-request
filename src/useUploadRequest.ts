import { useState } from 'react';
import _ from 'lodash';
import { upload } from 'src/utils/upload';

export const useUploadRequest = function (url, options = {}) {
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

  const run = _.debounce((newFile) => {
    setLoading(true);
    setProgress(0);
    setFile(newFile);
    upload({
      file: newFile,
      url,
      onProgress: (newProgress: number) => {
        setProgress(newProgress);
      },
      onSuccess: (response) => {
        setError(undefined);
        setLoading(false);
        if (response.data && response.data !== undefined) {
          setData(response.data);
          onSuccess(response.data);
        }
      },
      onFailure: (response) => {
        setLoading(false);
        setError(response);
        onError(response);
      },
    });
  }, 1000);

  const result: {
    data: any;
    run: Function;
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
