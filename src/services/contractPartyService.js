import api from "./api";

export const getContractParties = async (contractId) => {
  const response = await api.get(`/contracts/${contractId}/parties`);
  return response.data;
};

export const getPartyRoles = async (contractId) => {
  const response = await api.get(`/contracts/${contractId}/party-roles`);
  return response.data;
};

export const addContractParty = async (contractId, data) => {
  const response = await api.post(`/contracts/${contractId}/parties`, data);
  return response.data;
};

export const updateContractParty = async (contractId, contractPartyId, data) => {
  const response = await api.put(`/contracts/${contractId}/parties/${contractPartyId}`, data);
  return response.data;
};

export const removeContractParty = async (contractId, contractPartyId) => {
  const response = await api.delete(`/contracts/${contractId}/parties/${contractPartyId}`);
  return response.data;
};
