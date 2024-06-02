import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';
import './defaults.css';
import App from './Shop/App';
import { BrowserRouter as Router } from "react-router-dom";
import AuthProvider from "./Shop/components/Auth";

ReactDOM.render(
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>,
  document.getElementById('root')
);
