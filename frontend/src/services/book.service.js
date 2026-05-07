import api from './api';

export const lookupPatient = async (fileId) => {
  const { data } = await api.get('/api/book/lookup', { params: { fileId } });
  return data.data;
};

export const bookOldPatient = async (payload) => {
  const { data } = await api.post('/api/book/old-patient', payload);
  return data.data;
};

export const bookNewPatient = async (payload) => {
  const { data } = await api.post('/api/book/new-patient', payload);
  return data.data;
};

export const getBookPayments = async (patientId, params) => {
  const { data } = await api.get(`/api/book/payments/${patientId}`, { params });
  return data.data;
};
