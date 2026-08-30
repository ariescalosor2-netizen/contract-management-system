import { useMemo, useState } from "react";
import { BiDotsVerticalRounded, BiX } from "react-icons/bi";

function RenewalsTable({ renewals }) {
  const [selectedRenewal, setSelectedRenewal] = useState(null);

  const statusBadge = (status = "") => {
    const normalizedStatus = String(status).toLowerCase();

    if (normalizedStatus === "active") {
      return "bg-green-100 text-green-700";
    }

    if (normalizedStatus === "expired") {
      return "bg-red-100 text-red-700";
    }

    if (normalizedStatus.includes("due")) {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const rows = useMemo(() => {
    return (renewals || []).map((renewal) => ({
      ...renewal,

      // Backend fields
      renewalNo:
        renewal.renewal_no ??
        renewal.renewalNo ??
        "—",

      contractNo:
        renewal.contract_no ??
        renewal.contractNo ??
        "—",

      title:
        renewal.title ??
        renewal.contract_title ??
        "—",

      party:
        renewal.party ??
        renewal.party_name ??
        "—",

      renewalType:
        renewal.renewal_type ??
        renewal.renewalType ??
        "—",

      currentEndDate:
        renewal.current_end_date ??
        renewal.currentEndDate ??
        "—",

      newEndDate:
        renewal.new_end_date ??
        renewal.newEndDate ??
        "—",

      status:
        renewal.status ??
        "—",
    }));
  }, [renewals]);

  return (
    <>
      {/* TABLE */}
      <div className="renewals-table-container w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[1050px] table-auto">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-sm text-gray-600">
                <th className="w-[11%] px-4 py-4">
                  Renewal No.
                </th>

                <th className="w-[11%] px-3 py-4">
                  Contract No.
                </th>

                <th className="w-[16%] px-3 py-4">
                  Contract Title
                </th>

                <th className="w-[13%] px-3 py-4">
                  Party
                </th>

                <th className="w-[13%] px-3 py-4">
                  Renewal Type
                </th>

                <th className="w-[11%] px-3 py-4">
                  Current End
                </th>

                <th className="w-[11%] px-3 py-4">
                  New End
                </th>

                <th className="w-[8%] px-3 py-4">
                  Status
                </th>

                <th className="w-[10%] px-3 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.length > 0 ? (
                rows.map((renewal) => (
                  <tr
                    key={renewal.id}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    {/* Renewal No */}
                    <td className="break-words px-4 py-5 align-top">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRenewal(renewal)
                        }
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {renewal.renewalNo}
                      </button>
                    </td>

                    {/* Contract No */}
                    <td className="break-words px-3 py-5 align-top text-sm text-gray-700">
                      {renewal.contractNo}
                    </td>

                    {/* Title */}
                    <td className="break-words px-3 py-5 align-top text-sm text-gray-700">
                      {renewal.title}
                    </td>

                    {/* Party */}
                    <td className="break-words px-3 py-5 align-top text-sm text-gray-700">
                      {renewal.party}
                    </td>

                    {/* Renewal Type */}
                    <td className="break-words px-3 py-5 align-top text-sm text-gray-700">
                      {renewal.renewalType}
                    </td>

                    {/* Current End */}
                    <td className="break-words px-3 py-5 align-top text-sm text-gray-700">
                      {renewal.currentEndDate}
                    </td>

                    {/* New End */}
                    <td className="break-words px-3 py-5 align-top text-sm text-gray-700">
                      {renewal.newEndDate}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-5 align-top">
                      <span
                        className={`inline-flex max-w-full rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
                          renewal.status
                        )}`}
                      >
                        {renewal.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-5 align-top">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRenewal(renewal)
                          }
                          className="rounded-lg border border-blue-600 px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-600 hover:text-white"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRenewal(renewal)
                          }
                          className="text-xl text-gray-500 transition hover:text-gray-800"
                          aria-label={`More options for ${renewal.renewalNo}`}
                        >
                          <BiDotsVerticalRounded />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No renewals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {rows.length > 0 ? 1 : 0} to{" "}
            {rows.length} of {rows.length} renewals
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="h-9 w-9 rounded-lg border text-gray-400 disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            <button
              type="button"
              className="h-9 w-9 rounded-lg bg-blue-600 text-white"
            >
              1
            </button>

            <button
              type="button"
              disabled
              className="h-9 w-9 rounded-lg border text-gray-400 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* RENEWAL DETAILS MODAL */}
      {selectedRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  {selectedRenewal.renewalNo}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  Renewal Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRenewal(null)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close renewal details"
              >
                <BiX size={24} />
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-5 px-6 py-6 sm:grid-cols-2">
              
              <Detail
                label="Renewal No."
                value={selectedRenewal.renewalNo}
              />

              <Detail
                label="Contract No."
                value={selectedRenewal.contractNo}
              />

              <Detail
                label="Contract Title"
                value={selectedRenewal.title}
              />

              <Detail
                label="Party"
                value={selectedRenewal.party}
              />

              <Detail
                label="Renewal Type"
                value={selectedRenewal.renewalType}
              />

              <Detail
                label="Current End Date"
                value={selectedRenewal.currentEndDate}
              />

              <Detail
                label="New End Date"
                value={selectedRenewal.newEndDate}
              />

              {/* Status */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                  Status
                </p>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadge(
                    selectedRenewal.status
                  )}`}
                >
                  {selectedRenewal.status}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedRenewal(null)
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
}


export default RenewalsTable;