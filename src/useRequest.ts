import React, { useState } from 'react';
import { useRequestContext } from './RequestProvider';
import { debounce } from './utils/func';

export type UseRequestOption = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFetch?: (params: any, service: string) => void;
};

export function useRequest(
  service: any,
  options = {}
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
  const provider = useRequestContext();

  const [error, setError]: [
    Error | undefined,
    React.Dispatch<React.SetStateAction<Error | undefined>>
  ] = useState();

  const {
    onSuccess = provider.onSuccess,
    onError = provider.onError,
    onFetch = provider.onFetch,
  }: UseRequestOption = options;

  const run = debounce((...args: any) => {
    if (loading === false) {
      setLoading(true);
      setParams(args);
      // console.groupCollapsed('call ' + service.name, args);
      // console.groupEnd();
      if (onFetch) onFetch(params, service.name);
      service(...args)
        .then((response: any) => {
          setError(undefined);
          setLoading(false);
          // console.groupCollapsed('response ' + service.name, response);
          // console.groupEnd();

          if (response.data && response.data !== undefined) {
            setData(response.data);
            if (onSuccess) onSuccess(response.data);
          } else if (response && response !== undefined) {
            setData(response);
            if (onSuccess) onSuccess(response);
          }
        })
        .catch((e: Error) => {
          console.log(service.name);
          setLoading(false);
          setError(e);
          if (onError) onError(e);
        });
    }
  }, 1000);

  return {
    data,
    run,
    loading,
    error,
    params,
  };
}
