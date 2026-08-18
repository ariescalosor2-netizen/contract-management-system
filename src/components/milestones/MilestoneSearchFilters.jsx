import {
  BiSearch,
  BiFilterAlt,
} from "react-icons/bi";


function MilestoneSearchFilters({
  search,
  setSearch,

  statusFilter,
  setStatusFilter,

  contractFilter,
  setContractFilter,

  progressFilter,
  setProgressFilter,

  contractOptions = [],

  onClear,
}) {

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">

        {/* SEARCH */}

        <div className="xl:col-span-4 relative">

          <BiSearch
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-gray-400
              text-xl
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search milestones..."
            className="
              w-full
              pl-12
              pr-4
              py-3
              border
              border-gray-300
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

        </div>


        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="
            xl:col-span-2
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >

          <option>
            All Status
          </option>

          <option>
            Completed
          </option>

          <option>
            In Progress
          </option>

          <option>
            Not Started
          </option>

          <option>
            Overdue
          </option>

        </select>


        {/* CONTRACT */}

        <select
          value={contractFilter}
          onChange={(e) =>
            setContractFilter(
              e.target.value
            )
          }
          className="
            xl:col-span-2
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
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


        {/* PROGRESS */}

        <select
          value={progressFilter}
          onChange={(e) =>
            setProgressFilter(
              e.target.value
            )
          }
          className="
            xl:col-span-2
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "
        >

          <option>
            All Progress
          </option>

          <option>
            0–25%
          </option>

          <option>
            26–50%
          </option>

          <option>
            51–75%
          </option>

          <option>
            76–100%
          </option>

        </select>


        {/* CLEAR */}

        <button
          type="button"
          onClick={onClear}
          className="
            xl:col-span-2
            flex
            items-center
            justify-center
            gap-2
            border
            border-gray-300
            rounded-xl
            px-4
            py-3
            hover:bg-gray-50
            transition
          "
        >

          <BiFilterAlt />

          Clear Filters

        </button>

      </div>

    </div>
  );
}


export default MilestoneSearchFilters;