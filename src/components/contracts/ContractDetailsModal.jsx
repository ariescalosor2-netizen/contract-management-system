function ContractDetailsModal({
  isOpen,
  onClose,
  contract,
  onEdit,
}) {
  if (!isOpen || !contract) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    return `₱${Number(value).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";

      case "Pending":
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-700";

      case "Draft":
        return "bg-blue-100 text-blue-700";

      case "Expired":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      {/* Modal */}
      <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Contract Details
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              View contract information.
            </p>
          </div>

          {/* X Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-2xl"
          >
            ×
          </button>

        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Basic Information */}
          <div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Contract Number
                </p>

                <p className="font-medium text-blue-600">
                  {contract.contract_no}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Status
                </p>

                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                    contract.status
                  )}`}
                >
                  {contract.status}
                </span>
              </div>

              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">
                  Contract Title
                </p>

                <p className="font-medium text-gray-900">
                  {contract.title || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Contract Type
                </p>

                <p className="font-medium text-gray-900">
                  {contract.contract_type_name ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Party
                </p>

                <p className="font-medium text-gray-900">
                  {contract.party_name || "-"}
                </p>
              </div>

            </div>

          </div>

          {/* Contract Period */}
          <div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Contract Period
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Start Date
                </p>

                <p className="font-medium text-gray-900">
                  {formatDate(
                    contract.start_date
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  End Date
                </p>

                <p className="font-medium text-gray-900">
                  {formatDate(
                    contract.end_date
                  )}
                </p>
              </div>

            </div>

          </div>

          {/* Contract Value */}
          <div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Financial Information
            </h3>

            <div className="bg-gray-50 rounded-lg px-4 py-3 border">

              <p className="text-xs text-gray-500 mb-1">
                Contract Value
              </p>

              <p className="text-lg font-semibold text-gray-900">
                {formatValue(contract.value)}
              </p>

            </div>

          </div>

          {/* Description */}
          <div>

            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Description
            </h3>

            <div className="bg-gray-50 border rounded-lg px-4 py-3">

              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {contract.description ||
                  "No description provided."}
              </p>

            </div>

          </div>

          {/* Record Information */}
          <div>

            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Record Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Created At
                </p>

                <p className="text-sm text-gray-700">
                  {formatDate(
                    contract.created_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Updated At
                </p>

                <p className="text-sm text-gray-700">
                  {formatDate(
                    contract.updated_at
                  )}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 shrink-0">

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-white transition"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();

              if (onEdit) {
                onEdit(contract);
              }
            }}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Edit Contract
          </button>

        </div>

      </div>

    </div>
  );
}

export default ContractDetailsModal;