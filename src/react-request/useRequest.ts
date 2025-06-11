import { useEffect, useState, useCallback } from 'react'; // Added Dispatch, SetStateAction
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
    method: HttpMethod
  ) => void;
  onRetry?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod,
    setLoading: Function,
    setLoader: Function
  ) => void;
  onOffline?: (
    run: Function,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  onAppStatusChange?: (
    status: string,
    run: Function,
    params: any,
    name: string,
    method: HttpMethod
  ) => void;
  cached?: boolean;
  debug?: boolean;
  method?: HttpMethod;
  upload?: boolean;
  retryDelay?: number;
  successKey?: string;
  cacheMethod?: HttpMethod[];
  formErrorHandler?: (
    error: RequestError,
    values: any,
    helpers: FormikHelpers<any>
  ) => void;
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
  setData: (data: any) => void;
};

export class RequestError extends Error {
  public errors?: Record<string, string | string[]>;
  public status?: number;

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, string | string[]>
  ) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.name = 'RequestError';
  }
}

export interface UseRequestResult<T = any, R = any> {
  data: R | undefined;
  run: (params?: T) => Promise<R>;
  clear: () => void;
  loading: boolean;
  error?: RequestError;
  params: T | undefined; // Parameters of the last request
  loader?: boolean;
  method: HttpMethod;
  progress: number;
  formikConfig: Omit<FormikConfig<T>, 'initialValues' | 'validationSchema'>;
  // Added new capabilities
  refresh: () => Promise<R | void>;
  setData: (params: T) => void; // Set request parameters for the next run call
}

export const getCacheKey = (service: Function, params?: any): string => {
  return `${service.name}-${JSON.stringify(params ?? {})}`;
};

