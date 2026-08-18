import api from "./api";

export const getApprovals = async () => {
  const response = await api.get("/approvals/");
  return response.data;
};

export const getApproval = async (approvalId) => {
  const response = await api.get(`/approvals/${approvalId}`);
  return response.data;
};

export const getContractApprovals = async (contractId) => {
  const response = await api.get(`/approvals/contract/${contractId}`);
  return response.data;
};

export const createApproval = async (contractId, remarks = "Submitted for approval.") => {
  const response = await api.post("/approvals/", { contract_id: contractId, remarks });
  return response.data;
};

export const approveApproval = async (approvalId, remarks = null) => {
  const response = await api.put(`/approvals/${approvalId}/approve`, { remarks });
  return response.data;
};

export const rejectApproval = async (approvalId, remarks) => {
  const response = await api.put(`/approvals/${approvalId}/reject`, { remarks });
  return response.data;
};
