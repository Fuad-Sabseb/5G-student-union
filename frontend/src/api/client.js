import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
});

// Attach the JWT (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gbsg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uploaded files (gallery photos, post covers, profile pictures) come back from
// the API as relative paths like "/uploads/xyz.jpg" — those are served by the
// BACKEND, not the frontend dev server, so they need the backend's origin prefixed.
// Full URLs (e.g. an external image link pasted into a form) are returned unchanged.
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
};

export default api;

