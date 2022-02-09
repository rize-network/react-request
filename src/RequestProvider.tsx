import React, { ReactNode, createContext, useContext } from 'react';

type RequestConfig = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onFetch?: (params: any) => void;
  children?: ReactNode;
  successKey?: string;
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
});

export const useRequestContext = () => useContext(RequestContext);

export const RequestProvider = ({
  onSuccess,
  onError,
  onFetch,
  children,
  successKey,
}: RequestConfig): React.ReactElement => {
  return (
    <RequestContext.Provider
      value={{
        onSuccess,
        onError,
        onFetch,
        successKey,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};
