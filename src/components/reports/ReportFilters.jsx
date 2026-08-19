import { BiCalendar, BiFilterAlt, BiRefresh } from 'react-icons/bi';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';

function ReportFilters() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        {/* Date Range */}
        <div className="col-span-1 relative md:col-span-2 xl:col-span-3">
          <BiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

          <input
            type="text"
            placeholder="Jan 1, 2026 - Dec 31, 2026"
            className="w-full pl-12 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contract Type */}
        <select className="col-span-1 border rounded-xl px-4 py-3 md:col-span-1 xl:col-span-2">
          <option>All Contract Types</option>
          <option>Goods</option>
          <option>Services</option>
          <option>Lease</option>
          <option>Consulting</option>
        </select>

        {/* Status */}
        <select className="col-span-1 border rounded-xl px-4 py-3 md:col-span-1 xl:col-span-2">
          <option>All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Expired</option>
        </select>

        {/* Filter */}
        <button className="col-span-1 flex items-center justify-center gap-2 border rounded-xl hover:bg-gray-50 transition md:col-span-1 xl:col-span-1">
          <BiFilterAlt />
          Filter
        </button>

        {/* Refresh */}
        <button className="col-span-1 flex items-center justify-center gap-2 border rounded-xl hover:bg-gray-50 transition md:col-span-1 xl:col-span-1">
          <BiRefresh />
          Refresh
        </button>

        {/* Export Excel */}
        <button className="col-span-1 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 transition md:col-span-1 xl:col-span-1">
          <HiOutlineDocumentArrowDown />
          Excel
        </button>

        {/* Export PDF */}
        <button className="col-span-1 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 transition md:col-span-1 xl:col-span-2">
          <HiOutlineDocumentArrowDown />
          PDF
        </button>
      </div>
    </div>
  );
}

export default ReportFilters;
