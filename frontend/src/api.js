import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sheetbase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle unauthorized errors (e.g., expired tokens)
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Redirect to login if unauthorized
    localStorage.removeItem('sheetbase_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const getTables = async () => {
  const response = await api.get('/tables');
  return response.data.tables;
};

export const getTableData = async (tableName) => {
  const response = await api.get(`/tables/${tableName}`);
  return response.data.rows;
};

export const downloadReport = async (tableName) => {
  const response = await api.get(`/tables/${tableName}/report`, {
    responseType: 'blob',
  });
  
  // Create a link to download the file
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${tableName}_report.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export default api;
