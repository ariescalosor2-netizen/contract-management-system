import { useEffect, useState } from "react";

import { getContractTypes } from "../../services/contractTypeService";
import { getParties } from "../../services/partyService";

import {
  createContract,
  updateContract,
} from "../../services/contractService";


function ContractModal({
  isOpen,
  onClose,
  initialData = null,
  mode = "create",
  onSaved,
}) {

  const [contractTypes, setContractTypes] =
    useState([]);

  const [parties, setParties] =
    useState([]);

  const [loadingData, setLoadingData] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  const emptyForm = {
    title: "",
    contract_type_id: "",
    party_id: "",
    start_date: "",
    end_date: "",
    value: "",
    description: "",
  };


  const [formData, setFormData] =
    useState(emptyForm);


  // =========================================================
  // INITIALIZE FORM
  // =========================================================

  useEffect(() => {

    if (!isOpen) {
      return;
    }


    setError("");


    loadFormData();


    if (initialData) {

      setFormData({

        title:
          initialData.title || "",

        contract_type_id:
          initialData.contract_type_id || "",

        party_id:
          initialData.party_id || "",

        start_date:
          initialData.start_date
            ? String(
                initialData.start_date
              ).substring(0, 10)
            : "",

        end_date:
          initialData.end_date
            ? String(
                initialData.end_date
              ).substring(0, 10)
            : "",

        value:
          initialData.value !== null &&
          initialData.value !== undefined
            ? initialData.value
            : "",

        description:
          initialData.description || "",
      });

    } else {

      setFormData({
        ...emptyForm
      });

    }

  }, [isOpen, initialData]);


  // =========================================================
  // LOAD CONTRACT TYPES AND PARTIES
  // =========================================================

  const loadFormData = async () => {

    try {

      setLoadingData(true);


      const [
        typesResponse,
        partiesResponse,
      ] = await Promise.all([

        getContractTypes(),

        getParties(),

      ]);


      setContractTypes(
        typesResponse?.data || []
      );


      setParties(
        partiesResponse?.data || []
      );


    } catch (error) {

      console.error(
        "Failed to load contract form data:",
        error
      );


      setError(
        "Failed to load contract types and parties."
      );


    } finally {

      setLoadingData(false);

    }

  };


  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    setError("");


    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!formData.title.trim()) {

      setError(
        "Contract title is required."
      );

      return;
    }


    if (!formData.contract_type_id) {

      setError(
        "Please select a contract type."
      );

      return;
    }


    if (!formData.party_id) {

      setError(
        "Please select a party."
      );

      return;
    }


    if (!formData.start_date) {

      setError(
        "Start date is required."
      );

      return;
    }


    if (!formData.end_date) {

      setError(
        "End date is required."
      );

      return;
    }


    if (
      formData.end_date <
      formData.start_date
    ) {

      setError(
        "End date cannot be earlier than start date."
      );

      return;
    }


    if (
      formData.value === "" ||
      Number.isNaN(
        Number(formData.value)
      )
    ) {

      setError(
        "Please enter a valid contract value."
      );

      return;
    }


    if (
      Number(formData.value) < 0
    ) {

      setError(
        "Contract value cannot be negative."
      );

      return;
    }


    // -------------------------------------------------------
    // SAVE
    // -------------------------------------------------------

    try {

      setSaving(true);


      const payload = {

        title:
          formData.title.trim(),

        contract_type_id:
          formData.contract_type_id,

        party_id:
          formData.party_id,

        start_date:
          formData.start_date,

        end_date:
          formData.end_date,

        value:
          Number(formData.value),

        description:
          formData.description.trim() ||
          null,
      };


      // -----------------------------------------------------
      // EDIT
      // -----------------------------------------------------

      if (
        mode === "edit" &&
        initialData?.id
      ) {

        await updateContract(
          initialData.id,
          payload
        );


      // -----------------------------------------------------
      // CREATE
      //
      // Backend automatically:
      //
      // 1. Generates Contract Number
      // 2. Creates Draft
      // 3. Finds authorized Approver
      // 4. Creates Approval
      // 5. Changes Draft → Pending Approval
      // -----------------------------------------------------

      } else {

        await createContract(
          payload
        );

      }


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      if (onSaved) {
        onSaved();
      }


      onClose();


    } catch (error) {

      console.error(
        "Failed to save contract:",
        error
      );


      const detail =
        error?.response?.data?.detail;


      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                item.msg
            )
            .join(", ")
        );


      } else {

        setError(
          detail ||
          error?.response?.data?.message ||
          "Failed to save contract."
        );

      }


    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // MODAL
  // =========================================================

  if (!isOpen) {
    return null;
  }


  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">


        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>

            <h2 className="text-xl font-bold text-slate-800">

              {mode === "edit"
                ? "Edit Contract"
                : "New Contract"}

            </h2>


            <p className="mt-1 text-sm text-gray-500">

              {mode === "edit"
                ? "Update the contract information."
                : "Create a new contract and submit it for approval automatically."}

            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-2xl text-gray-400 hover:text-gray-700 disabled:opacity-50"
          >
            ×
          </button>

        </div>


        {/* ===================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >


          {/* ERROR */}

          {error && (

            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}

            </div>

          )}


          {loadingData ? (

            <div className="py-12 text-center text-gray-500">

              Loading contract options...

            </div>

          ) : (

            <div className="space-y-5">


              {/* =================================================
                  CONTRACT NUMBER - EDIT ONLY
              ================================================= */}

              {mode === "edit" && (

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">

                    Contract Number

                  </label>


                  <input
                    type="text"
                    value={
                      initialData?.contract_no ||
                      ""
                    }
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-gray-600"
                  />


                  <p className="mt-1 text-xs text-gray-500">

                    Contract number is automatically generated by the system.

                  </p>

                </div>

              )}


              {/* =================================================
                  TITLE
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">

                  Contract Title

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>


                <input
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter contract title"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* =================================================
                  CONTRACT TYPE + PARTY
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                {/* CONTRACT TYPE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">

                    Contract Type

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <select
                    name="contract_type_id"
                    value={
                      formData.contract_type_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select contract type
                    </option>


                    {contractTypes.map(
                      (type) => (

                        <option
                          key={type.id}
                          value={type.id}
                        >
                          {type.name}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* PARTY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">

                    Party

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <select
                    name="party_id"
                    value={
                      formData.party_id
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select party
                    </option>


                    {parties.map(
                      (party) => (

                        <option
                          key={party.id}
                          value={party.id}
                        >
                          {party.name}
                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              {/* =================================================
                  DATES
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                {/* START DATE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">

                    Start Date

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <input
                    type="date"
                    name="start_date"
                    value={
                      formData.start_date
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* END DATE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">

                    End Date

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <input
                    type="date"
                    name="end_date"
                    value={
                      formData.end_date
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* =================================================
                  VALUE
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">

                  Contract Value

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>


                <input
                  type="number"
                  name="value"
                  value={
                    formData.value
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">

                  Description

                </label>


                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={4}
                  placeholder="Enter contract description..."
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* =================================================
                  AUTOMATIC WORKFLOW NOTICE
              ================================================= */}

              {mode === "create" && (

                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">

                  <p className="text-sm font-medium text-blue-800">

                    Automatic Approval Workflow

                  </p>


                  <p className="mt-1 text-xs leading-5 text-blue-700">

                    After creating the contract, the system will automatically generate the contract number and submit the contract for approval. An authorized Approver or Administrator will be assigned automatically.

                  </p>

                </div>

              )}

            </div>

          )}


          {/* ===================================================
              FOOTER
          =================================================== */}

          <div className="mt-6 flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                saving ||
                loadingData
              }
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving
                ? "Saving..."
                : mode === "edit"
                ? "Save Changes"
                : "Create & Submit"}

            </button>

          </div>


        </form>

      </div>

    </div>

  );

}


export default ContractModal;