import React from 'react';
import { useRequest, request } from '../src';

const exempleRequest = () =>
  request({ url: 'https://reqres.in/api/products/3' });

export const RequestExemple = () => {
  const request = useRequest(exempleRequest);

  return (
    <>
      <>loading :{JSON.stringify(request.loading)} </>
      <>error :{JSON.stringify(request.error)} </>
      <>data :{JSON.stringify(request.data)} </>
    </>
  );
};
