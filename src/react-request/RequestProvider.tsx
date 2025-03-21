/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, createContext, useContext } from 'react';
import cache from 'memory-cache';
import { HttpMethod } from './useRequest';

type RequestConfig = {
  defaults?: {
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
    onRetry?: (
      run: Function,
      params: any,
      name: string,
      method: HttpMethod,
      setLoading: Function,
      setLoader: Function,
      setData: Function
    ) => void;
  };
  every?: {
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
  };

  children?: ReactNode;
  successKey?: string;
  getCache?: (key: string) => any;
  removeCache?: (key: string) => any;
  resetCache?: () => void;
  setCache?: (key: string, data: any) => void;
  ttl?: number;
  retryDelay?: number;
  cached?: boolean;
  debug?: boolean;
  connectionStatus?: boolean;
  appStatus?: string;
  cacheMethod?: HttpMethod[];
};
export const RequestContext = createContext<RequestConfig>({
  defaults: {},
  every: {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ttl: 10 * 60 * 1000,
  retryDelay: 10 * 1000,
  cached: false,
  debug: false,
  cacheMethod: ['GET'],
});

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({
  defaults = {},
  every = {},
  children,
  successKey,
  ttl = 10 * 60 * 1000,
  retryDelay = 10 * 1000,
  debug = false,
  connectionStatus,
  appStatus,
  cached = false,
  cacheMethod = ['GET'],
}: RequestConfig): React.ReactElement => {
  return (
    <RequestContext.Provider
      value={{
        every,
        defaults,
        successKey,
        setCache: (key: string, data: any, defaultTll: number = ttl) => {
          return cache.put(key, data, defaultTll);
        },
        removeCache: (key: string) => {
          return cache.del(key);
        },
        resetCache: () => {
          return cache.clear();
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getCache: (key: string) => {
          return cache.get(key);
        },
        ttl,
        retryDelay,
        debug,
        connectionStatus,
        appStatus,
        cached,
        cacheMethod,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
