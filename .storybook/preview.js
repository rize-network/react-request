import React from 'react';
import { addDecorator } from '@storybook/react';
import { RequestProvider } from '../src';

// https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters
export const parameters = {
  // https://storybook.js.org/docs/react/essentials/actions#automatically-matching-args
  actions: { argTypesRegex: '^on.*' },
};

const Container = ({ children }) => {
  return <RequestProvider>{children}</RequestProvider>;
};

addDecorator((storyFn) => <Container>{storyFn()}</Container>);
