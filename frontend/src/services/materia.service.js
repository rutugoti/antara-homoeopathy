import api from './api';

export const getMateriaMedicas = async (params) => {
  const { data } = await api.get('/api/materia-medica', { params });
  return data.data;
};

export const getMateriaMedicaById = async (id) => {
  const { data } = await api.get(`/api/materia-medica/${id}`);
  return data.data;
};

export const createMateriaMedica = async (payload) => {
  const { data } = await api.post('/api/materia-medica', payload);
  return data.data;
};

export const updateMateriaMedica = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/materia-medica/${id}`, payload);
  return data.data;
};

export const deleteMateriaMedica = async (id) => {
  const { data } = await api.delete(`/api/materia-medica/${id}`);
  return data.data;
};

export const importMateriaMedicaCsv = async (formData) => {
  const { data } = await api.post('/api/materia-medica/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
