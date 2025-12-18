import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { GuideApp } from './GuideApp';

ReactDOM.createRoot(document.getElementById('guide-root')!).render(
  <React.StrictMode>
    <GuideApp />
  </React.StrictMode>,
);


