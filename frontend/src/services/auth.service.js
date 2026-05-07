import api from './api';

/**
 * Authenticate user with email and password
 */
export const login = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data.data;
};

/**
 * Log out user by clearing the backend session cookie
 */
export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

/**
 * Get current user profile (optional, useful for refreshing session)
 */
export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data.data;
};
