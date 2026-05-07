import api from './api';

export const getAppointments = async (params) => {
  const { data } = await api.get('/api/appointments', { params });
  return data.data;
};

export const getAvailableSlots = async (params) => {
  const { data } = await api.get('/api/appointments/available-slots', { params });
  return data.data.slots;
};

export const getAppointmentById = async (id) => {
  const { data } = await api.get(`/api/appointments/${id}`);
  return data.data;
};

export const createAppointment = async (payload) => {
  const { data } = await api.post('/api/appointments', payload);
  return data.data;
};

export const updateAppointment = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/appointments/${id}`, payload);
  return data.data;
};

export const updateAppointmentStatus = async ({ id, status }) => {
  const { data } = await api.patch(`/api/appointments/${id}/status`, { status });
  return data.data;
};

export const cancelAppointment = async (id) => {
  const { data } = await api.patch(`/api/appointments/${id}/cancel`);
  return data.data;
};

// Settings
export const getAppointmentSettings = async () => {
  const { data } = await api.get('/api/settings/appointment');
  return data.data;
};

export const updateAppointmentSettings = async (payload) => {
  const { data } = await api.put('/api/settings/appointment', payload);
  return data.data;
};

export const updateWorkingDays = async (payload) => {
  const { data } = await api.put('/api/settings/day', payload);
  return data.data;
};

export const getHolidays = async (params) => {
  const { data } = await api.get('/api/settings/holidays', { params });
  return data.data;
};

export const createHoliday = async (payload) => {
  const { data } = await api.post('/api/settings/holidays', payload);
  return data.data;
};

export const updateHoliday = async ({ id, payload }) => {
  const { data } = await api.put(`/api/settings/holidays/${id}`, payload);
  return data.data;
};

export const deleteHoliday = async (id) => {
  const { data } = await api.delete(`/api/settings/holidays/${id}`);
  return data.data;
};
