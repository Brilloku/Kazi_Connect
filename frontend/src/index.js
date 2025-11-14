import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// If Supabase returns an auth callback in the URL hash (e.g. #access_token=...),
// redirect to the `/verify-email` route while preserving the hash so the
// `VerifyEmail` page (and Supabase client) can consume it.
try {
  const hash = window.location.hash || '';
  if (hash && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('recovery') || hash.includes('refresh_token'))) {
    if (!window.location.pathname.startsWith('/verify-email')) {
      // Use replace to avoid creating extra history entries
      window.location.replace(`/verify-email${hash}`);
    }
  }
} catch (e) {
  // ignore in non-browser environments
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
