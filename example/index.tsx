import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RequestExemple } from './Exemple';
import { RequestProvider } from '../src';

const App = () => {
  return (
    <RequestProvider>
      <RequestExemple />
    </RequestProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
