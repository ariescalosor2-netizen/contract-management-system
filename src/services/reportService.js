import api from "./api";

// ============================================================
// REPORT CONTRACTS
// ============================================================

export const getReportContracts = async () => {
  const response = await api.get("/contracts/");

  return response.data;
};


// ============================================================
// REPORT MILESTONES
// ============================================================

export const getReportMilestones = async () => {
  const response = await api.get("/milestones/");

  return response.data;
};


// ============================================================
// REPORT APPROVALS
// ============================================================

export const getReportApprovals = async () => {
  const response = await api.get("/approvals/");

  return response.data;
};


// ============================================================
// REPORT PAYMENTS BY CONTRACT
// ============================================================

export const getReportPaymentsByContract = async (
  contractId
) => {
  const response = await api.get(
    `/payments/contract/${contractId}`
  );

  return response.data;
};