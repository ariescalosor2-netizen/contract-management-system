import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function RecentContracts({
  contracts = [],
  loading = false,
}) {
  const navigate = useNavigate();

  const recentContracts =
    useMemo(() => {
      return [...contracts]
        .sort((a, b) => {
          const dateA = new Date(
            a.created_at ||
              a.createdAt ||
              a.start_date ||
              a.startDate ||
              0
          );

          const dateB = new Date(
            b.created_at ||
              b.createdAt ||
              b.start_date ||
              b.startDate ||
              0
          );

          return dateB - dateA;
        })
        .slice(0, 5);
    }, [contracts]);

  const getStatusClass = (
    status
  ) => {
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

  const getContractName = (
    contract
  ) => {
    return (
      contract.title ||
      contract.name ||
      contract.contract_name ||
      "Untitled Contract"
    );
  };

  const getContractType = (
    contract
  ) => {
    return (
      contract.contract_type_name ||
      contract.contract_type ||
      contract.type ||
      "—"
    );
  };

  const getPartyName = (
    contract
  ) => {
    return (
      contract.party_name ||
      contract.party ||
      contract.counterparty ||
      "—"
    );
  };

  const formatDate = (
    contract
  ) => {
    const dateValue =
      contract.created_at ||
      contract.createdAt ||
      contract.start_date ||
      contract.startDate;

    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-5">

        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Recent Contracts
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Latest contracts added to
            the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/contracts")
          }
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="py-16 text-center text-gray-400">
          Loading recent contracts...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        recentContracts.length ===
          0 && (
          <div className="py-16 text-center text-gray-400">
            No contracts available.
          </div>
        )}

      {/* TABLE */}

      {!loading &&
        recentContracts.length >
          0 && (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-200">

                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">
                    Contract
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">
                    Type
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">
                    Party
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody>

                {recentContracts.map(
                  (contract) => (
                    <tr
                      key={
                        contract.id
                      }
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >

                      <td className="py-4 px-3">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              "/contracts"
                            )
                          }
                          className="text-left font-medium text-slate-800 hover:text-blue-600"
                        >
                          {getContractName(
                            contract
                          )}
                        </button>

                        {contract.contract_no && (
                          <p className="text-xs text-gray-400 mt-1">
                            {
                              contract.contract_no
                            }
                          </p>
                        )}

                      </td>

                      <td className="py-4 px-3 text-sm text-gray-600">
                        {getContractType(
                          contract
                        )}
                      </td>

                      <td className="py-4 px-3 text-sm text-gray-600">
                        {getPartyName(
                          contract
                        )}
                      </td>

                      <td className="py-4 px-3">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                            contract.status
                          )}`}
                        >
                          {contract.status ||
                            "Unknown"}
                        </span>

                      </td>

                      <td className="py-4 px-3 text-sm text-gray-500">
                        {formatDate(
                          contract
                        )}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

    </div>
  );
}

export default RecentContracts;