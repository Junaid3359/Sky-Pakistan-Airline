import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://sky-pakistan-airline-api.vercel.app/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    'Request:',
    `${config.baseURL}${config.url}`
  );

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API ERROR:', error);
    console.error('RESPONSE:', error?.response);
    throw error;
  }
);

export default api;