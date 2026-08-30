import api from "./api";

/*
|--------------------------------------------------------------------------
| GET ALL PARTIES
|--------------------------------------------------------------------------
*/

export const getParties = async () => {
  const response = await api.get("/parties/");
  return response.data;
};


/*
|--------------------------------------------------------------------------
| GET PARTY BY ID
|--------------------------------------------------------------------------
*/

export const getParty = async (id) => {
  const response = await api.get(
    `/parties/${id}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| CREATE PARTY
|--------------------------------------------------------------------------
*/

export const createParty = async (data) => {
  const response = await api.post(
    "/parties/",
    data
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| UPDATE PARTY
|--------------------------------------------------------------------------
*/

export const updateParty = async (
  id,
  data
) => {
  const response = await api.put(
    `/parties/${id}`,
    data
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| DELETE PARTY
|--------------------------------------------------------------------------
*/

export const deleteParty = async (id) => {
  const response = await api.delete(
    `/parties/${id}`
  );

  return response.data;
};