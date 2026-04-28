import axios from 'axios';
import { clearAuth, getToken } from './auth';

const http = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const message = error?.response?.data?.message || error.message || '请求失败';
    if (error?.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(new Error(message));
  },
);

export default http;
