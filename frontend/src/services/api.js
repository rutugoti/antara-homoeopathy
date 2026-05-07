import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const authStore = localStorage.getItem('antara-auth');
  if (authStore) {
    try {
      const { state } = JSON.parse(authStore);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We could clear auth store here if 401 is received
    return Promise.reject(error);
  }
);

export default api;
