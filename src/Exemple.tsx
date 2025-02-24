import React from 'react';
import { useRequest, request } from './react-request';

const exempleRequest = () =>
  request({ url: 'https://reqres.in/api/products/3' });

export const RequestExemple = () => {
  const request = useRequest(exempleRequest, { cached: true });

  return (
    <>
      <button onClick={() => request.run()}>Load Exemple</button>
      <br />
      <>loading :{JSON.stringify(request.loading)} </> <br />
      <>error :{JSON.stringify(request.error)} </> <br />
      <>data :{JSON.stringify(request.data)} </> <br />
    </>
  );
};
