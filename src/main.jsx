import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';

// Monkey-patch fetch to prepend /qims to all /api calls
/*const originalFetch = window.fetch;
window.fetch = function(resource, options) {
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    resource = '/qims' + resource;
  }
  return originalFetch(resource, options);
};*/

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/main">
      <App />
    </BrowserRouter>
  </StrictMode>,
)