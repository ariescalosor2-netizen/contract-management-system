import { useEffect, useState } from "react";
import { BiX, BiCalendar, BiRefresh } from "react-icons/bi";
import { createRenewal } from "../../services/renewalService";
import api from "../../services/api";

function RenewalModal({ isOpen, onClose, onSuccess }) {
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    contract_id: "",
    renewal_type: "Annual Renewal",
    new_end_date: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    setError("");

    setFormData({
      contract_id: "",
      renewal_type: "Annual Renewal",
      new_end_date: "",
    });

    loadContracts();
  }, [isOpen]);

  const loadContracts = async () => {
    try {
      setLoadingContracts(true);
      setError("");

      const response = await api.get("/contracts/");

      const data = response.data?.data ?? response.data ?? [];

      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load contracts:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load contracts. Please try again."
      );
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.contract_id) {
      setError("Please select a contract.");
      return;
    }

    if (!formData.new_end_date) {
      setError("Please select the new end date.");
      return;
    }

    const selectedContract = contracts.find(
      (contract) =>
        String(contract.id) === String(formData.contract_id)
    );

    if (!selectedContract) {
      setError("The selected contract could not be found.");
      return;
    }

    const currentEndDate =
      selectedContract.end_date ||
      selectedContract.endDate ||
      "";

    if (currentEndDate) {
      const currentDate = new Date(`${currentEndDate}T00:00:00`);
      const newDate = new Date(`${formData.new_end_date}T00:00:00`);

      if (
        Number.isNaN(currentDate.getTime()) ||
        Number.isNaN(newDate.getTime())
      ) {
        setError("Invalid contract or renewal date.");
        return;
      }

      if (newDate <= currentDate) {
        setError(
          "The new end date must be later than the current contract end date."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      // Status is intentionally NOT sent from the frontend.
      // The backend/database should determine the renewal status.
      const payload = {
        contract_id: formData.contract_id,
        renewal_type: formData.renewal_type,
        new_end_date: formData.new_end_date,
      };

      await createRenewal(payload);

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Failed to create renewal:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to create renewal. Please try again.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BiRefresh size={25} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                New Renewal
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create a renewal request for an existing contract.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
          >
            <BiX size={25} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto px-6 py-6"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Contract */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Contract <span className="text-red-500">*</span>
            </label>

            <select
              name="contract_id"
              value={formData.contract_id}
              onChange={handleChange}
              disabled={loadingContracts || submitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="">
                {loadingContracts
                  ? "Loading contracts..."
                  : "Select a contract"}
              </option>

              {contracts.map((contract) => (
                <option
                  key={contract.id}
                  value={contract.id}
                >
                  {contract.contract_no || contract.contractNo || "—"}
                  {" — "}
                  {contract.title || "Untitled Contract"}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Contract */}
          {formData.contract_id && (
            <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
              {(() => {
                const selectedContract = contracts.find(
                  (contract) =>
                    String(contract.id) ===
                    String(formData.contract_id)
                );

                if (!selectedContract) {
                  return null;
                }

                return (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        Contract No.
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedContract.contract_no ||
                          selectedContract.contractNo ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        Contract Title
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedContract.title || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        Party
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedContract.party?.name ||
                          selectedContract.party_name ||
                          selectedContract.party ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                        Current End Date
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {selectedContract.end_date ||
                          selectedContract.endDate ||
                          "—"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Renewal Type */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Renewal Type <span className="text-red-500">*</span>
            </label>

            <select
              name="renewal_type"
              value={formData.renewal_type}
              onChange={handleChange}
              disabled={submitting}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
            >
              <option value="Annual Renewal">
                Annual Renewal
              </option>

              <option value="Multi-Year Renewal">
                Multi-Year Renewal
              </option>

              <option value="One-Time Renewal">
                One-Time Renewal
              </option>
            </select>
          </div>

          {/* New End Date */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              New End Date <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <BiCalendar
                size={20}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="date"
                name="new_end_date"
                value={formData.new_end_date}
                onChange={handleChange}
                min={(() => {
                  const selectedContract = contracts.find(
                    (contract) =>
                      String(contract.id) ===
                      String(formData.contract_id)
                  );

                  const currentEndDate =
                    selectedContract?.end_date ||
                    selectedContract?.endDate ||
                    "";

                  if (!currentEndDate) {
                    return undefined;
                  }

                  const minimumDate = new Date(
                    `${currentEndDate}T00:00:00`
                  );

                  if (Number.isNaN(minimumDate.getTime())) {
                    return undefined;
                  }

                  minimumDate.setDate(
                    minimumDate.getDate() + 1
                  );

                  return minimumDate
                    .toISOString()
                    .split("T")[0];
                })()}
                disabled={submitting || !formData.contract_id}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            <p className="mt-2 text-xs text-gray-400">
              The new end date must be later than the current contract end
              date.
            </p>
          </div>
          

          {/* Footer */}
          <div className="mt-7 flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingContracts ||
                !formData.contract_id ||
                !formData.new_end_date
              }
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating..." : "+ Create Renewal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenewalModal;