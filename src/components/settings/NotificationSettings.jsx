import { useState } from "react";

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    approvalNotifications: true,
    paymentReminders: true,
    renewalReminders: true,
    weeklyReports: false,
  });

  const [savedSettings, setSavedSettings] =
    useState(settings);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleToggle = (field) => {
    setSettings((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));

    setMessage("");
    setError("");
  };

  const handleSave = (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    // Frontend settings save.
    // No unconfirmed backend endpoint is used.
    setTimeout(() => {
      setSavedSettings(settings);
      setSaving(false);

      setMessage(
        "Notification settings saved successfully."
      );
    }, 500);
  };

  const handleCancel = () => {
    setSettings(savedSettings);
    setMessage("");
    setError("");
  };

  const hasChanges =
    JSON.stringify(settings) !==
    JSON.stringify(savedSettings);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">
          Notification Settings
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Configure which notifications and reminders
          you want to receive.
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
        <div className="space-y-6">

          {/* EMAIL NOTIFICATIONS */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="pr-6">
              <h3 className="font-medium text-slate-800">
                Email Notifications
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Receive notifications via email.
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() =>
                handleToggle(
                  "emailNotifications"
                )
              }
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* APPROVAL NOTIFICATIONS */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="pr-6">
              <h3 className="font-medium text-slate-800">
                Approval Notifications
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Notify approvers when a contract needs
                approval.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                settings.approvalNotifications
              }
              onChange={() =>
                handleToggle(
                  "approvalNotifications"
                )
              }
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* PAYMENT REMINDERS */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="pr-6">
              <h3 className="font-medium text-slate-800">
                Payment Reminders
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Notify before payment due dates.
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings.paymentReminders}
              onChange={() =>
                handleToggle(
                  "paymentReminders"
                )
              }
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* RENEWAL REMINDERS */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className="pr-6">
              <h3 className="font-medium text-slate-800">
                Renewal Reminders
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Notify before contract expiration.
              </p>
            </div>

            <input
              type="checkbox"
              checked={
                settings.renewalReminders
              }
              onChange={() =>
                handleToggle(
                  "renewalReminders"
                )
              }
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* WEEKLY REPORTS */}
          <div className="flex items-center justify-between">
            <div className="pr-6">
              <h3 className="font-medium text-slate-800">
                Weekly Reports
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Receive weekly system reports.
              </p>
            </div>

            <input
              type="checkbox"
              checked={settings.weeklyReports}
              onChange={() =>
                handleToggle(
                  "weeklyReports"
                )
              }
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
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

export default NotificationSettings;