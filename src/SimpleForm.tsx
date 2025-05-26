import React from 'react';
import { Formik, Form, Field, FormikProps } from 'formik';
import { useRequest, request } from './react-request';

const exampleRequest = (data: any) =>
  request({
    url: 'https://reqres.in/api/users',
    method: 'POST',
    params: data,

    headers: { 'x-api-key': 'reqres-free-v1' },
  });

export const SimpleForm = () => {
  const { formikConfig, loading, error, data } = useRequest(exampleRequest, {
    method: 'POST',
  });

  return (
    <div>
      <Formik
        initialValues={{
          name: '',
          job: '',
        }}
        {...formikConfig}
      >
        {({ handleSubmit }) => (
          <Form>
            <div>
              <Field name="name" placeholder="Name" />
            </div>

            <div>
              <Field name="job" placeholder="Job" />
            </div>

            {error && <div style={{ color: 'red' }}>{error.message}</div>}

            {data && (
              <div style={{ color: 'green' }}>
                Success! User created with ID: {data.id}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit as any}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </Form>
        )}
      </Formik>

      <div style={{ marginTop: 20 }}>
        <div>Loading: {JSON.stringify(loading)}</div>
        <div>Error: {JSON.stringify(error)}</div>
        <div>Data: {JSON.stringify(data)}</div>
      </div>
    </div>
  );
};
