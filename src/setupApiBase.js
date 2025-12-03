import axios from 'axios';

// By default, talk to the same origin under the /api prefix.
// If you really need an absolute host, set REACT_APP_USE_ABSOLUTE_API=true and REACT_APP_API_URL accordingly.
const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
const API_PREFIX = (process.env.REACT_APP_API_PREFIX || '/api').replace(/\/$/, '');
const USE_ABSOLUTE = process.env.REACT_APP_USE_ABSOLUTE_API === 'true';

// Build the root that axios/fetch should hit.
const apiRoot = (() => {
  if (USE_ABSOLUTE && API_BASE) {
    return `${API_BASE}${API_PREFIX}`; // absolute host + prefix
  }
  return API_PREFIX || ''; // same-origin with prefix (default)
})();

// Point axios to the API root (absolute or same-origin) and always send cookies.
if (apiRoot) {
  axios.defaults.baseURL = apiRoot;
}
axios.defaults.withCredentials = true;

// Prefix fetch requests that use relative paths so they hit the API root too.
if (apiRoot && typeof window !== 'undefined' && window.fetch) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      // Avoid double-prefixing if the caller already included the API root
      const alreadyPrefixed =
        input === apiRoot || input.startsWith(`${apiRoot}/`);
      const target = alreadyPrefixed ? input : `${apiRoot}${input}`;
      return originalFetch(target, init);
    }
    return originalFetch(input, init);
  };
}
