import { BiSearch, BiFilterAlt } from "react-icons/bi";

function SearchFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">

        {/* Search */}
        <div className="relative col-span-1 md:col-span-2 xl:col-span-7">
          <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contract types..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="col-span-1 border rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500 md:col-span-1 xl:col-span-3"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        {/* Filter */}
        <button
          type="button"
          className="col-span-1 flex items-center justify-center gap-2 border rounded-xl hover:bg-gray-50 transition md:col-span-1 xl:col-span-2"
        >
          <BiFilterAlt />
          Filters
        </button>

      </div>
    </div>
  );
}

export default SearchFilters;