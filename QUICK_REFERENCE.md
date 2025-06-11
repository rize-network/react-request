# React Request - Quick Reference

## Installation

```bash
npm install @app-studio/react-request
```

## Basic Usage

```jsx
import { useRequest, request } from '@app-studio/react-request';

// Define API function
const fetchUser = (id) => request({ url: `/api/users/${id}` });

// Use in component
const { data, loading, error, run } = useRequest(fetchUser);

// Trigger request
run(userId);
```

## useRequest Hook

### Returns
```jsx
const {
  data,           // Response data
  loading,        // Loading state
  error,          // Error object
  run,            // Function to trigger request
  clear,          // Clear data and cache
  refresh,        // Refresh last request
  progress,       // Progress (0-100)
  params,         // Last request parameters
  formikConfig    // Formik integration
} = useRequest(service, options);
```

### Common Options
```jsx
useRequest(service, {
  cached: true,           // Enable caching
  method: 'POST',         // HTTP method
  debug: true,            // Debug logging
  onSuccess: (data) => {}, // Success callback
  onError: (error) => {}, // Error callback
  retryDelay: 5000       // Retry delay in ms
});
```

## Request Function

```jsx
request({
  url: '/api/endpoint',
  method: 'POST',         // GET, POST, PUT, DELETE, etc.
  params: { key: 'value' }, // Request body/query params
  headers: { 'Authorization': 'Bearer token' },
  json: true,             // JSON mode (default: true)
  cacheControl: true      // Cache control (default: true)
});
```

## Provider Setup

```jsx
import { RequestProvider } from '@app-studio/react-request';

function App() {
  return (
    <RequestProvider
      cached={true}
      debug={true}
      defaults={{
        onError: (error) => console.error(error)
      }}
    >
      <YourApp />
    </RequestProvider>
  );
}
```

## Common Patterns

### GET Request with Caching
```jsx
const { data, loading, run } = useRequest(
  () => request({ url: '/api/users' }),
  { cached: true }
);

useEffect(() => run(), []);
```

### POST Request
```jsx
const { run: createUser, loading } = useRequest(
  (userData) => request({
    url: '/api/users',
    method: 'POST',
    params: userData
  }),
  { method: 'POST' }
);

// Usage: createUser({ name: 'John', email: 'john@example.com' })
```

### Form Integration
```jsx
import { Formik, Form, Field } from 'formik';

const { formikConfig, loading, error } = useRequest(createUser, {
  method: 'POST',
  onSuccess: () => alert('Success!')
});

<Formik initialValues={{}} {...formikConfig}>
  <Form>
    <Field name="name" />
    <button type="submit" disabled={loading}>Submit</button>
  </Form>
</Formik>
```

### Error Handling
```jsx
const { error, run } = useRequest(apiCall, {
  onError: (error, params, name, method) => {
    if (error.status === 401) {
      // Handle unauthorized
    } else if (error.status === 422) {
      // Handle validation errors
      console.log(error.errors);
    }
  }
});
```

### File Upload with Progress
```jsx
const { run: upload, progress, loading } = useRequest(
  (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request({
      url: '/api/upload',
      method: 'POST',
      params: formData,
      json: false
    });
  },
  {
    upload: true,
    onProgress: (progress) => console.log(`${progress}%`)
  }
);
```

### Search with Debouncing
```jsx
const [query, setQuery] = useState('');
const { data: results, loading, run: search } = useRequest(
  (term) => request({ url: `/api/search?q=${term}` }),
  { cached: true }
);

useEffect(() => {
  if (query.length > 2) {
    search(query); // Automatically debounced
  }
}, [query]);
```

### Custom Hook Pattern
```jsx
function useUsers() {
  const { data: users, loading, run: loadUsers, refresh } = useRequest(
    () => request({ url: '/api/users' }),
    { cached: true }
  );

  const { run: deleteUser } = useRequest(
    (id) => request({ url: `/api/users/${id}`, method: 'DELETE' }),
    {
      method: 'DELETE',
      onSuccess: refresh
    }
  );

  return { users, loading, loadUsers, deleteUser };
}
```

## TypeScript

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const { data, run } = useRequest<{ id: string }, User>(
  (params) => request({ url: `/api/users/${params.id}` })
);
```

## Debugging

```jsx
// Global debug
<RequestProvider debug={true}>

// Per request debug
useRequest(service, { debug: true });
```

## Cache Management

```jsx
const { clear } = useRequest(service, { cached: true });

// Clear specific request cache
clear();

// Clear all cache (via provider)
const provider = useRequestContext();
provider.resetCache();
```

## Network Awareness

```jsx
useRequest(service, {
  onOffline: (run, params) => {
    // Handle offline state
  },
  onOnline: (run, params) => {
    // Handle back online
  }
});
```

## Retry Logic

```jsx
useRequest(service, {
  retryDelay: 5000,
  onRetry: (run, params) => {
    console.log('Retrying...');
  }
});
```

## Best Practices

1. **Use RequestProvider** for global configuration
2. **Create service modules** for API calls
3. **Use custom hooks** for complex logic
4. **Enable caching** for GET requests
5. **Handle errors globally** in provider
6. **Use TypeScript** for better type safety
7. **Cleanup with clear()** when needed

## Common Issues

- **Not caching**: Check `cached: true` and `cacheMethod` includes your HTTP method
- **Form errors**: Ensure proper `formErrorHandler` setup
- **Memory leaks**: Use `clear()` in cleanup functions
- **TypeScript errors**: Properly type your service functions

For detailed documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)
