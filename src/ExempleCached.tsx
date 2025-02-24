import React from 'react';
import { useEffect } from 'react';
import { useRequest, request } from './react-request';

const exempleRequest = () =>
  request({ url: 'https://reqres.in/api/products/3' });

export const RequestExempleCached = () => {
  const request = useRequest(exempleRequest, { cached: true });

  return (
    <>
      <button onClick={() => request.run()}>Load Cached Exemple</button>
      <br />
      <>loading :{JSON.stringify(request.loading)} </> <br />
      <>error :{JSON.stringify(request.error)} </> <br />
      <>data :{JSON.stringify(request.data)} </> <br />
    </>
  );
};
