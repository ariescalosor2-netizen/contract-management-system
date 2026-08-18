import { useEffect, useRef, useState } from "react";

import {
  BiFile,
  BiDownload,
  BiTrash,
  BiPlus,
  BiX,
} from "react-icons/bi";

import {
  getContractDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from "../../services/documentService";


function ContractDocuments({ contractId, contractNo }) {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");

  const [showUploadForm, setShowUploadForm] =
    useState(false);

  const [form, setForm] = useState({
    document_name: "",
    document_type: "Contract",
    description: "",
    file: null,
  });


  // ============================================================
  // LOAD DOCUMENTS
  // ============================================================

  const loadDocuments = async () => {
    if (!contractId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await getContractDocuments(contractId);

      const data = response?.data || [];

      setDocuments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load documents:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load contract documents."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadDocuments();
  }, [contractId]);


  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  // ============================================================
  // FILE CHANGE
  // ============================================================

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0] || null;

    setForm((current) => ({
      ...current,
      file,
    }));

    if (file && !form.document_name) {
      const fileName =
        file.name.replace(
          /\.[^/.]+$/,
          ""
        );

      setForm((current) => ({
        ...current,
        document_name: fileName,
        file,
      }));
    }
  };


  // ============================================================
  // OPEN UPLOAD FORM
  // ============================================================

  const openUploadForm = () => {
    setError("");

    setForm({
      document_name: "",
      document_type: "Contract",
      description: "",
      file: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowUploadForm(true);
  };


  // ============================================================
  // CLOSE UPLOAD FORM
  // ============================================================

  const closeUploadForm = () => {
    if (saving) {
      return;
    }

    setShowUploadForm(false);

    setForm({
      document_name: "",
      document_type: "Contract",
      description: "",
      file: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  // ============================================================
  // UPLOAD
  // ============================================================

const handleDownload = async (doc) => {
  if (!doc?.id) {
    return;
  }

  try {
    setProcessingId(doc.id);
    setError("");

    const response = await downloadDocument(doc.id);

    const blob = new Blob([response.data], {
      type:
        doc.content_type ||
        response.headers?.["content-type"] ||
        "application/octet-stream",
    });

    const url = window.URL.createObjectURL(blob);

    const link = window.document.createElement("a");

    link.href = url;

    link.download =
      doc.file_name ||
      doc.document_name ||
      "document";

    link.style.display = "none";

    window.document.body.appendChild(link);

    link.click();

    window.document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "Failed to download document:",
      error
    );

    setError(
      error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to download document."
    );
  } finally {
    setProcessingId(null);
  }
};


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (document) => {
    if (!document?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${document.document_name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(document.id);
      setError("");

      await deleteDocument(
        document.id
      );

      await loadDocuments();

    } catch (error) {
      console.error(
        "Failed to delete document:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete document."
      );

    } finally {
      setProcessingId(null);
    }
  };


  // ============================================================
  // FILE SIZE
  // ============================================================

  const formatFileSize = (size) => {
    if (!size) {
      return "0 B";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };


  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };


  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h2 className="text-lg font-semibold text-slate-800">
            Contract Documents
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Documents and files associated with{" "}
            {contractNo}.
          </p>

        </div>


        <button
          type="button"
          onClick={openUploadForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <BiPlus size={20} />

          Upload Document
        </button>

      </div>


      {/* ERROR */}

      {error && (

        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>

      )}


      {/* DOCUMENT TABLE */}

      <div className="overflow-x-auto rounded-xl border border-gray-200">

        {loading ? (

          <div className="p-12 text-center">

            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="text-sm text-gray-500">
              Loading documents...
            </p>

          </div>

        ) : documents.length === 0 ? (

          <div className="p-12 text-center">

            <BiFile
              size={46}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 font-medium text-gray-600">
              No documents yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Upload the first document for this contract.
            </p>

            <button
              type="button"
              onClick={openUploadForm}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <BiPlus />

              Upload Document
            </button>

          </div>

        ) : (

          <table className="w-full min-w-[850px]">

            <thead className="border-b bg-gray-50">

              <tr className="text-left text-sm text-gray-600">

                <th className="px-5 py-4">
                  Document
                </th>

                <th className="px-5 py-4">
                  Type
                </th>

                <th className="px-5 py-4">
                  File
                </th>

                <th className="px-5 py-4">
                  Size
                </th>

                <th className="px-5 py-4">
                  Uploaded
                </th>

                <th className="px-5 py-4 text-center">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {documents.map(
                (document) => (

                  <tr
                    key={document.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <BiFile size={21} />
                        </div>

                        <div>

                          <p className="font-medium text-gray-800">
                            {document.document_name}
                          </p>

                          {document.description && (

                            <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                              {document.description}
                            </p>

                          )}

                        </div>

                      </div>

                    </td>


                    <td className="px-5 py-4">

                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {document.document_type || "Other"}
                      </span>

                    </td>


                    <td className="px-5 py-4 text-sm text-gray-600">
                      {document.file_name}
                    </td>


                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatFileSize(
                        document.file_size
                      )}
                    </td>


                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(
                        document.created_at
                      )}
                    </td>


                    <td className="px-5 py-4">

                      <div className="flex items-center justify-center gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              document
                            )
                          }
                          disabled={
                            processingId ===
                            document.id
                          }
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Download document"
                        >
                          <BiDownload
                            size={19}
                          />
                        </button>


                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              document
                            )
                          }
                          disabled={
                            processingId ===
                            document.id
                          }
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete document"
                        >
                          <BiTrash
                            size={19}
                          />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>


      {/* ========================================================
          UPLOAD MODAL
      ======================================================== */}

      {showUploadForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-gray-900">
                  Upload Document
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a document to{" "}
                  <span className="font-medium text-gray-700">
                    {contractNo}
                  </span>
                </p>

              </div>


              <button
                type="button"
                onClick={closeUploadForm}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <BiX />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleUpload}
            >

              <div className="space-y-5 p-6">

                {/* DOCUMENT NAME */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Document Name
                  </label>

                  <input
                    type="text"
                    name="document_name"
                    value={
                      form.document_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Signed Contract"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* DOCUMENT TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Document Type
                  </label>

                  <select
                    name="document_type"
                    value={
                      form.document_type
                    }
                    onChange={
                      handleChange
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Proposal">
                      Proposal
                    </option>

                    <option value="Purchase Order">
                      Purchase Order
                    </option>

                    <option value="Invoice">
                      Invoice
                    </option>

                    <option value="Certificate">
                      Certificate
                    </option>

                    <option value="Amendment">
                      Amendment
                    </option>

                    <option value="Renewal">
                      Renewal
                    </option>

                    <option value="Supporting Document">
                      Supporting Document
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                {/* FILE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    File
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={
                      handleFileChange
                    }
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    required
                    className="block w-full cursor-pointer rounded-lg border border-gray-300 text-sm text-gray-600 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Maximum file size: 10 MB.
                    Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG.
                  </p>

                  {form.file && (

                    <p className="mt-2 text-sm text-blue-600">
                      Selected:{" "}
                      <span className="font-medium">
                        {form.file.name}
                      </span>
                    </p>

                  )}

                </div>


                {/* DESCRIPTION */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    rows="3"
                    placeholder="Optional description..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* ADMIN NOTICE */}

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

                  <p className="text-sm font-semibold text-blue-800">
                    Administrator access
                  </p>

                  <p className="mt-1 text-sm text-blue-700">
                    Only authorized administrators can upload or manage contract documents.
                  </p>

                </div>

              </div>


              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={closeUploadForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Uploading..."
                    : "Upload Document"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default ContractDocuments;