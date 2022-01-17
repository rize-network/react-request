import React, { useState } from 'react';

export type UseRequestOption = {
  onSuccess?: (newData: any) => void;
  onError?: (newData: any) => void;
};

export function useRequest(
  service: any,
  options = {},
): {
  run: any;
  data: any;
  loading: boolean;
  error?: Error;
  params?: any;
} {
  const [data, setData] = useState(undefined);
  const [params, setParams] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]: [
    Error | null | undefined,
    React.Dispatch<React.SetStateAction<Error | null | undefined>>,
  ] = useState();

  const {
    onSuccess = (newData: any) => {
      console.log('onSuccess', { data: newData, params });
    },
    onError = (newError: Error) => {
      console.error('onError', { error: newError, params });
    },
  }: UseRequestOption = options;

  const run = (...args: any) => {
    if (loading === false) {
      setLoading(true);
      setParams(args);
      console.groupCollapsed('call ' + service.name, args);
      console.groupEnd();

      service(...args)
        .then((response: any) => {
          setError(undefined);
          setLoading(false);
          console.groupCollapsed('response ' + service.name, response);
          console.groupEnd();

          if (response.data && response.data !== undefined) {
            setData(response.data);
            onSuccess(response.data);
          }
        })
        .catch((e: Error) => {
          console.log(service.name);
          setLoading(false);
          setError(e);
          onError(e);
        });
    }
  };

  return {
    data,
    run,
    loading,
    error,
    params,
  };
}
