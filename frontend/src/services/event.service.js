import api from './api';

export const getEvents = async (params) => {
  const { data } = await api.get('/api/events', { params });
  return data.data;
};

export const getEventById = async (id) => {
  const { data } = await api.get(`/api/events/${id}`);
  return data.data;
};

export const createEvent = async (payload) => {
  const { data } = await api.post('/api/events', payload);
  return data.data;
};

export const updateEvent = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/events/${id}`, payload);
  return data.data;
};

export const togglePublishEvent = async (id) => {
  const { data } = await api.patch(`/api/events/${id}/toggle-publish`);
  return data.data;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/api/events/${id}`);
  return data.data;
};
