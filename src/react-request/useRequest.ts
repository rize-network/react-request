import { useEffect, useState, useCallback } from 'react';
import { useRequestContext } from './RequestProvider';
import { debounce } from './utils/func';
import { FormikConfig, FormikHelpers } from 'formik';

export type HttpMethod =
  | 'GET'
  | 'PUT'
  | 'POST'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  | 'PATCH';
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
  retryDelay?: number;
  successKey?: string;
  cacheMethod?: HttpMethod[];
};

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
  formikConfig: Omit<FormikConfig<any>, 'initialValues' | 'validationSchema'>;
};

export class RequestError extends Error {
  public errors?: Record<string, string | string[]>;
  public status?: number;

  constructor(
    message: string,
    errors?: Record<string, string | string[]>,
    status?: number
  ) {
    super(message);
    this.errors = errors;
    this.status = status;
    this.name = 'RequestError';
  }
}

export interface UseRequestResult<T = any, R = any> {
  data: R | undefined;
  run: (params?: T) => Promise<R>;
  clear: () => void;
  loading: boolean;
  error?: RequestError;
  params: T | undefined;
  loader?: boolean;
  method: HttpMethod;
  progress: number;
  formikConfig: Omit<FormikConfig<T>, 'initialValues' | 'validationSchema'>;
}

function createFormikConfig<T extends object, R = any>(
  run: (params?: T) => Promise<R>,
  _options: UseRequestOption
): Omit<FormikConfig<T>, 'initialValues' | 'validationSchema'> {
  const handleSubmit = async (values: T, helpers: FormikHelpers<T>) => {
    try {
      const response = await run(values);
      return response;
    } catch (error) {
      const requestError = error as RequestError;
      if (helpers.setFieldError) {
        if (requestError.errors) {
          Object.entries(requestError.errors).forEach(([field, message]) => {
            if (Object.prototype.hasOwnProperty.call(values, field)) {
              helpers.setFieldError(
                field,
                Array.isArray(message) ? message[0] : message
              );
            }
          });
        } else if (requestError.message) {
          const fields = Object.keys(values);
          let errorSet = false;
          fields.forEach((field) => {
            if (
              requestError.message.toLowerCase().includes(field.toLowerCase())
            ) {
              helpers.setFieldError(field, requestError.message);
              errorSet = true;
            }
          });
          if (!errorSet && fields.length > 0) {
            helpers.setFieldError(fields[0], requestError.message);
          }
        }
      }

      throw error;
    }
  };

  return {
    onSubmit: handleSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  };
}

export const getCacheKey = (service: Function, params?: any): string => {
  return `${service.name}-${JSON.stringify(params ?? {})}`;
};

export function useRequest<T extends object = any, R = any>(
  service: any,
  options: UseRequestOption = {}
): UseRequestResult<T, R> {
  const provider = useRequestContext();
  const [data, setData] = useState<R>();
  const [params, setParams] = useState<T>();
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [online, setOnline] = useState(true);
  const [retry, setRetry] = useState(true);
  const [status, setAppStatus] = useState('active');
  const [loader, setLoader] = useState<boolean>();
  const [error, setError] = useState<RequestError>();

  const {
    onSuccess = provider?.defaults?.onSuccess,
    onError = provider?.defaults?.onError,
    onFetch = provider?.defaults?.onFetch,
    onProgress = provider?.defaults?.onProgress,
    onOffline = provider?.defaults?.onOffline,
    onOnline = provider?.defaults?.onOnline,
    onAppStatusChange = provider?.defaults?.onAppStatusChange,
    onRetry = provider?.defaults?.onRetry,
    retryDelay = provider.retryDelay,
    cached = provider.cacheMethod &&
    provider.cacheMethod.includes(options.method || 'GET')
      ? provider.cached
      : false,
    debug = provider.debug,
    method = 'GET',
    successKey = provider.successKey,
  } = options;

  const run = useCallback(
    debounce(async (...requestParams: any) => {
      try {
        setDirty(true);
        setProgress(0);
        if (onProgress) onProgress(0, requestParams, service.name, method);

        if (!loading) {
          setLoading(true);
          setLoader(true);
          setParams(requestParams);

          if (cached && !data && provider.getCache) {
            const key = getCacheKey(service, requestParams);
            const cachedData = provider.getCache(key);
            if (cachedData) {
              if (debug) console.log('read cache', key, cachedData);
              setData(cachedData);
              setLoading(false);
              return cachedData;
            }
          }

          if (debug) console.log('call ' + service.name, requestParams);
          if (onFetch) onFetch(requestParams, service.name, method);

          const response = await service(...requestParams);
          setError(undefined);
          setProgress(100);

          if (debug) console.log('response ' + service.name, response);

          if (
            retry === false &&
            response &&
            typeof response === 'object' &&
            response !== null &&
            'retry' in response
          ) {
            setRetry(true);
            if (onRetry) {
              onRetry(
                run,
                requestParams,
                service.name,
                method,
                setLoading,
                setLoader,
                setData
              );
            } else {
              setTimeout(() => run(requestParams), retryDelay);
            }
          } else {
            const finalData =
              successKey && response ? (response as any)[successKey] : response;
            setData(finalData);
            setRetry(false);

            if (onSuccess)
              onSuccess(finalData, requestParams, service.name, method);

            if (cached && provider.setCache) {
              const key = getCacheKey(service, requestParams);
              provider.setCache(key, finalData);
              if (debug) console.log('write cache', key, finalData);
            }

            return finalData;
          }
        }
      } catch (e) {
        // if (debug) console.error(service.name, reqError);
        setError(e as RequestError);
        setData(undefined);
        setProgress(0);
        if (onError)
          onError(e as RequestError, requestParams, service.name, method);
        throw e;
      } finally {
        setLoading(false);
        setLoader(false);
      }
    }, 300) as unknown as (params?: T) => Promise<R>,
    [
      loading,
      data,
      cached,
      retry,
      onSuccess,
      onError,
      onFetch,
      onProgress,
      onRetry,
      provider,
      service,
      method,
      retryDelay,
      debug,
      successKey,
    ]
  );

  useEffect(() => {
    if (
      provider.connectionStatus !== online &&
      typeof provider.connectionStatus === 'boolean'
    ) {
      setOnline(provider.connectionStatus);
    }
  }, [provider.connectionStatus, online]);

  useEffect(() => {
    if (provider.appStatus !== status) {
      setAppStatus(provider.appStatus || 'active');
    }
  }, [provider.appStatus, status]);

  useEffect(() => {
    if (dirty) {
      if (online && onOnline) {
        onOnline(run, params, service.name, method, setData);
      } else if (!online) {
        setError(undefined);
        setLoading(false);
        setLoader(false);
        if (onOffline) onOffline(run, params, service.name, method, setData);
      }
    }
  }, [online, dirty, params, onOnline, onOffline, run, service, method]);

  useEffect(() => {
    if (dirty && onAppStatusChange) {
      onAppStatusChange(status, run, params, service.name, method, setData);
    }
  }, [status, dirty, params, onAppStatusChange, run, service, method]);

  const clear = useCallback(() => {
    if (cached && provider.removeCache && params) {
      const key = getCacheKey(service, params);
      provider.removeCache(key);
    }
    setData(undefined);
  }, [cached, params, provider, service]);

  const formikConfig = createFormikConfig(run, options);

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
    formikConfig,
  };
}
