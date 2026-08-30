import api from "./api";

// ============================================================
// GET USERS
// ============================================================

export const getUsers = async () => {
  const response = await api.get(
    "/users/"
  );

  return response.data.data;
};

// ============================================================
// GET USER
// ============================================================

export const getUser = async (id) => {
  const response = await api.get(
    `/users/${id}`
  );

  return response.data.data;
};

// ============================================================
// CREATE USER
// ============================================================

export const createUser = async (data) => {
  const response = await api.post(
    "/users/",
    data
  );

  return response.data.data;
};

// ============================================================
// UPDATE USER
// ============================================================

export const updateUser = async (
  id,
  data
) => {
  const response = await api.put(
    `/users/${id}`,
    data
  );

  return response.data.data;
};

// ============================================================
// DELETE USER
// ============================================================

export const deleteUser = async (id) => {
  const response = await api.delete(
    `/users/${id}`
  );

  return response.data;
};