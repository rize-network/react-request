import React, { ReactNode, createContext, useContext } from 'react';
import cache from 'memory-cache';

type RequestConfig = {
  onSuccess?: (data: any, params: any) => void;
  onError?: (error: Error, params: any) => void;
  onFetch?: (params: any) => void;
  children?: ReactNode;
  successKey?: string;
  getCache?: (key: string) => any;
  removeCache?: (key: string) => any;
  resetCache?: () => void;
  setCache?: (key: string, data: any) => void;
  ttl?: number;
  cached?: boolean;
  debug?: boolean;
};
export const RequestContext = createContext<RequestConfig>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess: (_data: any, _params: any) => {
    // console.log(data);
    // console.log(params);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError: (_error: Error, _params: any) => {
    // console.error(error);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFetch: (_params: any) => {
    // console.log(params);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ttl: 10 * 60 * 1000,
  cached: false,
  debug: false,
});

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({
  onSuccess,
  onError,
  onFetch,
  children,
  successKey,
  ttl = 10 * 60 * 1000,
  debug = false,
  cached = false,
}: RequestConfig): React.ReactElement => {
  return (
    <RequestContext.Provider
      value={{
        onSuccess,
        onError,
        onFetch,
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
        cached,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
