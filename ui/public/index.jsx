import 'json5';
import './install-ses-lockdown';
import React from 'react';
import { render } from 'react-dom';

import ApplicationContextProvider from './contexts/Application';
import App from './App';

render(
  <ApplicationContextProvider>
    <App />
  </ApplicationContextProvider>,
  document.getElementById('root'),
);