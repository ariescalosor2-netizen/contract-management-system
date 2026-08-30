import { useState } from "react";

import {
  changePassword,
} from "../../services/authService";


function SecuritySettings() {

  const [form, setForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",

      sessionTimeout:
        "30 Minutes",

      passwordPolicy:
        "Strong",

      twoFactor: false,

      autoLogout: true,
    });


  const [savedForm, setSavedForm] =
    useState(form);


  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);


  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ============================================================
  // HANDLE CHANGE
  // ============================================================

  const handleChange = (
    field,
    value
  ) => {

    setForm(
      (previous) => ({
        ...previous,

        [field]: value,
      })
    );

    setMessage("");

    setError("");
  };


  // ============================================================
  // PASSWORD VALIDATION
  // ============================================================

  const validatePassword =
    () => {

      if (
        !form.currentPassword &&
        !form.newPassword &&
        !form.confirmPassword
      ) {
        return null;
      }


      if (
        !form.currentPassword
      ) {
        return (
          "Current password is required."
        );
      }


      if (
        !form.newPassword
      ) {
        return (
          "New password is required."
        );
      }


      if (
        form.newPassword.length < 8
      ) {
        return (
          "New password must be at least 8 characters."
        );
      }


      if (
        form.newPassword !==
        form.confirmPassword
      ) {
        return (
          "New password and confirmation do not match."
        );
      }


      if (
        form.currentPassword ===
        form.newPassword
      ) {
        return (
          "New password must be different from the current password."
        );
      }


      return null;
    };


  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = async (
    event
  ) => {

    event.preventDefault();

    setMessage("");

    setError("");


    const validation =
      validatePassword();


    if (validation) {

      setError(validation);

      return;
    }


    try {

      setSaving(true);


      // --------------------------------------------------------
      // ACTUAL PASSWORD CHANGE
      // --------------------------------------------------------

      const changingPassword =
        form.currentPassword ||
        form.newPassword ||
        form.confirmPassword;


      if (changingPassword) {

        await changePassword({

          currentPassword:
            form.currentPassword,

          newPassword:
            form.newPassword,

          confirmPassword:
            form.confirmPassword,
        });

      }


      // --------------------------------------------------------
      // SAVE LOCAL SECURITY PREFERENCES
      // --------------------------------------------------------

      const updatedForm = {
        ...form,

        currentPassword:
          "",

        newPassword:
          "",

        confirmPassword:
          "",
      };


      setForm(updatedForm);

      setSavedForm(
        updatedForm
      );


      setMessage(
        changingPassword
          ? "Password changed successfully."
          : "Security settings saved successfully."
      );

    } catch (err) {

      console.error(
        "Security settings error:",
        err
      );


      setError(
        err?.response?.data?.detail ||
        "Unable to update security settings."
      );

    } finally {

      setSaving(false);

    }
  };


  // ============================================================
  // CANCEL
  // ============================================================

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
          Security Settings
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Manage password, session, and account security preferences.
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
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <form
        onSubmit={handleSave}
      >

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


          {/* CURRENT PASSWORD */}

          <div className="md:col-span-2">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>

            <div className="relative">

              <input
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }

                value={
                  form.currentPassword
                }

                onChange={(e) =>
                  handleChange(
                    "currentPassword",
                    e.target.value
                  )
                }

                placeholder="Enter current password"

                autoComplete="current-password"

                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(
                    (previous) =>
                      !previous
                  )
                }

                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showCurrent
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* NEW PASSWORD */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>

            <div className="relative">

              <input
                type={
                  showNew
                    ? "text"
                    : "password"
                }

                value={
                  form.newPassword
                }

                onChange={(e) =>
                  handleChange(
                    "newPassword",
                    e.target.value
                  )
                }

                placeholder="Enter new password"

                autoComplete="new-password"

                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(
                    (previous) =>
                      !previous
                  )
                }

                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showNew
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            <p className="mt-2 text-xs text-gray-500">
              Minimum of 8 characters.
            </p>

          </div>


          {/* CONFIRM PASSWORD */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>

            <div className="relative">

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }

                value={
                  form.confirmPassword
                }

                onChange={(e) =>
                  handleChange(
                    "confirmPassword",
                    e.target.value
                  )
                }

                placeholder="Confirm new password"

                autoComplete="new-password"

                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    (previous) =>
                      !previous
                  )
                }

                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showConfirm
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* SESSION TIMEOUT */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout
            </label>

            <select
              value={
                form.sessionTimeout
              }

              onChange={(e) =>
                handleChange(
                  "sessionTimeout",
                  e.target.value
                )
              }

              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option>
                15 Minutes
              </option>

              <option>
                30 Minutes
              </option>

              <option>
                1 Hour
              </option>

              <option>
                2 Hours
              </option>

            </select>

          </div>


          {/* PASSWORD POLICY */}

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Policy
            </label>

            <select
              value={
                form.passwordPolicy
              }

              onChange={(e) =>
                handleChange(
                  "passwordPolicy",
                  e.target.value
                )
              }

              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >

              <option>
                Strong
              </option>

              <option>
                Medium
              </option>

              <option>
                Basic
              </option>

            </select>

          </div>

        </div>


        {/* SECURITY OPTIONS */}

        <div className="mt-8 border-t border-gray-200 pt-6">

          <h3 className="text-base font-semibold text-slate-800 mb-5">
            Security Options
          </h3>


          <div className="space-y-5">


            {/* TWO FACTOR */}

            <div className="flex justify-between items-center border-b border-gray-200 pb-5">

              <div className="pr-6">

                <h4 className="font-medium text-slate-800">
                  Enable Two-Factor Authentication
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  Require OTP verification during login.
                </p>

              </div>

              <input
                type="checkbox"
                checked={
                  form.twoFactor
                }
                onChange={() =>
                  handleChange(
                    "twoFactor",
                    !form.twoFactor
                  )
                }
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />

            </div>


            {/* AUTO LOGOUT */}

            <div className="flex justify-between items-center">

              <div className="pr-6">

                <h4 className="font-medium text-slate-800">
                  Auto Logout
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  Automatically log out inactive users.
                </p>

              </div>

              <input
                type="checkbox"
                checked={
                  form.autoLogout
                }
                onChange={() =>
                  handleChange(
                    "autoLogout",
                    !form.autoLogout
                  )
                }
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />

            </div>

          </div>

        </div>


        {/* ACTIONS */}

        <div className="mt-8 flex items-center justify-end gap-3">

          <button
            type="button"
            onClick={handleCancel}
            disabled={
              !hasChanges ||
              saving
            }

            className={`px-5 py-3 rounded-lg border transition ${
              !hasChanges ||
              saving
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={
              !hasChanges ||
              saving
            }

            className={`px-6 py-3 rounded-lg text-white transition ${
              !hasChanges ||
              saving
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

export default SecuritySettings;