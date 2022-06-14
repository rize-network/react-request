import React, { ReactNode, createContext, useContext } from 'react';
import cache from 'memory-cache';

type RequestConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFetch?: (params: any) => void;
  children?: ReactNode;
  successKey?: string;
  getCache?: (key: string) => any;
  setCache?: (key: string, data:any) => void;
  ttl?: number;
  cached?: boolean;
};
export const RequestContext = createContext<RequestConfig>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess: (_data: any) => {
    // console.log(data);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError: (_error: Error) => {
    // console.error(error);
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFetch: (_params: any) => {
    // console.log(params);
  },
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ttl:10 * 60 * 1000,
  cached: false
});

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({
  onSuccess,
  onError,
  onFetch,
  children,
  successKey,
  cached,
  ttl = 10 * 60 * 1000
}: RequestConfig): React.ReactElement => {

    return (
    <RequestContext.Provider
      value={{
        onSuccess,
        onError,
        onFetch,
        successKey,
        setCache:(key:string,data:any, defaultTll:number= 10 * 60 * 1000) =>{
          return cache.put(key, data,defaultTll);
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
       getCache:(key:string) =>{
          return cache.get(key);
        },
        ttl,
        cached,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
