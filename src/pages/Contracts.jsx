import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BiPlus, BiFilterAlt } from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import ContractsTable from "../components/contracts/ContractsTable";
import ContractModal from "../components/contracts/ContractModal";

import { getContractTypes } from "../services/contractTypeService";
import { getParties } from "../services/partyService";


function Contracts() {
  const [searchParams] =
    useSearchParams();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [typeFilter, setTypeFilter] =
    useState("All Types");

  const [partyFilter, setPartyFilter] =
    useState("All Parties");

  const [expiringFilter, setExpiringFilter] =
    useState(false);

  const [contractTypes, setContractTypes] =
    useState([]);

  const [parties, setParties] =
    useState([]);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedContract, setSelectedContract] =
    useState(null);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [refreshTrigger, setRefreshTrigger] =
    useState(0);


  /*
  |--------------------------------------------------------------------------
  | URL FILTERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const status =
      searchParams.get("status");

    const filter =
      searchParams.get("filter");

    const validStatuses = [
      "Active",
      "Pending Approval",
      "Draft",
      "Approved",
      "Rejected",
      "Expired",
    ];

    if (
      validStatuses.includes(status)
    ) {
      setStatusFilter(status);
    } else {
      setStatusFilter("All Status");
    }

    setExpiringFilter(
      filter === "expiring"
    );
  }, [searchParams]);


  /*
  |--------------------------------------------------------------------------
  | LOAD FILTER OPTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadFilterOptions();
  }, []);


  const loadFilterOptions = async () => {
    try {
      const [
        contractTypesResponse,
        partiesResponse,
      ] = await Promise.all([
        getContractTypes(),
        getParties(),
      ]);

      setContractTypes(
        contractTypesResponse?.data || []
      );

      setParties(
        partiesResponse?.data || []
      );

    } catch (error) {
      console.error(
        "Failed to load contract filters:",
        error
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | NEW CONTRACT
  |--------------------------------------------------------------------------
  */

  const handleNewContract = () => {
    setSelectedContract(null);
    setIsModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | EDIT CONTRACT
  |--------------------------------------------------------------------------
  */

  const handleEditContract = (
    contract
  ) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | CONTRACT SAVED
  |--------------------------------------------------------------------------
  */

  const handleContractSaved = () => {
    setRefreshTrigger(
      (previous) =>
        previous + 1
    );
  };


  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContract(null);
  };


  /*
  |--------------------------------------------------------------------------
  | CLEAR FILTERS
  |--------------------------------------------------------------------------
  */

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setTypeFilter("All Types");
    setPartyFilter("All Parties");
    setExpiringFilter(false);
  };


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <MainLayout>

      <div className="space-y-6">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-bold text-slate-800">
              Contracts
            </h1>

            <p className="mt-1 text-gray-500">
              Create, manage, and track your
              organization&apos;s contracts.
            </p>

          </div>


          <button
            type="button"
            onClick={handleNewContract}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <BiPlus size={22} />

            New Contract
          </button>

        </div>


        {/* =========================================================
            SEARCH + FILTERS
        ========================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            {/* SEARCH */}

            <div className="relative flex-1">

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search contract number or title..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >

              <option>
                All Status
              </option>

              <option>
                Draft
              </option>

              <option>
                Pending Approval
              </option>

              <option>
                Approved
              </option>

              <option>
                Rejected
              </option>

              <option>
                Active
              </option>

              <option>
                Expired
              </option>

            </select>


            {/* FILTER BUTTON */}

            <button
              type="button"
              onClick={() =>
                setFiltersOpen(
                  (previous) =>
                    !previous
                )
              }
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium transition ${
                filtersOpen
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >

              <BiFilterAlt size={20} />

              Filters

            </button>

          </div>


          {/* =======================================================
              ADVANCED FILTERS
          ======================================================== */}

          {filtersOpen && (

            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 md:grid-cols-3">

              {/* CONTRACT TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Contract Type
                </label>

                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option>
                    All Types
                  </option>

                  {contractTypes.map(
                    (type) => (

                      <option
                        key={type.id}
                        value={type.id}
                      >
                        {type.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* PARTY */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Party
                </label>

                <select
                  value={partyFilter}
                  onChange={(e) =>
                    setPartyFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >

                  <option>
                    All Parties
                  </option>

                  {parties.map(
                    (party) => (

                      <option
                        key={party.id}
                        value={party.id}
                      >
                        {party.name}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* EXPIRING */}

              <div className="flex items-end">

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3">

                  <input
                    type="checkbox"
                    checked={
                      expiringFilter
                    }
                    onChange={(e) =>
                      setExpiringFilter(
                        e.target.checked
                      )
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-medium text-gray-700">
                    Expiring within 30 days
                  </span>

                </label>

              </div>


              {/* CLEAR */}

              <div className="md:col-span-3">

                <button
                  type="button"
                  onClick={
                    handleClearFilters
                  }
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear all filters
                </button>

              </div>

            </div>

          )}

        </div>


        {/* =========================================================
            CONTRACT TABLE
        ========================================================= */}

        <ContractsTable
          searchTerm={
            searchTerm
          }

          statusFilter={
            statusFilter
          }

          typeFilter={
            typeFilter
          }

          partyFilter={
            partyFilter
          }

          expiringFilter={
            expiringFilter
          }

          onEdit={
            handleEditContract
          }

          refreshTrigger={
            refreshTrigger
          }
        />


        {/* =========================================================
            CREATE / EDIT MODAL
        ========================================================= */}

        <ContractModal
          isOpen={
            isModalOpen
          }

          onClose={
            handleCloseModal
          }

          initialData={
            selectedContract
          }

          mode={
            selectedContract
              ? "edit"
              : "create"
          }

          onSaved={
            handleContractSaved
          }
        />

      </div>

    </MainLayout>
  );
}


export default Contracts;