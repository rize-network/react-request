import React, { useEffect, useState } from 'react';
import { useRequestContext } from './RequestProvider';
import { debounce } from './utils/func';

export type UseRequestOption = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFetch?: (params: any, service: string) => void;
  cached?:boolean;
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
  cached?:boolean;
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
    cached = provider.cached
  }: UseRequestOption = options;

  const run = debounce((...args: any) => {
   
    if (loading === false) {
      setLoading(true);
      setParams(args);
      if(cached && data === undefined && provider.getCache){
        const key = service.name+JSON.stringify(args);
        const cachedData = provider.getCache(key);
        if(cachedData){
          console.log('read cache', key,cachedData)
          setData(cachedData);
          setLoading(false);
        }
      }
      // console.groupCollapsed('call ' + service.name, args);
      // console.groupEnd();
      if (onFetch) onFetch(params, service.name);
      service(...args)
        .then((response: any) => {
          setError(undefined);
          setLoading(false);
          // console.groupCollapsed('response ' + service.name, response);
          // console.groupEnd();

          if (response && response !== undefined) {
            if (
              provider.successKey &&
              response[provider.successKey] !== undefined
            ) {
              setData(response[provider.successKey]);
              if (onSuccess) onSuccess(response[provider.successKey]);
              if(response[provider.successKey] && provider){
                if(provider.setCache) {
                 const key = service.name+JSON.stringify(args);
           
                  provider.setCache(key,response[provider.successKey]);
                  console.log('write cache', key,response[provider.successKey])
           
                }
               }
            } else {
              setData(response);
              if (onSuccess) onSuccess(response);
              if(response && provider){
                if(provider.setCache) {
                 const key = service.name+JSON.stringify(args);
           
                  provider.setCache(key,response);
                  console.log('write cache', key,response)
           
                }
               }
            }
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
