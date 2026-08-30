import api from "./api";

/*
|--------------------------------------------------------------------------
| RESPONSE HELPER
|--------------------------------------------------------------------------
|
| Backend response format:
|
| {
|   success: true,
|   message: "...",
|   data: [...]
| }
|
| This helper returns the actual data when available.
|
|--------------------------------------------------------------------------
*/

const unwrap = (response) => {
  const body = response?.data ?? response;

  return body?.data ?? body;
};


/*
|--------------------------------------------------------------------------
| GET ALL AMENDMENTS
|--------------------------------------------------------------------------
*/

export const getAmendments = async () => {
  const response = await api.get(
    "/amendments/"
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| GET SINGLE AMENDMENT
|--------------------------------------------------------------------------
*/

export const getAmendment = async (
  id
) => {
  const response = await api.get(
    `/amendments/${id}`
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| GET CONTRACT AMENDMENTS
|--------------------------------------------------------------------------
*/

export const getContractAmendments = async (
  contractId
) => {
  const response = await api.get(
    `/amendments/contract/${contractId}`
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| GET AMENDMENT SUMMARY
|--------------------------------------------------------------------------
*/

export const getAmendmentSummary = async () => {
  const response = await api.get(
    "/amendments/summary"
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| CREATE AMENDMENT
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| The frontend sends only the fields required
| for creating an amendment.
|
| Backend automatically handles:
|
| - amendment_no
| - organization_id
| - requested_by
| - original contract values
| - initial status
| - approval workflow
|
|--------------------------------------------------------------------------
*/

export const createAmendment = async (
  data
) => {
  const response = await api.post(
    "/amendments/",
    data
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| UPDATE AMENDMENT
|--------------------------------------------------------------------------
*/

export const updateAmendment = async (
  id,
  data
) => {
  const response = await api.put(
    `/amendments/${id}`,
    data
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| APPROVE AMENDMENT
|--------------------------------------------------------------------------
*/

export const approveAmendment = async (
  id,
  remarks = ""
) => {
  const response = await api.put(
    `/amendments/${id}/approve`,
    {
      remarks,
    }
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| REJECT AMENDMENT
|--------------------------------------------------------------------------
*/

export const rejectAmendment = async (
  id,
  remarks
) => {
  const response = await api.put(
    `/amendments/${id}/reject`,
    {
      remarks,
    }
  );

  return unwrap(response);
};


/*
|--------------------------------------------------------------------------
| DELETE AMENDMENT
|--------------------------------------------------------------------------
*/

export const deleteAmendment = async (
  id
) => {
  const response = await api.delete(
    `/amendments/${id}`
  );

  return unwrap(response);
};