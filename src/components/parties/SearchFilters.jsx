import {
  BiSearch,
  BiFilterAlt,
} from "react-icons/bi";

function SearchFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}) {
  return (
    <div className="
      rounded-xl
      border
      border-gray-200
      bg-white
      p-4
      shadow-sm
    ">

      <div className="
        grid
        grid-cols-1
        gap-3
        md:grid-cols-2
        lg:grid-cols-12
      ">

        {/* SEARCH */}

        <div className="
          relative
          lg:col-span-6
        ">

          <BiSearch className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-xl
            text-gray-400
          " />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search parties..."
            className="
              w-full
              rounded-lg
              border
              border-gray-300
              py-3
              pl-12
              pr-4
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-100
            "
          />

        </div>


        {/* TYPE */}

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value
            )
          }
          className="
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-100
            lg:col-span-2
          "
        >

          <option value="All Types">
            All Types
          </option>

          <option value="Organization">
            Organization
          </option>

          <option value="Individual">
            Individual
          </option>

        </select>


        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="
            rounded-lg
            border
            border-gray-300
            bg-white
            px-4
            py-3
            outline-none
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-100
            lg:col-span-2
          "
        >

          <option value="All Status">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>

        </select>


        {/* FILTER DISPLAY */}

        <div className="
          flex
          items-center
          justify-center
          gap-2
          rounded-lg
          border
          border-gray-300
          px-4
          py-3
          text-sm
          font-medium
          text-gray-600
          lg:col-span-2
        ">

          <BiFilterAlt size={18} />

          Filters

        </div>

      </div>

    </div>
  );
}

export default SearchFilters;