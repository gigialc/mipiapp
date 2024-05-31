import dotenv from 'dotenv';

console.log("NODE_ENV: " + process.env.NODE_ENV);

const result = dotenv.config()

if (result.error) {
  if (process.env.NODE_ENV === "development") {
    console.error(".env file not found. This is an error condition in development. Additional error is logged below");
    throw result.error;
  }

  // In production, environment variables are injected into the container environment. We should not even have
  // a .env file inside the running container.
}

interface Environment {
  session_secret: string,
  pi_api_key: string,
  platform_api_url: string,
  mongo_user: string,
  mongo_password: string,
  frontend_url: string,
  MONGO_URI: string,
  wallet_public_address: string,
  wallet_secret_seed: string,
  PORT: string,
}


const env: Environment = {
  session_secret: process.env.SESSION_SECRET || "This is my session secret",
  pi_api_key: process.env.PI_API_KEY || '',
  platform_api_url: process.env.PLATFORM_API_URL || '',
  MONGO_URI: process.env.MONGO_URI || '',
  mongo_user: process.env.mongo_user || '',
  mongo_password: process.env.mongo_password || '',
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3314',
  wallet_public_address: process.env.DEV_WALLET_PUBLIC_ADDRESS || '',
  wallet_secret_seed: process.env.DEV_WALLET_SECRECT_SEED || '',
  PORT: process.env.PORT || '3313',
};

export default env;
