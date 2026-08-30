import api from "./api";

/*
|--------------------------------------------------------------------------
| GET ALL PAYMENTS
|--------------------------------------------------------------------------
*/

export const getPayments = async () => {
  const response = await api.get("/payments/");
  return response.data;
};


/*
|--------------------------------------------------------------------------
| GET SINGLE PAYMENT
|--------------------------------------------------------------------------
*/

export const getPayment = async (paymentId) => {
  const response = await api.get(
    `/payments/${paymentId}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| GET PAYMENTS BY CONTRACT
|--------------------------------------------------------------------------
*/

export const getContractPayments = async (
  contractId
) => {
  const response = await api.get(
    `/payments/contract/${contractId}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| CREATE PAYMENT
|--------------------------------------------------------------------------
*/

export const createPayment = async (
  data
) => {
  const response = await api.post(
    "/payments/",
    data
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| SUBMIT PAYMENT FOR VERIFICATION
|--------------------------------------------------------------------------
|
| Pending → For Review
|
*/

export const submitPaymentForVerification =
  async (
    paymentId,
    referenceNo = null,
    remarks = null
  ) => {

    const response = await api.put(
      `/payments/${paymentId}/submit`,
      {
        reference_no: referenceNo,
        remarks: remarks,
      }
    );

    return response.data;
  };


/*
|--------------------------------------------------------------------------
| ALIAS
|--------------------------------------------------------------------------
|
| Keep compatibility with older code that
| uses submitDemoPayment.
|
*/

export const submitDemoPayment =
  async (
    paymentId,
    referenceNo = null,
    remarks = null
  ) => {

    return submitPaymentForVerification(
      paymentId,
      referenceNo,
      remarks
    );
  };


/*
|--------------------------------------------------------------------------
| CONFIRM PAYMENT
|--------------------------------------------------------------------------
|
| For Review → Paid
|
*/

export const confirmPayment = async (
  paymentId,
  remarks = null
) => {

  const response = await api.put(
    `/payments/${paymentId}/confirm`,
    {
      remarks: remarks,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| REJECT PAYMENT
|--------------------------------------------------------------------------
|
| For Review → Rejected
|
*/

export const rejectPayment = async (
  paymentId,
  remarks = null
) => {

  const response = await api.put(
    `/payments/${paymentId}/reject`,
    {
      remarks: remarks,
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| UPDATE PAYMENT
|--------------------------------------------------------------------------
*/

export const updatePayment = async (
  paymentId,
  data
) => {

  const response = await api.put(
    `/payments/${paymentId}`,
    data
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| DELETE PAYMENT
|--------------------------------------------------------------------------
*/

export const deletePayment = async (
  paymentId
) => {

  const response = await api.delete(
    `/payments/${paymentId}`
  );

  return response.data;
};