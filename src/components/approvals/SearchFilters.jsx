import { BiSearch, BiFilterAlt } from 'react-icons/bi';

function SearchFilters() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {/* Search */}
        <div className="col-span-1 relative md:col-span-2 xl:col-span-5">
          <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

          <input
            type="text"
            placeholder="Search by contract no., title, or party..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Approval Type */}
        <select className="col-span-1 border rounded-xl px-4 py-3 md:col-span-1 xl:col-span-2">
          <option>Approval Type</option>
          <option>All</option>
          <option>New Contract</option>
          <option>Renewal</option>
          <option>Amendment</option>
        </select>

        {/* Contract Type */}
        <select className="col-span-1 border rounded-xl px-4 py-3 md:col-span-1 xl:col-span-2">
          <option>Contract Type</option>
          <option>All</option>
          <option>Goods</option>
          <option>Services</option>
          <option>Maintenance</option>
        </select>

        {/* Priority */}
        <select className="col-span-1 border rounded-xl px-4 py-3 md:col-span-1 xl:col-span-2">
          <option>Priority</option>
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {/* Filter Button */}
        <button className="col-span-1 flex items-center justify-center gap-2 border rounded-xl hover:bg-gray-50 transition md:col-span-1 xl:col-span-1">
          <BiFilterAlt />
          Filters
        </button>
      </div>
    </div>
  );
}

export default SearchFilters;
