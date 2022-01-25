import React, { ReactNode, createContext, useContext } from 'react';

type RequestConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFetch?: (params: any) => void;
  children?: ReactNode;
};
export const RequestContext = createContext<RequestConfig>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onSuccess: (data: any) => {
    console.log(data);
  },
  onError: (error: Error) => {
    console.error(error);
  },
  onFetch: (params: any) => {
    console.log(params);
  },
});

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({
  onSuccess,
  onError,
  onFetch,
  children,
}: RequestConfig): React.ReactElement => {
  return (
    <RequestContext.Provider
      value={{
        onSuccess,
        onError,
        onFetch,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
