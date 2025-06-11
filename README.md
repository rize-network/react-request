
# React Request

[![npm version](https://img.shields.io/npm/v/react-request.svg?style=for-the-badge)](https://www.npmjs.com/package/@react-request/react-request)
[![npm](https://img.shields.io/npm/dt/@react-request/react-request.svg?style=for-the-badge)](https://www.npmjs.com/package/@react-request/react-request)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier)


[npm-image]: http://img.shields.io/npm/v/react-request/react-request.svg?style=flat-square
[npm-url]: http://npmjs.org/package/react-request/react-request
[github-action-image]: https://github.com/rize-network/react-request/workflows/%E2%9C%85%20test/badge.svg
[github-action-url]: https://github.com/rize-network/react-request/actions?query=workflow%3A%22%E2%9C%85+test%22

[download-image]: https://img.shields.io/npm/dm/react-request/react-request.svg?style=flat-square
[download-url]: https://npmjs.org/package/react-request/react-request

[help-wanted-image]: https://flat.badgen.net/github/label-issues/rize-network/react-request/help%20wanted/open
[help-wanted-url]: https://github.com/rize-network/react-request/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22

[discussions-image]: https://img.shields.io/badge/discussions-on%20github-blue?style=flat-square
[discussions-url]: https://github.com/rize-network/react-request/discussions

[issues-helper-image]: https://img.shields.io/badge/using-issues--helper-orange?style=flat-square
[issues-helper-url]: https://github.com/actions-cool/issues-helper




## ✨ Features

- 🎣 **React Hooks** - Modern React hooks API for data fetching
- 🚀 **TypeScript Support** - Full TypeScript support with type safety
- 💾 **Built-in Caching** - Automatic request caching with configurable TTL
- 🔄 **Loading States** - Automatic loading and progress tracking
- ❌ **Error Handling** - Comprehensive error handling with retry logic
- 📝 **Form Integration** - Seamless Formik integration for forms
- 🌐 **Network Awareness** - Online/offline status handling
- 🔧 **Configurable** - Highly customizable with global and per-request options
- 🎯 **Debouncing** - Built-in request debouncing (300ms)
- 📊 **Progress Tracking** - Upload/download progress monitoring



## 📦 Install

```bash
npm install @app-studio/react-request
```

## 🔨 Usage

### Basic Example

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

### With Provider (Recommended)

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

### Form Integration

```jsx
import { Formik, Form, Field } from 'formik';

function CreateUserForm() {
  const { formikConfig, loading, error } = useRequest(
    (userData) => request({
      url: '/api/users',
      method: 'POST',
      params: userData
    }),
    {
      method: 'POST',
      onSuccess: (data) => alert('User created successfully!')
    }
  );

  return (
    <Formik initialValues={{ name: '', email: '' }} {...formikConfig}>
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

### TypeScript

`react-request` is written in TypeScript with complete definitions.


## 📚 Documentation

- 📖 [Full Documentation](DOCUMENTATION.md) - Comprehensive guide with examples
- ⚡ [Quick Reference](QUICK_REFERENCE.md) - Quick reference for common patterns
- 🔗 [API Reference](DOCUMENTATION.md#api-reference) - Detailed API documentation
- 💡 [Examples](DOCUMENTATION.md#examples) - Real-world usage examples
- 🛠️ [Best Practices](DOCUMENTATION.md#best-practices) - Recommended patterns

## 🔗 Links
- [Change Log](CHANGELOG.md)
- [Versioning Release Note](https://github.com/rize-network/react-request/wiki/)
- [Issues](https://github.com/rize-network/react-request/issues) - Bug reports and feature requests
- [Discussions](https://github.com/rize-network/react-request/discussions) - Community discussions



## 🤝 Contributing [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

We welcome all contributions! Here's how you can help:

1. 🐛 **Report bugs** - [Create an issue](https://github.com/rize-network/react-request/issues)
2. 💡 **Suggest features** - [Start a discussion](https://github.com/rize-network/react-request/discussions)
3. 📝 **Improve docs** - Help us make the documentation better
4. 🔧 **Submit PRs** - Fix bugs or add new features

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

Please read our [contributing guide](DOCUMENTATION.md#contributing) for more details.

[![Let's fund issues in this repository](https://issuehunt.io/static/embed/issuehunt-button-v1.svg)](https://issuehunt.io/o/rize-network)



## ❤️ Sponsors and Backers [![](https://opencollective.com/rize/tiers/sponsors/badge.svg?label=Sponsors&color=brightgreen)](https://opencollective.com/rize#support) [![](https://opencollective.com/rize/tiers/backers/badge.svg?label=Backers&color=brightgreen)](https://opencollective.com/rize#support)

[![](https://opencollective.com/rize/tiers/sponsors.svg?avatarHeight=36)](https://opencollective.com/rize#support)

[![](https://opencollective.com/rize/tiers/backers.svg?avatarHeight=36)](https://opencollective.com/rize#support)


<!-- 
## Fundamentals

| Property    |  Type  |  Default  | Description           |
| ----------- | :----: | :-------: | --------------------- |
| title       | string | undefined | change the title      |
| description | string | undefined | change the descrition | -->




## Author

SteedMonteiro, steed@rize.network

## License

React Request is available under the MIT license. See the LICENSE file for more info.
