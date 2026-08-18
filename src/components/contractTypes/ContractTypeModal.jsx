import { useEffect, useState } from "react";

import {
  createContractType,
  updateContractType,
} from "../../services/contractTypeService";


function ContractTypeModal({
  isOpen,
  onClose,
  onSaved,
  initialData = null,
  mode = "create",
}) {

  const [formData, setFormData] =
    useState({
      name: "",
      description: "",
      icon: "📄",
      status: "Active",
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | INITIAL DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!isOpen) {
      return;
    }

    setError("");

    if (initialData) {

      setFormData({
        name:
          initialData.name || "",

        description:
          initialData.description || "",

        icon:
          initialData.icon || "📄",

        status:
          initialData.status || "Active",
      });

    } else {

      setFormData({
        name: "",
        description: "",
        icon: "📄",
        status: "Active",
      });

    }

  }, [
    isOpen,
    initialData,
  ]);


  /*
  |--------------------------------------------------------------------------
  | CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    const name =
      formData.name.trim();

    const description =
      formData.description.trim();

    if (!name) {
      setError(
        "Contract type name is required."
      );
      return;
    }

    try {

      setSaving(true);

      const payload = {
        name,
        description:
          description || null,
        icon:
          formData.icon.trim() ||
          null,
        status:
          formData.status,
      };


      let response;


      if (
        mode === "edit" &&
        initialData?.id
      ) {

        response =
          await updateContractType(
            initialData.id,
            payload
          );

      } else {

        response =
          await createContractType(
            payload
          );

      }


      if (
        response?.success === false
      ) {

        throw new Error(
          response.message ||
          "Failed to save contract type."
        );

      }


      onSaved?.();

    } catch (error) {

      console.error(
        "Failed to save contract type:",
        error
      );

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save contract type."
      );

    } finally {

      setSaving(false);

    }
  };


  if (!isOpen) {
    return null;
  }


  return (
    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-4
    ">

      <div className="
        w-full
        max-w-lg
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-2xl
      ">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-gray-200
          px-6
          py-5
        ">

          <div>

            <h2 className="
              text-xl
              font-bold
              text-slate-800
            ">
              {mode === "edit"
                ? "Edit Contract Type"
                : "New Contract Type"}
            </h2>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              {mode === "edit"
                ? "Update the contract type information."
                : "Create a new contract type."}
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              text-2xl
              text-gray-400
              hover:text-gray-700
              disabled:opacity-50
            "
          >
            ×
          </button>

        </div>


        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleSubmit}
          className="p-6"
        >

          {error && (

            <div className="
              mb-5
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            ">
              {error}
            </div>

          )}


          <div className="space-y-5">

            {/* NAME */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Type Name
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Services"
                disabled={saving}
                maxLength={100}
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                rows={4}
                placeholder="Describe this contract type..."
                disabled={saving}
                className="
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

            </div>


            {/* ICON */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Icon
              </label>

              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="📄"
                disabled={saving}
                maxLength={20}
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

              <p className="
                mt-1
                text-xs
                text-gray-400
              ">
                You may use an emoji such as 📄, 🛠️, 🏢, or 🤝.
              </p>

            </div>


            {/* STATUS */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={handleChange}
                disabled={saving}
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  py-3
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>

          </div>


          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div className="
            mt-6
            flex
            justify-end
            gap-3
            border-t
            border-gray-200
            pt-5
          ">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-lg
                border
                border-gray-300
                px-5
                py-3
                font-medium
                text-gray-700
                hover:bg-gray-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="
                rounded-lg
                bg-blue-600
                px-5
                py-3
                font-medium
                text-white
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : mode === "edit"
                ? "Save Changes"
                : "Create Contract Type"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


export default ContractTypeModal;