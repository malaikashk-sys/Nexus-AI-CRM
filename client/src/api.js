import axios from 'axios';

const API = axios.create({
  baseURL: 'https://nexus-ai-crm-pi.vercel.app/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;