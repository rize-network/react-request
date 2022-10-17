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
  };

  children?: ReactNode;
  successKey?: string;
  getCache?: (key: string) => any;
  removeCache?: (key: string) => any;
  resetCache?: () => void;
  setCache?: (key: string, data: any) => void;
  ttl?: number;
  cached?: boolean;
  debug?: boolean;
  connectionStatus?: boolean;
  appStatus?: string;
};
export const RequestContext = createContext<RequestConfig>({
  defaults: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (
      _data: any,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (
      _error: Error,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.error(error);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFetch: (_params: any, _name: string, _method: HttpMethod) => {
      // console.log(params);
    },
  },
  every: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (
      _data: any,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.log(data);
      // console.log(params);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (
      _error: Error,
      _params: any,
      _name: string,
      _method: HttpMethod
    ) => {
      // console.error(error);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onFetch: (_params: any, _name: string, _method: HttpMethod) => {
      // console.log(params);
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ttl: 10 * 60 * 1000,
  cached: false,
  debug: false,
});

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({
  defaults = {},
  every = {},
  children,
  successKey,
  ttl = 10 * 60 * 1000,
  debug = false,
  connectionStatus,
  appStatus,
  cached = false,
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
        debug,
        connectionStatus,
        appStatus,
        cached,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
