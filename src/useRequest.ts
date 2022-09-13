import React, { useEffect, useState } from 'react';
import { useRequestContext } from './RequestProvider';
import { debounce } from './utils/func';

export type UseRequestOption = {
  onSuccess?: (data: any, params: any) => void;
  onError?: (error: Error, params: any) => void;
  onFetch?: (params: any, service: string) => void;
  onOnline?: (run: Function, params: any, setData?: Function) => void;
  onOffline?: (run: Function, params: any, setData?: Function) => void;
  cached?: boolean;
  debug?: boolean;
};

export function useRequest(
  service: any,
  options = {}
): {
  run: any;
  clear: any;
  data: any;
  loading: boolean;
  error?: Error;
  params?: any;
  cached?: boolean;
  debug?: boolean;
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
    onOffline = provider.onOffline,
    onOnline = provider.onOnline,
    cached = provider.cached,
    debug = provider.debug,
  }: UseRequestOption = options;

  const run: any = debounce((...args: any) => {
    if (loading === false) {
      setLoading(true);
      if (cached && data === undefined && provider.getCache) {
        const key = service.name + JSON.stringify(args);
        const cachedData = provider.getCache(key);
        if (cachedData) {
          if (debug) console.log('read cache', key, cachedData);
          setData(cachedData);
          setLoading(false);
        }
      }
      setParams(args);

      if (debug) console.groupCollapsed('call ' + service.name, args);
      if (debug) console.groupEnd();
      if (onFetch) onFetch(args, service.name);
      if (provider.onlineStatus === undefined || provider.onlineStatus) {
        service(...args)
          .then((response: any) => {
            setError(undefined);
            setLoading(false);
            if (debug)
              console.groupCollapsed('response ' + service.name, response);
            if (debug) console.groupEnd();

            if (
              response &&
              response !== undefined &&
              provider.successKey &&
              response[provider.successKey] !== undefined
            ) {
              setData(response[provider.successKey]);
              if (onSuccess) onSuccess(response[provider.successKey], args);
              if (response[provider.successKey] && provider) {
                if (provider.setCache) {
                  const key = service.name + JSON.stringify(args);

                  if (cached) {
                    provider.setCache(key, response[provider.successKey]);
                    if (debug)
                      console.log(
                        'write cache',
                        key,
                        response[provider.successKey]
                      );
                  }
                }
              }
            } else {
              setData(response);
              if (onSuccess) onSuccess(response, args);
              if (response && provider) {
                if (provider.setCache) {
                  const key = service.name + JSON.stringify(args);

                  if (cached) {
                    provider.setCache(key, response);
                    if (debug) console.log('write cache', key, response);
                  }
                }
              }
            }
          })
          .catch((e: Error) => {
            if (debug) console.log(service.name, e);
            setLoading(false);
            setError(e);
            if (onError) onError(e, args);
          });
      }
    }
  }, 1000);

  useEffect(() => {
    if (provider.onlineStatus === true) {
      if (onOnline) {
        onOnline(run, params, setData);
      }
    } else if (provider.onlineStatus === false) {
      setError(undefined);
      setLoading(false);

      if (onOffline) {
        onOffline(run, params, setData);
      }
    }
  }, [provider.onlineStatus]);

  const clear = () => {
    if (cached && provider.removeCache) {
      const key = service.name + JSON.stringify(params);
      provider.removeCache(key);
    }
    setData(undefined);
  };

  return {
    data,
    run,
    clear,
    loading,
    error,
    params,
  };
}
