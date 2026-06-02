import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ReturnPage from './ReturnPage';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {window.location.pathname === '/return' ? <ReturnPage /> : <App />}
  </React.StrictMode>
);
