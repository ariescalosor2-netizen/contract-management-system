import { BiSearch, BiFilterAlt, BiX } from "react-icons/bi";

function RenewalSearchFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  contractFilter,
  setContractFilter,
  renewalTypeFilter,
  setRenewalTypeFilter,
  contractOptions,
  onClear,
}) {
  const hasFilters =
    searchTerm ||
    statusFilter !== "All Status" ||
    contractFilter !== "All Contracts" ||
    renewalTypeFilter !== "All Renewal Types";

  return (
    <div className="mb-6 w-full min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="relative min-w-0 xl:col-span-4">
          <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search renewals..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-2"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Due Soon</option>
          <option>Expired</option>
        </select>

        <select
          value={contractFilter}
          onChange={(event) => setContractFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-2"
        >
          <option>All Contracts</option>
          {contractOptions.map((contractNo) => (
            <option key={contractNo} value={contractNo}>
              {contractNo}
            </option>
          ))}
        </select>

        <select
          value={renewalTypeFilter}
          onChange={(event) => setRenewalTypeFilter(event.target.value)}
          className="min-w-0 rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 xl:col-span-2"
        >
          <option>All Renewal Types</option>
          <option>Annual Renewal</option>
          <option>Multi-Year Renewal</option>
          <option>One-Time Renewal</option>
        </select>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 xl:col-span-2"
        >
          {hasFilters ? <BiX /> : <BiFilterAlt />}
          {hasFilters ? "Clear" : "Filters"}
        </button>
      </div>
    </div>
  );
}

export default RenewalSearchFilters;