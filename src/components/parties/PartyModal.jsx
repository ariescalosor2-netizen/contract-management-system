import { useEffect, useState } from "react";

function PartyModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "Organization",
    email: "",
    contact: "",
    status: "Active",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setError("");

    if (initialData) {
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "Organization",
        email: initialData.email || "",
        contact: initialData.contact || "",
        status: initialData.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        type: "Organization",
        email: "",
        contact: "",
        status: "Active",
      });
    }
  }, [initialData, isOpen]);


  if (!isOpen) {
    return null;
  }


  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const name = formData.name.trim();

    if (!name) {
      setError(
        "Party name is required."
      );
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        name,
        type: formData.type,
        email:
          formData.email.trim() || null,
        contact:
          formData.contact.trim() || null,
        status: formData.status,
      });

    } catch (error) {
      console.error(
        "Failed to save party:",
        error
      );

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save party."
      );

    } finally {
      setSaving(false);
    }
  };


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

        {/* HEADER */}

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
                ? "Edit Party"
                : "New Party"}
            </h2>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              {mode === "edit"
                ? "Update party information."
                : "Create a new party."}
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


        {/* FORM */}

        <form onSubmit={handleSubmit}>

          <div className="space-y-5 p-6">

            {error && (
              <div className="
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


            {/* NAME */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Party Name
                <span className="text-red-500">
                  {" "}*
                </span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={255}
                required
                disabled={saving}
                placeholder="e.g. ABC Corporation"
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


            {/* TYPE */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Type
              </label>

              <select
                name="type"
                value={formData.type}
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

                <option value="Organization">
                  Organization
                </option>

                <option value="Individual">
                  Individual
                </option>

              </select>

            </div>


            {/* EMAIL */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={255}
                disabled={saving}
                placeholder="contact@company.com"
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


            {/* CONTACT */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
                text-gray-700
              ">
                Contact
              </label>

              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                maxLength={50}
                disabled={saving}
                placeholder="e.g. 0917 123 4567"
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
                value={formData.status}
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


          {/* FOOTER */}

          <div className="
            flex
            justify-end
            gap-3
            border-t
            border-gray-200
            bg-gray-50
            px-6
            py-4
          ">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-lg
                border
                border-gray-300
                bg-white
                px-5
                py-2.5
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
                py-2.5
                font-medium
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Saving..."
                : mode === "edit"
                ? "Save Changes"
                : "Create Party"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default PartyModal;