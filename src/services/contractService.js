import api from "./api";

/*
|--------------------------------------------------------------------------
| GET ALL CONTRACTS
|--------------------------------------------------------------------------
*/

export const getContracts = async () => {
  const response = await api.get(
    "/contracts/"
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| GET SINGLE CONTRACT
|--------------------------------------------------------------------------
*/

export const getContract = async (
  id
) => {
  const response = await api.get(
    `/contracts/${id}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| CREATE CONTRACT
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Contract number and status are NOT
| supplied by the frontend.
|
| Backend automatically handles:
| - Contract number
| - Pending Approval status
| - Approval record
|
|--------------------------------------------------------------------------
*/

export const createContract = async (
  data
) => {
  const response = await api.post(
    "/contracts/",
    data
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| UPDATE CONTRACT
|--------------------------------------------------------------------------
*/

export const updateContract = async (
  id,
  data
) => {
  const response = await api.put(
    `/contracts/${id}`,
    data
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| DELETE CONTRACT
|--------------------------------------------------------------------------
*/

export const deleteContract = async (
  id
) => {
  const response = await api.delete(
    `/contracts/${id}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| SUBMIT CONTRACT FOR APPROVAL
|--------------------------------------------------------------------------
|
| LEGACY FUNCTION
|
| New contracts no longer need to call this.
| They are automatically submitted by the backend
| when they are created.
|
| Kept here temporarily so other existing pages
| will not break if they still import this function.
|
|--------------------------------------------------------------------------
*/

export const submitContractForApproval =
  async (
    contractId,
    remarks = "Submitted for approval."
  ) => {
    const response = await api.post(
      "/approvals/",
      {
        contract_id: contractId,
        remarks,
      }
    );

    return response.data;
  };