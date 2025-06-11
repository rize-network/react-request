# React Request Documentation

A powerful React hook library for managing HTTP requests with built-in caching, error handling, loading states, and form integration.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Features

✨ **Key Features:**
- 🎣 **React Hooks** - Modern React hooks API for data fetching
- 🚀 **TypeScript Support** - Full TypeScript support with type safety
- 💾 **Built-in Caching** - Automatic request caching with configurable TTL
- 🔄 **Loading States** - Automatic loading and progress tracking
- ❌ **Error Handling** - Comprehensive error handling with retry logic
- 📝 **Form Integration** - Seamless Formik integration for forms
- 🌐 **Network Awareness** - Online/offline status handling
- 🔧 **Configurable** - Highly customizable with global and per-request options
- 🎯 **Debouncing** - Built-in request debouncing
- 📊 **Progress Tracking** - Upload/download progress monitoring

## Installation

```bash
npm install @app-studio/react-request
```

### Peer Dependencies

```bash
npm install react formik
```

## Quick Start

### 1. Basic Setup

```jsx
import React from 'react';
import { useRequest, request } from '@app-studio/react-request';

// Define your API function
const fetchUser = (id) => 
  request({
    url: `https://api.example.com/users/${id}`,
    method: 'GET'
  });

// Use in component
function UserProfile({ userId }) {
  const { data, loading, error, run } = useRequest(fetchUser);

  React.useEffect(() => {
    run(userId);
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### 2. With Provider (Recommended)

```jsx
import React from 'react';
import { RequestProvider } from '@app-studio/react-request';

function App() {
  return (
    <RequestProvider
      cached={true}
      debug={true}
      defaults={{
        onError: (error) => console.error('Request failed:', error),
        onSuccess: (data) => console.log('Request succeeded:', data)
      }}
    >
      <UserProfile userId="123" />
    </RequestProvider>
  );
}
```

## API Reference

### useRequest Hook

The main hook for making HTTP requests.

```typescript
function useRequest<T, R>(
  service: (...args: any[]) => Promise<R>,
  options?: UseRequestOption
): UseRequestResult<T, R>
```

#### Parameters

- **service**: Function that returns a Promise (your API call)
- **options**: Configuration options (optional)

#### Returns

```typescript
interface UseRequestResult<T, R> {
  data: R | undefined;           // Response data
  run: (params?: T) => Promise<R>; // Function to trigger request
  clear: () => void;             // Clear data and cache
  loading: boolean;              // Loading state
  error?: RequestError;          // Error object
  params: T | undefined;         // Last request parameters
  loader?: boolean;              // Alternative loading state
  method: HttpMethod;            // HTTP method
  progress: number;              // Progress (0-100)
  refresh: () => Promise<R | void>; // Refresh last request
  setData: (params: T) => void;  // Set parameters for next run
  formikConfig: FormikConfig;    // Formik integration config
}
```

### UseRequestOption

Configuration options for the useRequest hook.

```typescript
interface UseRequestOption {
  // Lifecycle callbacks
  onSuccess?: (data: any, params: any, name: string, method: HttpMethod) => void;
  onError?: (error: Error, params: any, name: string, method: HttpMethod) => void;
  onFetch?: (params: any, name: string, method: HttpMethod) => void;
  onProgress?: (progress: number, params: any, name: string, method: HttpMethod) => void;
  
  // Network status callbacks
  onOnline?: (run: Function, params: any, name: string, method: HttpMethod) => void;
  onOffline?: (run: Function, params: any, name: string, method: HttpMethod) => void;
  onRetry?: (run: Function, params: any, name: string, method: HttpMethod, setLoading: Function, setLoader: Function) => void;
  
  // Configuration
  cached?: boolean;              // Enable caching
  debug?: boolean;               // Enable debug logging
  method?: HttpMethod;           // HTTP method
  upload?: boolean;              // Upload mode
  retryDelay?: number;           // Retry delay in ms
  successKey?: string;           // Key to extract from response
  cacheMethod?: HttpMethod[];    // Methods to cache
  
  // Form integration
  formErrorHandler?: (error: RequestError, values: any, helpers: FormikHelpers<any>) => void;
}
```

### request Function

Utility function for making HTTP requests.

```typescript
function request(options: RequestProps): Promise<any>

interface RequestProps {
  url: string;                   // Request URL
  method?: string;               // HTTP method (default: 'GET')
  params?: any;                  // Request parameters
  headers?: any;                 // Request headers
  json?: boolean;                // JSON mode (default: true)
  cacheControl?: boolean;        // Cache control (default: true)
}
```

### RequestProvider

Context provider for global configuration.

```typescript
function RequestProvider(props: RequestConfig): React.ReactElement

interface RequestConfig {
  defaults?: UseRequestOption;   // Default options for all requests
  every?: UseRequestOption;      // Options applied to every request
  children?: ReactNode;
  successKey?: string;           // Global success key
  ttl?: number;                  // Cache TTL in ms (default: 10 minutes)
  retryDelay?: number;           // Global retry delay (default: 10 seconds)
  cached?: boolean;              // Global caching (default: false)
  debug?: boolean;               // Global debug mode (default: false)
  connectionStatus?: boolean;    // Network status
  appStatus?: string;            // App status
  cacheMethod?: HttpMethod[];    // Methods to cache (default: ['GET'])
}
```

## Advanced Usage

### Caching

Enable automatic caching for GET requests:

```jsx
const { data, run } = useRequest(fetchUser, {
  cached: true,
  method: 'GET'
});

// Or globally
<RequestProvider cached={true} cacheMethod={['GET', 'POST']}>
  <App />
</RequestProvider>
```

### Error Handling

```jsx
const { error, run } = useRequest(createUser, {
  onError: (error, params, name, method) => {
    if (error.status === 401) {
      // Handle unauthorized
      redirectToLogin();
    } else if (error.status === 422) {
      // Handle validation errors
      showValidationErrors(error.errors);
    }
  }
});
```

### Form Integration

```jsx
import { Formik, Form, Field } from 'formik';

function UserForm() {
  const { formikConfig, loading, error } = useRequest(createUser, {
    method: 'POST',
    onSuccess: (data) => {
      alert('User created successfully!');
    }
  });

  return (
    <Formik
      initialValues={{ name: '', email: '' }}
      {...formikConfig}
    >
      <Form>
        <Field name="name" placeholder="Name" />
        <Field name="email" placeholder="Email" />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
        {error && <div>Error: {error.message}</div>}
      </Form>
    </Formik>
  );
}
```

### Progress Tracking

Monitor upload/download progress:

```jsx
const { progress, run } = useRequest(uploadFile, {
  upload: true,
  onProgress: (progress, params, name, method) => {
    console.log(`Upload progress: ${progress}%`);
  }
});

// In your component
<div>
  <progress value={progress} max="100">{progress}%</progress>
  <button onClick={() => run(fileData)}>Upload</button>
</div>
```

### Network Awareness

Handle online/offline states:

```jsx
const { run } = useRequest(syncData, {
  onOffline: (run, params) => {
    // Queue request for when online
    queueRequest(run, params);
  },
  onOnline: (run, params) => {
    // Retry queued requests
    retryQueuedRequests();
  }
});
```

### Retry Logic

Automatic retry with custom logic:

```jsx
const { run } = useRequest(unreliableApi, {
  retryDelay: 5000, // 5 seconds
  onRetry: (run, params, name, method, setLoading, setLoader) => {
    console.log('Retrying request...');
    // Custom retry logic
  }
});
```

## Examples

### Example 1: User Management

```jsx
import React from 'react';
import { useRequest, request } from '@app-studio/react-request';

// API functions
const userApi = {
  getUsers: () => request({ url: '/api/users' }),
  getUser: (id) => request({ url: `/api/users/${id}` }),
  createUser: (data) => request({
    url: '/api/users',
    method: 'POST',
    params: data
  }),
  updateUser: (id, data) => request({
    url: `/api/users/${id}`,
    method: 'PUT',
    params: data
  }),
  deleteUser: (id) => request({
    url: `/api/users/${id}`,
    method: 'DELETE'
  })
};

function UserList() {
  const { data: users, loading, error, run: loadUsers } = useRequest(userApi.getUsers, {
    cached: true
  });

  const { run: deleteUser } = useRequest(userApi.deleteUser, {
    method: 'DELETE',
    onSuccess: () => {
      loadUsers(); // Refresh list after deletion
    }
  });

  React.useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Users</h2>
      {users?.map(user => (
        <div key={user.id}>
          <span>{user.name} - {user.email}</span>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Search with Debouncing

```jsx
function UserSearch() {
  const [query, setQuery] = React.useState('');

  const { data: results, loading, run: search } = useRequest(
    (searchTerm) => request({
      url: `/api/users/search?q=${searchTerm}`
    }),
    { cached: true }
  );

  // Debounced search (useRequest has built-in debouncing)
  React.useEffect(() => {
    if (query.length > 2) {
      search(query);
    }
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />

      {loading && <div>Searching...</div>}

      {results?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Example 3: File Upload with Progress

```jsx
function FileUpload() {
  const { run: uploadFile, loading, progress, error } = useRequest(
    (file) => {
      const formData = new FormData();
      formData.append('file', file);

      return request({
        url: '/api/upload',
        method: 'POST',
        params: formData,
        json: false // Don't JSON stringify FormData
      });
    },
    {
      upload: true,
      onProgress: (progress) => {
        console.log(`Upload: ${progress}%`);
      },
      onSuccess: (response) => {
        alert('File uploaded successfully!');
      }
    }
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileSelect} disabled={loading} />

      {loading && (
        <div>
          <div>Uploading... {progress}%</div>
          <progress value={progress} max="100" />
        </div>
      )}

      {error && <div>Upload failed: {error.message}</div>}
    </div>
  );
}
```

## Best Practices

### 1. Use RequestProvider for Global Configuration

```jsx
// App.jsx
function App() {
  return (
    <RequestProvider
      cached={true}
      debug={process.env.NODE_ENV === 'development'}
      defaults={{
        onError: (error) => {
          // Global error handling
          if (error.status === 401) {
            logout();
          }
        }
      }}
    >
      <Router>
        <Routes />
      </Router>
    </RequestProvider>
  );
}
```

### 2. Create Reusable API Services

```jsx
// services/userService.js
import { request } from '@app-studio/react-request';

const BASE_URL = '/api/users';

export const userService = {
  getAll: () => request({ url: BASE_URL }),
  getById: (id) => request({ url: `${BASE_URL}/${id}` }),
  create: (data) => request({
    url: BASE_URL,
    method: 'POST',
    params: data
  }),
  update: (id, data) => request({
    url: `${BASE_URL}/${id}`,
    method: 'PUT',
    params: data
  }),
  delete: (id) => request({
    url: `${BASE_URL}/${id}`,
    method: 'DELETE'
  })
};
```

### 3. Custom Hooks for Complex Logic

```jsx
// hooks/useUsers.js
import { useRequest } from '@app-studio/react-request';
import { userService } from '../services/userService';

export function useUsers() {
  const {
    data: users,
    loading,
    error,
    run: loadUsers,
    refresh
  } = useRequest(userService.getAll, {
    cached: true,
    onError: (error) => {
      console.error('Failed to load users:', error);
    }
  });

  const { run: createUser } = useRequest(userService.create, {
    method: 'POST',
    onSuccess: () => {
      refresh(); // Refresh users list
    }
  });

  const { run: deleteUser } = useRequest(userService.delete, {
    method: 'DELETE',
    onSuccess: () => {
      refresh(); // Refresh users list
    }
  });

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    deleteUser,
    refresh
  };
}
```

### 4. Error Boundaries

```jsx
// components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Request error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong with the request.</h1>;
    }

    return this.props.children;
  }
}
```

### 5. TypeScript Usage

```typescript
// types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

// hooks/useTypedUsers.ts
import { useRequest } from '@app-studio/react-request';
import { User, CreateUserRequest } from '../types/user';

export function useTypedUsers() {
  const {
    data,
    loading,
    error,
    run
  } = useRequest<void, User[]>(
    () => request({ url: '/api/users' }),
    { cached: true }
  );

  const {
    run: createUser
  } = useRequest<CreateUserRequest, User>(
    (userData) => request({
      url: '/api/users',
      method: 'POST',
      params: userData
    }),
    { method: 'POST' }
  );

  return {
    users: data,
    loading,
    error,
    loadUsers: run,
    createUser
  };
}
```

## Troubleshooting

### Common Issues

1. **Requests not caching**: Ensure `cached: true` and method is in `cacheMethod` array
2. **Form errors not showing**: Check `formErrorHandler` configuration
3. **Memory leaks**: Always cleanup with `clear()` in useEffect cleanup
4. **TypeScript errors**: Ensure proper typing of service functions

### Debug Mode

Enable debug mode to see detailed logs:

```jsx
<RequestProvider debug={true}>
  <App />
</RequestProvider>
```

Or per request:

```jsx
const { run } = useRequest(apiCall, { debug: true });
```

## Migration Guide

### From fetch/axios

```jsx
// Before (with fetch)
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchUser = async (id) => {
  setLoading(true);
  try {
    const response = await fetch(`/api/users/${id}`);
    const userData = await response.json();
    setData(userData);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

// After (with react-request)
const { data, loading, error, run } = useRequest(
  (id) => request({ url: `/api/users/${id}` })
);

// Usage: run(userId)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/rize-network/react-request.git
cd react-request
npm install
npm start
```

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](DOCUMENTATION.md)
- 🐛 [Issues](https://github.com/rize-network/react-request/issues)
- 💬 [Discussions](https://github.com/rize-network/react-request/discussions)
- 📧 Email: steed@rize.network
