// Placeholder for future authentication logic
import api from './api';

export const login = async (credentials) => {
  // const response = await api.post('/api/auth/login', credentials);
  // return response.data.data;
  return {
    user: { id: 1, name: 'Admin User', role: 'ADMIN' },
    token: 'dummy-jwt-token'
  };
};

export const logout = async () => {
  // await api.post('/api/auth/logout');
  return true;
};
