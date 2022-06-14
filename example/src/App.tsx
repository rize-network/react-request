import React from 'react';
import './App.css';
import { RequestExemple } from './Exemple';
import { RequestExempleCached } from './ExempleCached';
import { RequestProvider } from './react-request';
import { useState } from 'react';

const App = () => {
  return (
    <RequestProvider>
       
      <br/>
      <RequestExemple />
      <br/>

<RequestExempleCached />
    </RequestProvider>
  );
};


export default App;
