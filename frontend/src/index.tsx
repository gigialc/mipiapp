import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';
import './defaults.css';
import Shop from './Shop';
import App from './App';
import { BrowserRouter as Router } from "react-router-dom";
import './index.css';

// Function to post a message to the specified origin
function sendMessageToPiSDK(message: any) {
  const targetOrigin = 'https://app-cdn.minepi.com'; // Ensure this is correct
  window.postMessage(message, targetOrigin);
}

// Function to handle received messages
window.addEventListener('message', (event) => {
  if (event.origin === 'https://app-cdn.minepi.com') {
    console.log('Received message from Pi SDK:', event.data);
    // Handle the message
  } else {
    console.warn('Received message from unknown origin:', event.origin);
  }
});

// Example usage
const message = { type: 'example', content: 'Hello, Pi SDK!' };
sendMessageToPiSDK(message);


ReactDOM.render(
  <Router>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Router>,
  document.getElementById('root')
);

