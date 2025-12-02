/**
 * Environment variable utilities
 */

// Helper function to safely access environment variables
export const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use process.env for Vite
    return (import.meta.env as any)[key] || defaultValue;
  } else {
    // Server-side: use process.env
    return process.env[key] || defaultValue;
  }
};

// Common environment variables
export const ENV = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  VITE_API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3001/api'),
  REACT_APP_API_URL: getEnvVar('REACT_APP_API_URL', 'http://localhost:3001/api'),
  REACT_APP_CDN_URL: getEnvVar('REACT_APP_CDN_URL', ''),
  VITE_VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY', ''),
  CDN_API_KEY: getEnvVar('CDN_API_KEY', ''),
};

export default ENV;