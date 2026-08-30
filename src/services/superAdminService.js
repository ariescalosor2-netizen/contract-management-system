import api from "./api";

export const getSuperAdminDashboard = async () => {
  const response = await api.get("/super-admin/dashboard");
  return response.data;
};

export const getOrganizations = async () => {
  const response = await api.get("/super-admin/organizations");
  return response.data;
};

export const createOrganization = async (data) => {
  const response = await api.post("/super-admin/organizations", data);
  return response.data;
};

export const updateOrganization = async (id, data) => {
  const response = await api.put(`/super-admin/organizations/${id}`, data);
  return response.data;
};

export const getSuperAdminUsers = async () => {
  const response = await api.get("/super-admin/users");
  return response.data;
};

export const createSuperAdminUser = async (data) => {
  const response = await api.post("/super-admin/users", data);
  return response.data;
};

export const updateSuperAdminUser = async (id, data) => {
  const response = await api.put(`/super-admin/users/${id}`, data);
  return response.data;
};

export const getSystemRoles = async () => {
  const response = await api.get("/super-admin/roles");
  return response.data;
};
