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
  // Added new option for custom error handling
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
  params: T | undefined;
  loader?: boolean;
  method: HttpMethod;
  progress: number;
  formikConfig: Omit<FormikConfig<T>, 'initialValues' | 'validationSchema'>;
  refresh: () => Promise<R | void>;
  setRequestData: (data: T) => void;
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
  const [lastRequestParams, setLastRequestParams] = useState<T>();
  const [requestPayload, setRequestPayload] = useState<T | undefined>();
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
    debounce(async (runTimeParams?: T) => {
      let actualParams: T | undefined = undefined;

      if (requestPayload !== undefined) {
        actualParams = requestPayload;
      } else {
        actualParams = runTimeParams;
      }

      // It's possible actualParams is still undefined if neither requestPayload nor runTimeParams are provided.
      // The service function needs to handle this possibility if params are optional.

      try {
        setDirty(true);
        setProgress(0);
        
        // Store the actual parameters being used for the request
        if (actualParams !== undefined) {
          setLastRequestParams(actualParams);
          setParams(actualParams);
        }


        if (onProgress) onProgress(0, actualParams, service.name, method);

        if (!loading) {
          setLoading(true);
          setLoader(true);

          if (cached && !data && provider.getCache && actualParams !== undefined) {
            const key = getCacheKey(service, actualParams);
            const cachedData = provider.getCache(key);
            if (cachedData) {
              if (debug) console.log('read cache', key, cachedData);
              setData(cachedData);
              setLoading(false);
              if (onSuccess)
                onSuccess(cachedData, actualParams, service.name, method);

              if (provider.every?.onSuccess)
                provider.every?.onSuccess(
                  cachedData,
                  actualParams,
                  service.name,
                  method
                );
            }
          }

          if (debug) console.log('call ' + service.name, actualParams);
          if (onFetch) onFetch(actualParams, service.name, method);

          setError(undefined);
          const response = await service(actualParams);
          setProgress(100);

          if (debug) console.log('response ' + service.name, response);

          if (
            retry === false &&
            response &&
            typeof response === 'object' &&
            response !== null &&
            response['retry'] === true
          ) {
            setRetry(true);
            if (onRetry) {
              onRetry(
                run,
                actualParams,
                service.name,
                method,
                setLoading,
                setLoader,
                setData
              );
            }

            setTimeout(() => run(actualParams), retryDelay);
          } else {
            const finalData =
              successKey && response ? (response as any)[successKey] : response;
            setData(finalData);
            setRetry(false);

            if (onSuccess)
              onSuccess(finalData, actualParams, service.name, method);

            if (provider.every?.onSuccess)
              provider.every?.onSuccess(
                finalData,
                actualParams,
                service.name,
                method
              );
            if (cached && provider.setCache && actualParams !== undefined) {
              const key = getCacheKey(service, actualParams);
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
        setData(undefined);
        setProgress(0);
        if (onError) onError(reqError, actualParams, service.name, method);
        if (provider.every?.onError)
          provider.every?.onError(
            reqError,
            actualParams,
            service.name,
            method
          );
        // Default error handling
        if (helpers) {
          if (helpers.setFieldError && reqError) {
            // Handle error mapping to specific form fields
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
              // Try to match error message to field names
              const fields = actualParams ? Object.keys(actualParams) : [];
              let errorSet = false;

              fields.forEach((field) => {
                if (
                  reqError.message.toLowerCase().includes(field.toLowerCase())
                ) {
                  helpers.setFieldError(field, reqError.message);
                  errorSet = true;
                }
              });

              // If no specific field error was set, set it on the first field or use setStatus
              if (!errorSet) {
                if (fields.length > 0) {
                  helpers.setFieldError(fields[0], reqError.message);
                } else {
                  // If no fields available, set form-level status
                  helpers.setStatus({ error: reqError.message });
                }
              }
            }
          }

          // Always set form error status for access in the UI
          helpers.setStatus({ error: reqError.message });
        }

        // Use custom error handler if provided
      } finally {
        setLoading(false);
        setLoader(false);
        // Reset requestPayload after the run execution (success or failure)
        if (requestPayload !== undefined) {
          setRequestPayload(undefined);
        }
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
      requestPayload, // Added requestPayload to dependency array
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

  const handleSubmit = async (values: T, helps: FormikHelpers<T>) => {
    return new Promise(async (resolve, reject) => {
      try {
        setHelpers(helps);
        const response = run(values);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Pass the complete options to createFormikConfig
  const formikConfig = {
    onSubmit: handleSubmit,
    validateOnChange: true,
    validateOnBlur: true,
  };

  const refresh = useCallback(async () => {
    if (lastRequestParams !== undefined) {
      // Assuming run expects parameters as a single object 'T' if not using spread
      return run(lastRequestParams);
    } else {
      if (debug) {
        console.warn(
          'useRequest: refresh called without prior request to store parameters.'
        );
      }
      // Return a resolved promise or handle as appropriate for your app's logic
      return Promise.resolve();
    }
  }, [run, lastRequestParams, debug]);

  const setRequestData = useCallback((data: T) => {
    setRequestPayload(data);
  }, []);

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
    setRequestData,
  };
}
