import api from './api';

export const getDashboardStats = async () => {
  const { data } = await api.get('/api/dashboard');
  return data.data;
};

export const getDashboardAppointments = async () => {
  const { data } = await api.get('/api/dashboard/appointments/today');
  return data.data.appointments;
};

export const updateDashboardAppointmentStatus = async ({ id, status }) => {
  const { data } = await api.patch(`/api/dashboard/appointments/${id}/status`, { status });
  return data.data;
};

export const getDashboardHolidays = async () => {
  const { data } = await api.get('/api/dashboard/holidays');
  return data.data.holidays;
};

export const getDashboardEvents = async () => {
  const { data } = await api.get('/api/dashboard/events');
  return data.data.events;
};
