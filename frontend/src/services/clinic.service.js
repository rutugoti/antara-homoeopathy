import api from './api';

export const getClinics = async (params) => {
  const { data } = await api.get('/api/clinics', { params });
  return data.data;
};

export const getClinicById = async (id) => {
  const { data } = await api.get(`/api/clinics/${id}`);
  return data.data;
};

export const createClinic = async (payload) => {
  const { data } = await api.post('/api/clinics', payload);
  return data.data;
};

export const updateClinic = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/clinics/${id}`, payload);
  return data.data;
};

export const deleteClinic = async (id) => {
  const { data } = await api.delete(`/api/clinics/${id}`);
  return data.data;
};
