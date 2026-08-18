import { useEffect, useState } from "react";
import { BiPlus } from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import ContractTypesTable from "../components/contractTypes/ContractTypesTable";
import ContractTypeModal from "../components/contractTypes/ContractTypeModal";

function ContractTypes() {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [selectedType, setSelectedType] =
    useState(null);

  const [modalMode, setModalMode] =
    useState("create");

  const [refreshKey, setRefreshKey] =
    useState(0);


  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  const handleCreate = () => {
    setSelectedType(null);
    setModalMode("create");
    setIsModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (contractType) => {
    setSelectedType(contractType);
    setModalMode("edit");
    setIsModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | SAVED
  |--------------------------------------------------------------------------
  */

  const handleSaved = () => {
    setIsModalOpen(false);
    setSelectedType(null);

    setRefreshKey(
      (previous) => previous + 1
    );
  };


  /*
  |--------------------------------------------------------------------------
  | CLOSE
  |--------------------------------------------------------------------------
  */

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };


  return (
    <MainLayout>

      <div className="space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        ">

          <div>

            <h1 className="
              text-3xl
              font-bold
              text-slate-800
            ">
              Contract Types
            </h1>

            <p className="
              mt-1
              text-gray-500
            ">
              Manage and organize all contract types used in your organization.
            </p>

          </div>


          <button
            type="button"
            onClick={handleCreate}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              py-3
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
            "
          >

            <BiPlus size={22} />

            New Contract Type

          </button>

        </div>


        {/* ======================================================
            SEARCH + FILTER
        ====================================================== */}

        <div className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          shadow-sm
        ">

          <div className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-center
          ">

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
                placeholder="Search contract types..."
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
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
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-3
                outline-none
                focus:border-blue-500
              "
            >

              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>


        {/* ======================================================
            TABLE
        ====================================================== */}

        <ContractTypesTable
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          refreshKey={refreshKey}
          onEdit={handleEdit}
        />


        {/* ======================================================
            MODAL
        ====================================================== */}

        <ContractTypeModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onSaved={handleSaved}
          initialData={selectedType}
          mode={modalMode}
        />

      </div>

    </MainLayout>
  );
}

export default ContractTypes;