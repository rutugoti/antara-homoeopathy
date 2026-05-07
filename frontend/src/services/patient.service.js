import api from './api';

export const getPatients = async (params) => {
  const { data } = await api.get('/api/patients', { params });
  return data.data;
};

export const getPatientById = async (id) => {
  const { data } = await api.get(`/api/patients/${id}`);
  return data.data;
};

export const createPatient = async (formData) => {
  const { data } = await api.post('/api/patients', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updatePatient = async ({ id, formData }) => {
  const { data } = await api.patch(`/api/patients/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deletePatient = async (id) => {
  const { data } = await api.delete(`/api/patients/${id}`);
  return data.data;
};

// Case Taking
export const getPatientCaseTaking = async (patientId) => {
  const { data } = await api.get(`/api/patients/${patientId}/case-taking`);
  return data.data;
};

export const updatePatientCaseTaking = async ({ patientId, payload }) => {
  const { data } = await api.put(`/api/patients/${patientId}/case-taking`, payload);
  return data.data;
};

export const uploadCaseTakingImages = async ({ patientId, formData }) => {
  const { data } = await api.post(`/api/patients/${patientId}/case-taking/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// Follow Ups
export const getPatientFollowUps = async (patientId, params) => {
  const { data } = await api.get(`/api/patients/${patientId}/follow-ups`, { params });
  return data.data;
};

export const createPatientFollowUp = async ({ patientId, payload }) => {
  const { data } = await api.post(`/api/patients/${patientId}/follow-ups`, payload);
  return data.data;
};

export const getPatientRemedyHistory = async (patientId, params) => {
  const { data } = await api.get(`/api/patients/${patientId}/remedy-history`, { params });
  return data.data;
};

export const createPatientRemedy = async ({ patientId, payload }) => {
  const { data } = await api.post(`/api/patients/${patientId}/remedies`, payload);
  return data.data;
};

// Invoices
export const getPatientInvoices = async (patientId, params) => {
  const { data } = await api.get(`/api/patients/${patientId}/invoices`, { params });
  return data.data;
};

export const createPatientInvoice = async ({ patientId, payload }) => {
  const { data } = await api.post(`/api/patients/${patientId}/invoices`, payload);
  return data.data;
};

export const getInvoiceById = async ({ patientId, invoiceId }) => {
  const { data } = await api.get(`/api/patients/${patientId}/invoices/${invoiceId}`);
  return data.data;
};

export const deletePatientInvoice = async ({ patientId, invoiceId }) => {
  const { data } = await api.delete(`/api/patients/${patientId}/invoices/${invoiceId}`);
  return data.data;
};
