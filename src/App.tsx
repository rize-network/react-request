import React from 'react';
import './App.css';
import { RequestExemple } from './Exemple';
import { RequestExempleCached } from './ExempleCached';
import { RequestProvider } from './react-request';
import { UserForm } from './UserForm';
import { SimpleForm } from './SimpleForm';

const App = () => {
  return (
    <RequestProvider>
      <br />
      <RequestExemple />
      <br />
      <RequestExempleCached />

      <br />
      <UserForm />
      <br />
      <SimpleForm />
    </RequestProvider>
  );
};

export default App;
