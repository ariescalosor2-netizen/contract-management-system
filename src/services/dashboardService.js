import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");

  return response.data;
};

export const getContractStatus = async () => {
  const response = await api.get(
    "/dashboard/contracts/status"
  );

  return response.data;
};

export const getContractMonthly = async () => {
  const response = await api.get(
    "/dashboard/contracts/monthly"
  );

  return response.data;
};