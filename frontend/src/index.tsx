import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';
import './defaults.css';
import Shop from './Shop/pages/home';
import App from './Shop/App';
import { BrowserRouter as Router } from "react-router-dom";
import axios from 'axios';

interface WindowWithEnv extends Window {
  __ENV?: {
    backendURL: string;
    sandbox: string;
  };
}

const _window: WindowWithEnv = window;
const backendURL = _window.__ENV?.backendURL || process.env.REACT_APP_BACKEND_URL || 'https://young-castle-93921-4eef81b63299.herokuapp.com';

const axiosClient = axios.create({ baseURL: backendURL, timeout: 20000, withCredentials: true });

const config = {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}};

ReactDOM.render(
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>,
  document.getElementById('root')
);


export default axiosClient;