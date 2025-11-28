import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

// Point axios to the API host and always send cookies.
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

// Prefix fetch requests that use relative paths so they hit the API host too.
if (API_BASE && typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      return originalFetch(`${API_BASE}${input}`, init);
    }
    return originalFetch(input, init);
  };
}
