import React from 'react';
import { Meta, Story } from '@storybook/react';
import { useRequest, request } from '../src';

const exempleRequest = () =>
  request({ url: 'https://reqres.in/api/products/3' });

const Request = () => {
  const ExempleUseRequest = useRequest(exempleRequest);

  console.log({ ExempleUseRequest });
  return (
    <>
      <div
        style={{
          border: '1px solid black',
          backgroundColor: 'blue',
          color: 'white',
          width: 200,
          padding: 20,
        }}
        onClick={() => ExempleUseRequest.run()}
      >
        Call API
      </div>
      <br></br>
      <div>loading :{JSON.stringify(ExempleUseRequest.loading)} </div>
      <div>error :{JSON.stringify(ExempleUseRequest.error)} </div>
      <div>data :{JSON.stringify(ExempleUseRequest.data)} </div>
    </>
  );
};

const meta: Meta = {
  title: 'Hooks',
};

export default meta;

const RequestTemplate: Story = () => <Request />;

export const RequestHook = RequestTemplate.bind({});
