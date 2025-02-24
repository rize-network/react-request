import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useRequest, request } from './react-request';

// API calls
const userApi = {
  create: (data: any) =>
    request({
      url: 'https://reqres.in/api/users',
      method: 'POST',
      params: data,
    }),

  get: (id: any) =>
    request({
      url: `https://reqres.in/api/users/${id}`,
      method: 'GET',
    }),
};

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2, 'Name too short'),
  job: Yup.string().required('Job is required'),
});

// Form value types
interface FormValues {
  name: string;
  job: string;
}

// Initial form values
const initialValues: FormValues = {
  name: '',
  job: '',
};

export const UserForm = () => {
  const { formikConfig, loading, error, data } = useRequest(userApi.create, {
    method: 'POST',
    onSuccess: (response: any) => {
      console.log('User created:', response);
      // You could redirect or show success message here
    },
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Create User</h2>

      <Formik initialValues={{}} {...formikConfig}>
        {({ errors, touched, handleSubmit }: any) => (
          <Form className="space-y-4">
            <div>
              <label className="block mb-1">Name</label>
              <Field
                name="name"
                className="w-full p-2 border rounded"
                placeholder="Enter name"
              />
              {errors.name && touched.name && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.name as string}
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1">Job</label>
              <Field
                name="job"
                className="w-full p-2 border rounded"
                placeholder="Enter job"
              />
              {errors.job && touched.job && (
                <div className="text-red-500 text-sm mt-1">
                  {errors.job as string}
                </div>
              )}
            </div>

            {/* Show API error if any */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error.message}
              </div>
            )}

            {/* Show success message if data exists */}
            {data && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                User created successfully! ID: {data.id}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full p-2 rounded text-white
                ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}
              `}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </Form>
        )}
      </Formik>

      {/* Debug Panel */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <div>Loading: {JSON.stringify(loading)}</div>
        <div>Error: {JSON.stringify(error)}</div>
        <div>Data: {JSON.stringify(data, null, 2)}</div>
      </div>
    </div>
  );
};

// Example of using both GET and POST
export const UserManager = () => {
  // For fetching user
  const getUser = useRequest(userApi.get, {
    method: 'GET',
    cached: true,
  });

  // For displaying the form
  const createUser = useRequest(userApi.create, {
    method: 'POST',
  });

  return (
    <div className="p-4">
      <div className="mb-8">
        <button
          onClick={() => getUser.run(2)}
          className="bg-green-500 text-white p-2 rounded"
        >
          Load User #2
        </button>

        <div className="mt-4">
          {getUser.loading && <div>Loading user...</div>}
          {getUser.error && <div>Error: {getUser.error.message}</div>}
          {getUser.data && (
            <div>
              <h3>User Data:</h3>
              <pre>{JSON.stringify(getUser.data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Create New User</h2>
        <UserForm />
      </div>
    </div>
  );
};
