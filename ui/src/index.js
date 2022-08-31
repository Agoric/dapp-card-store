import '@endo/eventual-send/shim.js';
import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.js';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
