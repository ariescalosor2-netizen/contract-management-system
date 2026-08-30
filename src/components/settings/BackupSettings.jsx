import { useState } from "react";

function BackupSettings() {
  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleBackup = () => {
    setMessage("");
    setError("");
    setLoading(true);

    /*
      Backend backup endpoint is not yet
      confirmed, so no fake API request
      is being made here.
    */

    setTimeout(() => {
      setLoading(false);

      setError(
        "Backup service is not connected yet. Please configure the backend backup endpoint first."
      );
    }, 500);
  };

  const handleRestore = () => {
    setMessage("");
    setError("");

    const confirmed =
      window.confirm(
        "Restore will replace the current system data with a backup. Continue?"
      );

    if (!confirmed) {
      return;
    }

    setError(
      "Restore service is not connected yet. Please configure the backend restore endpoint first."
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Backup & Restore
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Manage system backups and restore previous
          system data.
        </p>
      </div>

      {/* SUCCESS */}
      {message && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {/* BACKUP */}
      <div className="border border-gray-200 rounded-xl p-6 mb-6">

        <h3 className="text-lg font-semibold text-slate-800">
          Create Backup
        </h3>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Create a backup of the system data for
          recovery purposes.
        </p>

        <button
          type="button"
          onClick={handleBackup}
          disabled={loading}
          className={`px-5 py-3 rounded-lg text-white transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Preparing..."
            : "Create Backup"}
        </button>

      </div>

      {/* RESTORE */}
      <div className="border border-red-200 rounded-xl p-6">

        <h3 className="text-lg font-semibold text-slate-800">
          Restore Backup
        </h3>

        <p className="text-sm text-gray-500 mt-1 mb-5">
          Restore system data from a previously created
          backup.
        </p>

        <div className="mb-5 rounded-lg bg-red-50 border border-red-100 p-4">
          <p className="text-sm text-red-700">
            <strong>Warning:</strong> Restoring a backup
            may replace existing system data. Make sure
            you have a recent backup before continuing.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestore}
          className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
        >
          Restore Backup
        </button>

      </div>

      {/* STATUS */}
      <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
        <p className="text-sm text-gray-500">
          Backup Status
        </p>

        <p className="font-medium text-slate-800 mt-1">
          Backend backup service not configured
        </p>
      </div>

    </div>
  );
}

export default BackupSettings;