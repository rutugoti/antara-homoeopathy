import api from './api';

export const getResearchDevs = async (params) => {
  const { data } = await api.get('/api/research-dev', { params });
  return data.data;
};

export const getResearchDevById = async (id) => {
  const { data } = await api.get(`/api/research-dev/${id}`);
  return data.data;
};

export const createResearchDev = async (payload) => {
  const { data } = await api.post('/api/research-dev', payload);
  return data.data;
};

export const updateResearchDev = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/research-dev/${id}`, payload);
  return data.data;
};

export const deleteResearchDev = async (id) => {
  const { data } = await api.delete(`/api/research-dev/${id}`);
  return data.data;
};
