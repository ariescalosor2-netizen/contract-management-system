import { useState } from "react";
import { BiPlus } from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import SearchFilters from "../components/parties/SearchFilters";
import PartiesTable from "../components/parties/PartiesTable";
import PartyModal from "../components/parties/PartyModal";

import { createParty } from "../services/partyService";


function Parties() {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("All Types");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);


  /*
  |--------------------------------------------------------------------------
  | CREATE PARTY
  |--------------------------------------------------------------------------
  */

  const handleCreate = async (data) => {
    try {
      const response =
        await createParty(data);

      if (
        response?.success === false
      ) {
        throw new Error(
          response.message ||
          "Failed to create party."
        );
      }

      setIsCreateModalOpen(false);

      // Tell PartiesTable to reload from database.
      setRefreshKey(
        (previous) => previous + 1
      );

    } catch (error) {
      console.error(
        "Failed to create party:",
        error
      );

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create party.";

      alert(message);

      throw error;
    }
  };


  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE MODAL
  |--------------------------------------------------------------------------
  */

  const handleOpenCreate = () => {
    setIsCreateModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | CLOSE CREATE MODAL
  |--------------------------------------------------------------------------
  */

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
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
              Parties
            </h1>

            <p className="
              mt-1
              text-gray-500
            ">
              Manage organizations and individuals involved in contracts.
            </p>

          </div>


          <button
            type="button"
            onClick={handleOpenCreate}
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

            New Party

          </button>

        </div>


        {/* ======================================================
            SEARCH + FILTERS
        ====================================================== */}

        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}

          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}

          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />


        {/* ======================================================
            PARTIES TABLE
        ====================================================== */}

        <PartiesTable
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          refreshKey={refreshKey}
        />


        {/* ======================================================
            CREATE PARTY MODAL
        ====================================================== */}

        <PartyModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreate}
          initialData={null}
          mode="create"
        />

      </div>

    </MainLayout>
  );
}


export default Parties;