export function useRequest<T extends object = any, R = any>(
  service: any,
  options: UseRequestOption = {}
): UseRequestResult<T, R> {
  const provider = useRequestContext();
  const [data, setData] = useState<any>();
  const [params, setParams] = useState<any>();
  const [requestPayload, setRequestPayload] = useState<T | undefined>(); // Parameters set via setData
  const [helpers, setHelpers] = useState<FormikHelpers<T>>();
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

          // Clear requestPayload after using it
          if (requestPayload !== undefined) {
            setRequestPayload(undefined);
          }

          if (cached && !data && provider.getCache) {
            const key = getCacheKey(service, requestParams);
            const cachedData = provider.getCache(key);
            if (cachedData) {
              if (debug) console.log('read cache', key, cachedData);
              setData(cachedData);
              setLoading(false);
              if (onSuccess)
                onSuccess(cachedData, requestParams, service.name, method);

              if (provider.every?.onSuccess)
                provider.every?.onSuccess(
                  cachedData,
                  requestParams,
                  service.name,
                  method
                );
            }
          }

          if (debug) console.log('call ' + service.name, requestParams);
          if (onFetch) onFetch(requestParams, service.name, method);

          setError(undefined);
          const response = await service(...requestParams); // Pass all arguments to service
          setProgress(100);

          if (debug) console.log('response ' + service.name, response);

          if (
            retry === false &&
            response &&
            typeof response === 'object' &&
            response !== null &&
            (response as any)['retry'] === true
          ) {
            setRetry(true);
            if (onRetry) {
              onRetry(
                run,
                requestParams,
                service.name,
                method,
                setLoading,
                setLoader
              );
            }
            setTimeout(() => run(...requestParams), retryDelay); // Retry with the same parameters
          } else {
            const finalData =
              successKey && response ? (response as any)[successKey] : response;
            setData(finalData);
            setRetry(false);

            if (onSuccess)
              onSuccess(finalData, requestParams, service.name, method);

            if (provider.every?.onSuccess)
              provider.every?.onSuccess(
                finalData,
                requestParams,
                service.name,
                method
              );
            if (cached && provider.setCache) {
              const key = getCacheKey(service, requestParams);
              provider.setCache(key, finalData);
              if (debug) console.log('write cache', key, finalData);
            }
          }
        }
      } catch (e) {
        const err = e as any;
        const message = err?.body?.message || err.message;
        const reqError =
          err && err.body && err.body.errors
            ? new RequestError(message, err.status, err.body.errors)
            : err && message
              ? new RequestError(message, err.status)
              : new RequestError('Unknown error', err.status);
        setError(reqError);
        setData(undefined); // Clear data on error
        setProgress(0);
        if (onError) onError(reqError, requestParams, service.name, method);
        if (provider.every?.onError)
          provider.every?.onError(
            reqError,
            requestParams,
            service.name,
            method
          );

        if (helpers) {
          if (helpers.setFieldError && reqError) {
            if (reqError.errors) {
              Object.keys(reqError.errors).map((field) => {
                if (reqError.errors && reqError.errors[field] !== undefined) {
                  const errorField = reqError.errors[field] as any;
                  helpers.setFieldError(
                    field,
                    typeof errorField === 'string' ? errorField : errorField[0]
                  );
                }
              });
            } else if (reqError.message) {
              const fields = Object.keys(requestParams);
              let errorSet = false;

              fields.forEach((field) => {
                if (
                  reqError.message.toLowerCase().includes(field.toLowerCase())
                ) {
                  helpers.setFieldError(field, reqError.message);
                  errorSet = true;
                }
              });

              if (!errorSet) {
                if (fields.length > 0) {
                  helpers.setFieldError(fields[0], reqError.message);
                } else {
                  helpers.setStatus({ error: reqError.message });
                }
              }
            }
          }
          helpers.setStatus({ error: reqError.message });
        }
      } finally {
        setLoading(false);
        setLoader(false);
      }
    }, 300) as unknown as (params?: T) => Promise<R>,
    [
      // Removed imperativeRequestData
      loading,
      data, // data state for cache checking
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
      helpers,
      // setData is stable, but include if ESLint warns (usually not needed for setters from useState)
    ]
  );

  // refresh function definition
  const refresh = useCallback(async () => {
    if (dirty) {
      // Check if any request has been made
      // `params` state holds the parameters from the last `run` invocation.
      // If the last `run` was called with no arguments, `params` will be undefined.
      // The `run` function handles `undefined` params correctly for GET requests or services that don't require params.
      return run(...params);
    }
    // If no request has been made yet, do nothing
    if (debug)
      console.log('refresh called but no previous request, doing nothing.');
    return Promise.resolve(); // Return a resolved promise to match `run`'s signature
  }, [dirty, params, run, debug]); // Dependencies for refresh

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
        onOnline(run, params, service.name, method); // Pass internal setData
      } else if (!online) {
        setError(undefined);
        setLoading(false);
        setLoader(false);
        if (onOffline) onOffline(run, params, service.name, method); // Pass internal setData
      }
    }
  }, [online, dirty, params, onOnline, onOffline, run, service, method]); // setData is stable

  useEffect(() => {
    if (dirty && onAppStatusChange) {
      onAppStatusChange(status, run, params, service.name, method); // Pass internal setData
    }
  }, [status, dirty, params, onAppStatusChange, run, service, method]); // setData is stable

  const clear = useCallback(() => {
    if (cached && provider.removeCache && params) {
      const key = getCacheKey(service, params);
      provider.removeCache(key);
    }
    setData(undefined);
  }, [cached, params, provider, service, setData]); // Added setData to deps

  const handleSubmit = async (values: T, helps: FormikHelpers<T>) => {
    return new Promise<R>(async (resolve, reject) => {
      try {
        setHelpers(helps);
        const response = await run(values);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  };

  const formikConfig = {
    onSubmit: handleSubmit,
    validateOnChange: true,
    validateOnBlur: true,
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
    formikConfig,
    refresh,
    setData,
  };
}
