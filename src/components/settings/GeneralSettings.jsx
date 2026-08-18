import { useState } from "react";

function GeneralSettings() {
  const [form, setForm] = useState({
    organizationName: "Regis Marie College",
    email: "admin@rmc.edu.ph",
    phone: "+63 912 345 6789",
    currency: "Philippine Peso (₱)",
    timeZone: "Asia/Manila",
    language: "English",
  });

  const [savedForm, setSavedForm] = useState(form);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleSave = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.organizationName.trim()) {
      setError("Organization name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setSaving(true);

    // Frontend settings save.
    // No backend endpoint is assumed here.
    setTimeout(() => {
      setSavedForm(form);
      setSaving(false);
      setMessage("General settings saved successfully.");
    }, 500);
  };

  const handleCancel = () => {
    setForm(savedForm);
    setMessage("");
    setError("");
  };

  const hasChanges =
    JSON.stringify(form) !==
    JSON.stringify(savedForm);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          General Settings
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Configure the general information and preferences
          of the contract management system.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ORGANIZATION NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>

            <input
              type="text"
              value={form.organizationName}
              onChange={(e) =>
                handleChange(
                  "organizationName",
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter organization name"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter email address"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter phone number"
            />
          </div>

          {/* CURRENCY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>

            <select
              value={form.currency}
              onChange={(e) =>
                handleChange(
                  "currency",
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>
                Philippine Peso (₱)
              </option>

              <option>
                US Dollar ($)
              </option>
            </select>
          </div>

          {/* TIME ZONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>

            <select
              value={form.timeZone}
              onChange={(e) =>
                handleChange(
                  "timeZone",
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="Asia/Manila">
                Asia/Manila
              </option>

              <option value="UTC">
                UTC
              </option>
            </select>
          </div>

          {/* LANGUAGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>

            <select
              value={form.language}
              onChange={(e) =>
                handleChange(
                  "language",
                  e.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="English">
                English
              </option>

              <option value="Filipino">
                Filipino
              </option>
            </select>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!hasChanges || saving}
            className={`px-5 py-3 rounded-lg border transition ${
              !hasChanges || saving
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!hasChanges || saving}
            className={`px-6 py-3 rounded-lg text-white transition ${
              !hasChanges || saving
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeneralSettings;