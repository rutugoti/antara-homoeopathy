import api from './api';

export const getPrescriptions = async (params) => {
  const { data } = await api.get('/api/prescriptions', { params });
  return data.data;
};

export const getPrescriptionsByPatientId = async ({ patientId, params }) => {
  const { data } = await api.get(`/api/prescriptions/patient/${patientId}`, { params });
  return data.data;
};

export const getPrescriptionById = async (id) => {
  const { data } = await api.get(`/api/prescriptions/${id}`);
  return data.data;
};

export const createPrescription = async (payload) => {
  const { data } = await api.post('/api/prescriptions', payload);
  return data.data;
};

export const updatePrescription = async ({ id, payload }) => {
  const { data } = await api.patch(`/api/prescriptions/${id}`, payload);
  return data.data;
};

export const deletePrescription = async (id) => {
  const { data } = await api.delete(`/api/prescriptions/${id}`);
  return data.data;
};
