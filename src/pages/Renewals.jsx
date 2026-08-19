import { useEffect, useMemo, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import RenewalCards from "../components/renewals/RenewalCards";
import RenewalSearchFilters from "../components/renewals/RenewalSearchFilters";
import RenewalsTable from "../components/renewals/RenewalsTable";
import RenewalModal from "../components/renewals/RenewalModal";

import {
  getRenewals,
} from "../services/renewalService";


function Renewals() {
  const [renewals, setRenewals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [isRenewalModalOpen, setIsRenewalModalOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [contractFilter, setContractFilter] =
    useState("All Contracts");

  const [renewalTypeFilter, setRenewalTypeFilter] =
    useState("All Renewal Types");

  const [activeCard, setActiveCard] =
    useState("All");


  // ============================================================
  // LOAD RENEWALS
  // ============================================================

  const loadRenewals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRenewals();

      const data =
        response?.data ?? [];

      setRenewals(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "Failed to load renewals:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load renewals."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadRenewals();
  }, []);


  // ============================================================
  // CONTRACT OPTIONS
  // ============================================================

  const contractOptions = useMemo(() => {
    return [
      ...new Set(
        renewals
          .map(
            (renewal) =>
              renewal.contract_no
          )
          .filter(Boolean)
      ),
    ];
  }, [renewals]);


  // ============================================================
  // FILTER
  // ============================================================

  const filteredRenewals =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return renewals.filter(
        (renewal) => {

          const matchesSearch =
            !search ||
            [
              renewal.renewal_no,
              renewal.contract_no,
              renewal.title,
              renewal.party,
              renewal.renewal_type,
              renewal.current_end_date,
              renewal.new_end_date,
              renewal.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(search);


          const matchesStatus =
            statusFilter ===
              "All Status" ||

            (
              statusFilter ===
                "Due Soon"

              ? renewal.status
                  ?.toLowerCase()
                  .includes("due")

              : renewal.status ===
                statusFilter
            );


          const matchesContract =
            contractFilter ===
              "All Contracts" ||

            renewal.contract_no ===
              contractFilter;


          const matchesRenewalType =
            renewalTypeFilter ===
              "All Renewal Types" ||

            renewal.renewal_type ===
              renewalTypeFilter;


          let matchesCard = true;


          if (
            activeCard ===
            "Active"
          ) {
            matchesCard =
              renewal.status ===
              "Active";
          }


          if (
            activeCard ===
            "Due Soon"
          ) {
            matchesCard =
              renewal.status
                ?.toLowerCase()
                .includes("due");
          }


          if (
            activeCard ===
            "Expired"
          ) {
            matchesCard =
              renewal.status ===
              "Expired";
          }


          return (
            matchesSearch &&
            matchesStatus &&
            matchesContract &&
            matchesRenewalType &&
            matchesCard
          );
        }
      );

    }, [
      renewals,
      searchTerm,
      statusFilter,
      contractFilter,
      renewalTypeFilter,
      activeCard,
    ]);


  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {

    setSearchTerm("");

    setStatusFilter(
      "All Status"
    );

    setContractFilter(
      "All Contracts"
    );

    setRenewalTypeFilter(
      "All Renewal Types"
    );

    setActiveCard("All");
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <MainLayout>

      <div className="w-full min-w-0 max-w-full">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="min-w-0">

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Renewals
            </h1>

            <p className="mt-1 text-gray-500">
              Track and manage contract renewals and expirations.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setIsRenewalModalOpen(true)
            }
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            + New Renewal
          </button>

        </div>


        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* CARDS */}
        <RenewalCards
          renewals={renewals}
          activeCard={activeCard}
          onCardClick={(card) => {

            setActiveCard(card);

            setStatusFilter(
              "All Status"
            );

            setContractFilter(
              "All Contracts"
            );

            setRenewalTypeFilter(
              "All Renewal Types"
            );

          }}
        />


        {/* SEARCH / FILTERS */}
        <RenewalSearchFilters

          searchTerm={searchTerm}

          setSearchTerm={(value) => {

            setSearchTerm(value);

            setActiveCard("All");

          }}

          statusFilter={statusFilter}

          setStatusFilter={(value) => {

            setStatusFilter(value);

            setActiveCard("All");

          }}

          contractFilter={contractFilter}

          setContractFilter={(value) => {

            setContractFilter(value);

            setActiveCard("All");

          }}

          renewalTypeFilter={
            renewalTypeFilter
          }

          setRenewalTypeFilter={(value) => {

            setRenewalTypeFilter(value);

            setActiveCard("All");

          }}

          contractOptions={
            contractOptions
          }

          onClear={
            clearFilters
          }

        />


        {/* TABLE */}
        {loading ? (

          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="text-sm text-gray-500">
              Loading renewals...
            </div>

          </div>

        ) : (

          <RenewalsTable
            renewals={
              filteredRenewals
            }
          />

        )}

      </div>


      {/* NEW RENEWAL MODAL */}
      <RenewalModal

        isOpen={
          isRenewalModalOpen
        }

        onClose={() =>
          setIsRenewalModalOpen(false)
        }

        onSuccess={async () => {
          await loadRenewals();
        }}

      />

    </MainLayout>
  );
}

export default Renewals;