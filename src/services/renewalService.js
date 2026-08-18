import api from "./api";

export const getRenewals = async () => {
  const response = await api.get("/renewals/");
  return response.data;
};

export const getRenewalStats = async () => {
  const response = await api.get("/renewals/stats");
  return response.data;
};

export const getRenewal = async (renewalId) => {
  const response = await api.get(`/renewals/${renewalId}`);
  return response.data;
};

export const createRenewal = async (data) => {
  const response = await api.post("/renewals/", data);
  return response.data;
};

export const updateRenewal = async (renewalId, data) => {
  const response = await api.put(`/renewals/${renewalId}`, data);
  return response.data;
};

export const deleteRenewal = async (renewalId) => {
  const response = await api.delete(`/renewals/${renewalId}`);
  return response.data;
};