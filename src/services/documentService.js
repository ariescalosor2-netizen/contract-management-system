import api from "./api";

/*
|--------------------------------------------------------------------------
| GET DOCUMENTS FOR CONTRACT
|--------------------------------------------------------------------------
*/

export const getContractDocuments = async (contractId) => {
  const response = await api.get(
    `/documents/contract/${contractId}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| GET SINGLE DOCUMENT
|--------------------------------------------------------------------------
*/

export const getDocument = async (documentId) => {
  const response = await api.get(
    `/documents/${documentId}`
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| UPLOAD DOCUMENT
|--------------------------------------------------------------------------
*/

export const uploadDocument = async ({
  contractId,
  documentName,
  documentType,
  description,
  file,
}) => {
  const formData = new FormData();

  formData.append(
    "contract_id",
    contractId
  );

  formData.append(
    "document_name",
    documentName
  );

  formData.append(
    "document_type",
    documentType || "Other"
  );

  if (description) {
    formData.append(
      "description",
      description
    );
  }

  formData.append(
    "file",
    file
  );

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};


/*
|--------------------------------------------------------------------------
| DOWNLOAD DOCUMENT
|--------------------------------------------------------------------------
*/

export const downloadDocument = async (
  documentId
) => {
  const response = await api.get(
    `/documents/${documentId}/download`,
    {
      responseType: "blob",
      headers: {
        Accept:
          "application/octet-stream, */*",
      },
    }
  );

  const blob = new Blob(
    [response.data],
    {
      type:
        response.headers["content-type"] ||
        "application/octet-stream",
    }
  );

  let fileName = "document";

  const contentDisposition =
    response.headers[
      "content-disposition"
    ];

  if (contentDisposition) {
    const match =
      contentDisposition.match(
        /filename\*?=(?:UTF-8'')?["']?([^;"']+)["']?/i
      );

    if (match?.[1]) {
      fileName = decodeURIComponent(
        match[1]
      );
    }
  }

  const blobUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = blobUrl;

  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    blobUrl
  );

  return true;
};


/*
|--------------------------------------------------------------------------
| DELETE DOCUMENT
|--------------------------------------------------------------------------
*/

export const deleteDocument = async (
  documentId
) => {
  const response = await api.delete(
    `/documents/${documentId}`
  );

  return response.data;
};