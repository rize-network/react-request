/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useEffect, useState } from 'react';
import { useRequestContext } from './RequestProvider';
import { debounce } from './utils/func';

export type UseRequestOption = {
  onSuccess?: (
    data: any,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  onError?: (
    error: Error,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  onFetch?: (params: any, name: string, method: HttpMethod) => void;
  onProgress?: (
    progression: number,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  onOnline?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setData: Function
  ) => void;
  onRetry?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setLoading: Function,
    setLoader: Function,
    setData: Function
  ) => void;
  onOffline?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setData: Function
  ) => void;
  onAppStatusChange?: (
    status: string,
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setData: Function
  ) => void;
  cached?: boolean;
  debug?: boolean;
  method?: HttpMethod;
  upload?: boolean;
  cacheMethod?: HttpMethod[];
};

export type HttpMethod =
  | 'GET'
  | 'PUT'
  | 'POST'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'PATCH';

export type UseRequestProperties = {
  run: any;
  data: any;
  loading: boolean;
  progress: number;
  clear?: any;
  loader?: boolean;
  method?: HttpMethod;
  error?: Error;
  params?: any;
  cached?: boolean;
  debug?: boolean;
};

export const getCacheKey = (service: Function, params: any) => {
  return service.name + JSON.stringify(params);
};

export type UseOnEveryOptions = {
  onEverySuccess?: (
    data: any,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  onEveryError?: (
    error: Error,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  onEveryFetch?: (params: any, name: string, method: HttpMethod) => void;
  onEveryOnline?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setData: Function
  ) => void;
  onEveryOffline?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setData: Function
  ) => void;
  onEveryRetry?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setLoading: Function,
    setLoader: Function,
    setData: Function
  ) => void;
  onEveryAppStatusChange?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setData: Function
  ) => void;
};

export function useRequest(
  service: any,
  options: UseRequestOption = {}
): UseRequestProperties {
  const provider = useRequestContext();
  const [data, setData] = useState(undefined);
  const [params, setParams] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [online, setOnline] = useState(true);
  const [retry, setRetry] = useState(true);
  const [status, setAppStatus]: [string, Function] = useState('active');

  const [loader, setLoader]: [boolean | undefined, Function] = useState();

  const [error, setError]: [
    Error | undefined,
    React.Dispatch<React.SetStateAction<Error | undefined>>
  ] = useState();

  const {
    onSuccess = provider.defaults?.onSuccess,
    onError = provider.defaults?.onError,
    onFetch = provider.defaults?.onFetch,
    onProgress = provider.defaults?.onProgress,
    onOffline = provider.defaults?.onOffline,
    onOnline = provider.defaults?.onOnline,
    onAppStatusChange = provider.defaults?.onAppStatusChange,
    onRetry = provider.defaults?.onRetry,
    cached = provider.cacheMethod?.includes(
      options.method ? options.method : 'GET'
    )
      ? provider.cached
      : false,
    debug = provider.debug,
    method = 'GET',
  }: UseRequestOption = options;

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: onEverySuccess = (
      _data: any,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: onEveryError = (
      _error: Error,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFetch: onEveryFetch = (
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOffline: onEveryOffline = (
      _run: Function,
      _params: any,
      _name: string,
      _method: HttpMethod,
      _setData: Function
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onOnline: onEveryOnline = (
      _run: Function,
      _params: any,
      _name: string,
      _method: HttpMethod,
      _setData: Function
    ) => {
      // console.log(data);
      // console.log(params);
    },
    onRetry: onEveryRetry = (
      _run: Function,
      _params: any,
      _name: string,
      _method: HttpMethod,
      _setData: Function
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAppStatusChange: onEveryAppStatusChange = (
      _status: string,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.log(data);
      // console.log(params);
    },
  } = provider.every ? provider.every : {};

  const run: any = debounce((args: any) => {
    setDirty(true);
    setProgress(0);
    if (onProgress) onProgress(0, args, service.name, method);
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
      setLoader(true);
      setParams(args);

      if (debug) console.groupCollapsed('call ' + service.name, args);
      if (debug) console.groupEnd();
      if (onFetch) onFetch(args, service.name, method);
      if (onEveryFetch) onEveryFetch(args, service.name, method);

      service(...args, setProgress)
        .then((response: any) => {
          setError(undefined);
          setLoading(false);
          setLoader(false);
          setProgress(100);

          if (debug)
            console.groupCollapsed('response ' + service.name, response);
          if (debug) console.groupEnd();

          if (retry == false && response && response['retry']) {
            setRetry(true);
            if (onRetry) {
              onRetry(
                run,
                params,
                service.name,
                method,
                setLoading,
                setLoader,
                setData
              );
            } else if (onEveryRetry) {
              onEveryRetry(
                run,
                params,
                service.name,
                method,
                setLoading,
                setLoader,
                setData
              );
            }
          } else if (
            response &&
            response !== undefined &&
            provider.successKey &&
            response[provider.successKey] !== undefined
          ) {
            setData(response[provider.successKey]);
            setRetry(false);
            if (onSuccess)
              onSuccess(
                response[provider.successKey],
                args,
                service.name,
                method
              );
            if (onEverySuccess)
              onEverySuccess(
                response[provider.successKey],
                args,
                service.name,
                method
              );
            if (response[provider.successKey] && provider) {
              if (provider.setCache) {
                const key = getCacheKey(service, args);

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
            setRetry(false);
            if (onSuccess) onSuccess(response, args, service.name, method);
            if (onEverySuccess)
              onEverySuccess(response, args, service.name, method);
            if (response && provider) {
              if (provider.setCache) {
                const key = getCacheKey(service, args);

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
          setData(undefined);
          setLoader(false);
          if (onError) onError(e, args, service.name, method);
          if (onEveryError) onEveryError(e, args, service.name, method);
        });
    }
  }, 1000);

  useEffect(() => {
    if (
      provider.connectionStatus !== online &&
      typeof provider.connectionStatus === 'boolean'
    ) {
      setOnline(provider.connectionStatus);
    }
  }, [provider.connectionStatus]);

  useEffect(() => {
    if (provider.appStatus !== status) {
      setAppStatus(provider.appStatus);
    }
  }, [provider.appStatus]);

  useEffect(() => {
    if (onAppStatusChange && dirty) {
      onAppStatusChange(status, run, params, service.name, method, setData);
    }
    if (onEveryAppStatusChange && dirty) {
      onEveryAppStatusChange(
        status,
        run,
        params,
        service.name,
        method,
        setData
      );
    }
  }, [status]);

  useEffect(() => {
    if (online === true) {
      if (onOnline && dirty) {
        onOnline(run, params, service.name, method, setData);
      }
      if (onEveryOnline && dirty) {
        onEveryOnline(run, params, service.name, method, setData);
      }
    } else if (online === false) {
      setError(undefined);
      setLoading(false);
      setLoader(false);
      if (onOffline && dirty) {
        onOffline(run, params, service.name, method, setData);
      }
      if (onEveryOffline && dirty) {
        onEveryOffline(run, params, service.name, method, setData);
      }
    }
  }, [online]);

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
    loader,
    method,
    progress,
  };
}
