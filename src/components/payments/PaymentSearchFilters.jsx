import {
  BiSearch,
  BiFilterAlt,
  BiX,
} from "react-icons/bi";

function PaymentSearchFilters({
  searchTerm = "",
  onSearchChange,
  statusFilter = "All Status",
  onStatusChange,
  paymentTypeFilter = "All Payment Types",
  onPaymentTypeChange,
  contractFilter = "All Contracts",
  onContractChange,
  contractOptions = [],
  onClear,
}) {
  const hasFilters =
    searchTerm !== "" ||
    statusFilter !== "All Status" ||
    paymentTypeFilter !==
      "All Payment Types" ||
    contractFilter !==
      "All Contracts";

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">

        {/* SEARCH */}

        <div className="relative xl:col-span-4">

          <BiSearch
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-xl
              text-gray-400
            "
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              onSearchChange?.(
                event.target.value
              )
            }
            placeholder="Search payments..."
            className="
              w-full
              rounded-xl
              border
              border-gray-300
              py-3
              pl-12
              pr-4
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
            "
          />

        </div>

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusChange?.(
              event.target.value
            )
          }
          className="
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            xl:col-span-2
          "
        >

          <option>
            All Status
          </option>

          <option>
            Paid
          </option>

          <option>
            Pending
          </option>

          <option>
            For Review
          </option>

          <option>
            Overdue
          </option>

        </select>

        {/* PAYMENT TYPE */}

        <select
          value={paymentTypeFilter}
          onChange={(event) =>
            onPaymentTypeChange?.(
              event.target.value
            )
          }
          className="
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            xl:col-span-2
          "
        >

          <option>
            All Payment Types
          </option>

          <option>
            Advance Payment
          </option>

          <option>
            Progress Payment
          </option>

          <option>
            Partial Payment
          </option>

          <option>
            Final Payment
          </option>

        </select>

        {/* CONTRACT */}

        <select
          value={contractFilter}
          onChange={(event) =>
            onContractChange?.(
              event.target.value
            )
          }
          className="
            rounded-xl
            border
            border-gray-300
            px-4
            py-3
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
            xl:col-span-2
          "
        >

          <option>
            All Contracts
          </option>

          {contractOptions.map(
            (contractNo) => (
              <option
                key={contractNo}
                value={contractNo}
              >
                {contractNo}
              </option>
            )
          )}

        </select>

        {/* FILTER BUTTON */}

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className={`
            flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            px-4
            py-3
            transition
            xl:col-span-2
            ${
              hasFilters
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "cursor-not-allowed border-gray-200 text-gray-300"
            }
          `}
        >

          {hasFilters ? (
            <BiX size={20} />
          ) : (
            <BiFilterAlt size={20} />
          )}

          {hasFilters
            ? "Clear Filters"
            : "Filters"}

        </button>

      </div>

      {/* ACTIVE FILTER INDICATOR */}

      {hasFilters && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">

          <span className="font-medium">
            Filters applied
          </span>

          {searchTerm && (
            <span className="rounded-full bg-gray-100 px-3 py-1">
              Search: {searchTerm}
            </span>
          )}

          {statusFilter !==
            "All Status" && (
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {statusFilter}
            </span>
          )}

          {paymentTypeFilter !==
            "All Payment Types" && (
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {paymentTypeFilter}
            </span>
          )}

          {contractFilter !==
            "All Contracts" && (
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {contractFilter}
            </span>
          )}

        </div>
      )}

    </div>
  );
}

export default PaymentSearchFilters;