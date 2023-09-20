import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './components/App';
import { Provider } from 'react-redux';
import { store } from './store';
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </React.StrictMode>
);
