import api from "./api";

/*
|--------------------------------------------------------------------------
| CONTRACT TYPES API
|--------------------------------------------------------------------------
*/

export const getContractTypes = async () => {
  const response = await api.get("/contract-types/");
  return response.data;
};


export const getContractType = async (id) => {
  const response = await api.get(
    `/contract-types/${id}`
  );

  return response.data;
};


export const createContractType = async (data) => {
  const response = await api.post(
    "/contract-types/",
    data
  );

  return response.data;
};


export const updateContractType = async (
  id,
  data
) => {
  const response = await api.put(
    `/contract-types/${id}`,
    data
  );

  return response.data;
};


export const deleteContractType = async (id) => {
  const response = await api.delete(
    `/contract-types/${id}`
  );

  return response.data;
};