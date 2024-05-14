

require('dotenv').config();

module.exports = {
  apps: [{
    name: "demoapp-backend",           // Name of the application in PM2
    script: "./build/index.js ",       // Path to the application starting script
    exec_mode: "cluster",             // Execution mode, set to 'cluster' for load balancing across CPUs
    instances: 4,                     // Number of instances to start, often set to the number of CPUs
    watch: false,                     // Set to true to enable watching file changes and auto-restart
    max_memory_restart: '1G',         // Optional: Restarts the app if it reaches the memory limit
    env: {
      NODE_ENV: "production",   
      SESSION_SECRET: process.env.SESSION_SECRET, // Secret key for session
      MONGO_URI: process.env.MONGO_URI,           // MongoDB URI
      PI_API_KEY: process.env.PI_API_KEY,  
      FRONTEND_URL: process.env.FRONTEND_URL,      // Frontend URL
      BACKEND_URL: process.env.BACKEND_URL,    
      PLATFORM_API_URL: process.env.PLATFORM_API_URL, // Platform API URL
      PORT: process.env.PORT || 3000     
                    // Optional: Specify the port on which your server should run
    },
    error_file: './logs/app-err.log', // Path for logging standard errors
    out_file: './logs/app-out.log',   // Path for logging standard output
    log_date_format: "YYYY-MM-DD HH:mm:ss" // Format of timestamp for logs
  }]
};

