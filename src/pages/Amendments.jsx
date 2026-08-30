import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import {
  getAmendments,
  createAmendment,
  deleteAmendment,
} from "../services/amendmentService";

import { getContracts } from "../services/contractService";

import {
  BiFile,
  BiCheckCircle,
  BiTime,
  BiXCircle,
  BiSearch,
  BiFilterAlt,
  BiPlus,
  BiX,
  BiLoaderAlt,
  BiShow,
  BiTrash,
  BiCalendar,
  BiDollarCircle,
  BiChevronLeft,
  BiChevronRight,
  BiInfoCircle,
} from "react-icons/bi";

/* ============================================================
   CONSTANTS
============================================================ */

const AMENDMENT_TYPES = [
  "Increase Contract Value",
  "Decrease Contract Value",
  "Extend Contract Duration",
  "Reduce Contract Duration",
  "Change Scope of Work",
  "Change Deliverables",
  "Change Payment Terms",
  "Change Delivery Terms",
  "Change Other Contract Terms",
];

/* ============================================================
   HELPERS
============================================================ */

const unwrapData = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return response?.data ?? response;
};

const getContractId = (contract) => {
  return (
    contract?.id ??
    contract?.contract_id ??
    ""
  );
};

const getContractNumber = (contract) => {
  return (
    contract?.contract_no ??
    contract?.contractNo ??
    contract?.number ??
    "N/A"
  );
};

const getContractTitle = (contract) => {
  return (
    contract?.title ??
    contract?.contract_title ??
    "Untitled Contract"
  );
};

const getContractStatus = (contract) => {
  return String(
    contract?.status ?? ""
  ).trim().toLowerCase();
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(number);
};

const normalizeStatus = (status) => {
  if (!status) return "Pending";

  const value = String(status)
    .toLowerCase()
    .trim();

  if (value.includes("approve")) {
    return "Approved";
  }

  if (value.includes("reject")) {
    return "Rejected";
  }

  if (value.includes("pending")) {
    return "Pending";
  }

  return status;
};

const getAmendmentNumber = (amendment) => {
  return (
    amendment?.amendment_no ??
    amendment?.amendmentNo ??
    "—"
  );
};

const getAmendmentTitle = (amendment) => {
  return (
    amendment?.title ??
    amendment?.amendment_title ??
    "Untitled Amendment"
  );
};

const getAmendmentContractNumber = (
  amendment,
  contracts
) => {
  if (
    amendment?.contract_no ||
    amendment?.contractNo
  ) {
    return (
      amendment.contract_no ??
      amendment.contractNo
    );
  }

  const contract = contracts.find(
    (item) =>
      String(getContractId(item)) ===
      String(amendment?.contract_id)
  );

  return contract
    ? getContractNumber(contract)
    : "—";
};

const getRequestedBy = (amendment) => {
  return (
    amendment?.requester_name ??
    amendment?.requested_by_name ??
    amendment?.requested_by_email ??
    "System User"
  );
};

/* ============================================================
   SMALL COMPONENTS
============================================================ */

function Field({
  label,
  required = false,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      {children}

      {hint && (
        <p className="text-xs text-gray-400 mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-800 break-words">
        {value || "—"}
      </p>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

function Amendments() {
  /* ==========================================================
     DATA
  ========================================================== */

  const [amendments, setAmendments] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingContracts, setLoadingContracts] =
    useState(true);

  const [error, setError] = useState("");

  /* ==========================================================
     SEARCH / FILTER
  ========================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Status");
  const [contractFilter, setContractFilter] =
    useState("All Contracts");
  const [requestedByFilter, setRequestedByFilter] =
    useState("Requested By");

  /* ==========================================================
     MODALS
  ========================================================== */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedAmendment, setSelectedAmendment] =
    useState(null);

  /* ==========================================================
     CREATE STATE
  ========================================================== */

  const initialForm = {
    contract_id: "",
    title: "",
    amendment_type: "",
    reason: "",
    description: "",
    amended_value: "",
    new_start_date: "",
    new_end_date: "",
    scope_changes: "",
  };

  const [form, setForm] =
    useState(initialForm);

  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  /* ==========================================================
     DELETE
  ========================================================== */

  const [deletingId, setDeletingId] =
    useState(null);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 8;

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  const loadAmendments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAmendments();

      const data =
        unwrapData(response);

      setAmendments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load amendments:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Unable to load amendments."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadContracts = async () => {
    try {
      setLoadingContracts(true);

      const response =
        await getContracts();

      const data =
        unwrapData(response);

      setContracts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load contracts:",
        err
      );
    } finally {
      setLoadingContracts(false);
    }
  };

  useEffect(() => {
    loadAmendments();
    loadContracts();
  }, []);

  /* ==========================================================
     ACTIVE CONTRACTS
  ========================================================== */

  const activeContracts = useMemo(() => {
    return contracts.filter(
      (contract) => {
        const status =
          getContractStatus(
            contract
          );

        /*
         * Only contracts that are actually active
         * should be available for amendment.
         */

        return [
          "active",
          "approved",
          "in progress",
          "in_progress",
        ].includes(status);
      }
    );
  }, [contracts]);

  /* ==========================================================
     SELECTED CONTRACT
  ========================================================== */

  const selectedContract = useMemo(() => {
    if (!form.contract_id) {
      return null;
    }

    return (
      contracts.find(
        (contract) =>
          String(
            getContractId(contract)
          ) ===
          String(form.contract_id)
      ) || null
    );
  }, [
    form.contract_id,
    contracts,
  ]);

  /* ==========================================================
     FILTER OPTIONS
  ========================================================== */

  const contractOptions = useMemo(() => {
    const map = new Map();

    amendments.forEach(
      (amendment) => {
        const number =
          getAmendmentContractNumber(
            amendment,
            contracts
          );

        if (
          number &&
          number !== "—"
        ) {
          map.set(number, number);
        }
      }
    );

    return Array.from(
      map.values()
    );
  }, [
    amendments,
    contracts,
  ]);

  const requestedByOptions =
    useMemo(() => {
      const map = new Map();

      amendments.forEach(
        (amendment) => {
          const name =
            getRequestedBy(
              amendment
            );

          if (name) {
            map.set(name, name);
          }
        }
      );

      return Array.from(
        map.values()
      );
    }, [amendments]);

  /* ==========================================================
     FILTERED DATA
  ========================================================== */

  const filteredAmendments =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return amendments.filter(
        (amendment) => {
          const number =
            getAmendmentNumber(
              amendment
            );

          const title =
            getAmendmentTitle(
              amendment
            );

          const contractNumber =
            getAmendmentContractNumber(
              amendment,
              contracts
            );

          const requestedBy =
            getRequestedBy(
              amendment
            );

          const status =
            normalizeStatus(
              amendment?.status
            );

          const matchesSearch =
            !query ||
            number
              .toLowerCase()
              .includes(query) ||
            title
              .toLowerCase()
              .includes(query) ||
            contractNumber
              .toLowerCase()
              .includes(query) ||
            requestedBy
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter ===
              "All Status" ||
            status ===
              statusFilter;

          const matchesContract =
            contractFilter ===
              "All Contracts" ||
            contractNumber ===
              contractFilter;

          const matchesRequestedBy =
            requestedByFilter ===
              "Requested By" ||
            requestedBy ===
              requestedByFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesContract &&
            matchesRequestedBy
          );
        }
      );
    }, [
      amendments,
      contracts,
      search,
      statusFilter,
      contractFilter,
      requestedByFilter,
    ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredAmendments.length /
          itemsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedAmendments =
    filteredAmendments.slice(
      (safeCurrentPage - 1) *
        itemsPerPage,
      safeCurrentPage *
        itemsPerPage
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    contractFilter,
    requestedByFilter,
  ]);

  /* ==========================================================
     SUMMARY CARDS
  ========================================================== */

  const totalAmendments =
    amendments.length;

  const approvedCount =
    amendments.filter(
      (item) =>
        normalizeStatus(
          item?.status
        ) === "Approved"
    ).length;

  const pendingCount =
    amendments.filter(
      (item) =>
        normalizeStatus(
          item?.status
        ) === "Pending"
    ).length;

  const rejectedCount =
    amendments.filter(
      (item) =>
        normalizeStatus(
          item?.status
        ) === "Rejected"
    ).length;

  /* ==========================================================
     FORM HANDLERS
  ========================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setFormError("");
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (saving) return;

    setShowCreateModal(false);
    setForm(initialForm);
    setFormError("");
  };

  /* ==========================================================
     CREATE AMENDMENT
  ========================================================== */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setFormError("");

    if (!form.contract_id) {
      setFormError(
        "Please select an active contract."
      );
      return;
    }

    if (!form.title.trim()) {
      setFormError(
        "Please enter an amendment title."
      );
      return;
    }

    if (!form.amendment_type) {
      setFormError(
        "Please select an amendment type."
      );
      return;
    }

    if (!form.reason.trim()) {
      setFormError(
        "Please provide the reason for the amendment."
      );
      return;
    }

    if (!form.description.trim()) {
      setFormError(
        "Please describe the proposed amendment."
      );
      return;
    }

    if (
      form.amended_value !== "" &&
      Number(form.amended_value) < 0
    ) {
      setFormError(
        "Contract value cannot be negative."
      );
      return;
    }

    if (
      form.new_start_date &&
      form.new_end_date &&
      form.new_end_date <
        form.new_start_date
    ) {
      setFormError(
        "New end date cannot be earlier than the new start date."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       * amendment_no is NOT sent.
       *
       * The backend is responsible for generating
       * the next amendment number.
       *
       * Approval/rejection is also NOT handled here.
       * The created request remains Pending Approval.
       */

      const payload = {
        contract_id:
          form.contract_id,

        title:
          form.title.trim(),

        amendment_type:
          form.amendment_type,

        reason:
          form.reason.trim(),

        description:
          form.description.trim(),

        amended_value:
          form.amended_value === ""
            ? null
            : Number(
                form.amended_value
              ),

        new_start_date:
          form.new_start_date ||
          null,

        new_end_date:
          form.new_end_date ||
          null,

        scope_changes:
          form.scope_changes.trim() ||
          null,
      };

      await createAmendment(
        payload
      );

      closeCreateModal();

      await loadAmendments();

      alert(
        "Amendment request created successfully. It is now pending approval."
      );
    } catch (err) {
      console.error(
        "Failed to create amendment:",
        err
      );

      const detail =
        err?.response?.data?.detail;

      if (
        Array.isArray(detail)
      ) {
        setFormError(
          detail
            .map(
              (item) =>
                item?.msg ||
                "Invalid input."
            )
            .join(" ")
        );
      } else {
        setFormError(
          detail ||
            err?.message ||
            "Failed to create amendment."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     VIEW
  ========================================================== */

  const openViewModal = (
    amendment
  ) => {
    setSelectedAmendment(
      amendment
    );
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedAmendment(null);
  };

  /* ==========================================================
     DELETE
  ========================================================== */

  const handleDelete = async (
    amendment
  ) => {
    const status =
      normalizeStatus(
        amendment?.status
      );

    /*
     * Approved amendments should not be
     * casually deleted from the system.
     */

    if (
      status === "Approved"
    ) {
      alert(
        "Approved amendments should not be deleted. Keep them as part of the contract history."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete amendment ${getAmendmentNumber(
          amendment
        )}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) return;

    try {
      setDeletingId(
        amendment.id
      );

      await deleteAmendment(
        amendment.id
      );

      await loadAmendments();

      alert(
        "Amendment deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete amendment:",
        err
      );

      alert(
        err?.response?.data?.detail ||
          "Failed to delete amendment."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(
      "All Status"
    );
    setContractFilter(
      "All Contracts"
    );
    setRequestedByFilter(
      "Requested By"
    );
  };

  /* ==========================================================
     STATUS BADGE
  ========================================================== */

  const statusBadge = (
    status
  ) => {
    const normalized =
      normalizeStatus(status);

    if (
      normalized ===
      "Approved"
    ) {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (
      normalized ===
      "Rejected"
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }

    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <MainLayout>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Amendments
          </h1>

          <p className="text-gray-500 mt-1">
            Manage contract amendment requests
            and proposed changes.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreateModal
          }
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition"
        >
          <BiPlus className="text-xl" />
          New Amendment
        </button>

      </div>


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* Total */}

        <div
  onClick={() => setStatusFilter("All Status")}
  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition"
>

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl">
              <BiFile />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Amendments
              </p>

              <h2 className="text-2xl font-bold mt-1 text-slate-800">
                {totalAmendments}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                All amendment requests
              </p>
            </div>

          </div>

        </div>


        {/* Approved */}

<div
  onClick={() => setStatusFilter("Approved")}
  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition"
>

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl">
              <BiCheckCircle />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Approved
              </p>

              <h2 className="text-2xl font-bold mt-1 text-slate-800">
                {approvedCount}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Successfully approved
              </p>
              
            </div>
          </div>

        </div>


        {/* Pending */}

        <div
  onClick={() => setStatusFilter("Pending")}
  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition"
>

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-3xl">
              <BiTime />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Pending
              </p>

              <h2 className="text-2xl font-bold mt-1 text-slate-800">
                {pendingCount}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Awaiting approval
              </p>
            </div>

          </div>

        </div>


        {/* Rejected */}

       <div
  onClick={() => setStatusFilter("Rejected")}
  className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition"
>

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl">
              <BiXCircle />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Rejected
              </p>

              <h2 className="text-2xl font-bold mt-1 text-slate-800">
                {rejectedCount}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Request declined
              </p>
            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">

          {/* Search */}

          <div className="xl:col-span-4 relative">

            <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search amendments..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />

          </div>


          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="xl:col-span-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option>
              All Status
            </option>

            <option>
              Pending
            </option>

            <option>
              Approved
            </option>

            <option>
              Rejected
            </option>

          </select>


          {/* Contract */}

          <select
            value={contractFilter}
            onChange={(event) =>
              setContractFilter(
                event.target.value
              )
            }
            className="xl:col-span-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option>
              All Contracts
            </option>

            {contractOptions.map(
              (contract) => (
                <option
                  key={contract}
                  value={contract}
                >
                  {contract}
                </option>
              )
            )}

          </select>


          {/* Requested By */}

          <select
            value={
              requestedByFilter
            }
            onChange={(event) =>
              setRequestedByFilter(
                event.target.value
              )
            }
            className="xl:col-span-2 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option>
              Requested By
            </option>

            {requestedByOptions.map(
              (user) => (
                <option
                  key={user}
                  value={user}
                >
                  {user}
                </option>
              )
            )}

          </select>


          {/* Clear */}

          <button
            type="button"
            onClick={
              clearFilters
            }
            className="xl:col-span-2 flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 transition font-medium text-gray-700"
          >
            <BiFilterAlt />
            Clear Filters
          </button>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">

          <div className="flex items-start gap-3">

            <BiXCircle className="text-red-500 text-2xl flex-shrink-0" />

            <div className="flex-1">

              <p className="font-semibold text-red-800">
                Unable to load amendments
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  loadAmendments
                }
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Try Again
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr className="text-left text-gray-600 text-sm">

                <th className="px-6 py-4 font-semibold">
                  Amendment No.
                </th>

                <th className="px-4 py-4 font-semibold">
                  Contract No.
                </th>

                <th className="px-4 py-4 font-semibold">
                  Amendment Title
                </th>

                <th className="px-4 py-4 font-semibold">
                  Requested By
                </th>

                <th className="px-4 py-4 font-semibold">
                  Date
                </th>

                <th className="px-4 py-4 font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold text-center">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <BiLoaderAlt className="text-4xl text-blue-600 animate-spin" />

                      <p className="text-gray-500 mt-3">
                        Loading amendments...
                      </p>

                    </div>

                  </td>

                </tr>

              ) : paginatedAmendments.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="px-6 py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <BiFile className="text-5xl text-gray-300" />

                      <p className="font-semibold text-gray-600 mt-3">
                        No amendments found.
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        Try changing your filters or create a new amendment request.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                paginatedAmendments.map(
                  (amendment) => {

                    const status =
                      normalizeStatus(
                        amendment?.status
                      );

                    return (
                      <tr
                        key={
                          amendment.id
                        }
                        className="border-b last:border-none hover:bg-gray-50 transition"
                      >

                        <td className="px-6 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              openViewModal(
                                amendment
                              )
                            }
                            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {getAmendmentNumber(
                              amendment
                            )}
                          </button>

                        </td>


                        <td className="px-4 py-5 text-slate-700">
                          {getAmendmentContractNumber(
                            amendment,
                            contracts
                          )}
                        </td>


                        <td className="px-4 py-5">

                          <p className="font-medium text-slate-800">
                            {getAmendmentTitle(
                              amendment
                            )}
                          </p>

                        </td>


                        <td className="px-4 py-5 text-slate-700">
                          {getRequestedBy(
                            amendment
                          )}
                        </td>


                        <td className="px-4 py-5 text-slate-700">

                          {formatDate(
                            amendment?.created_at ??
                              amendment?.amendment_date ??
                              amendment?.createdAt
                          )}

                        </td>


                        <td className="px-4 py-5">

                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-semibold ${statusBadge(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>


                        <td className="px-6 py-5">

                          <div className="flex items-center justify-center gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openViewModal(
                                  amendment
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                            >
                              <BiShow className="text-lg" />
                              View
                            </button>


                            {status !==
                              "Approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    amendment
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  amendment.id
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                              >

                                {deletingId ===
                                amendment.id ? (
                                  <BiLoaderAlt className="animate-spin text-lg" />
                                ) : (
                                  <BiTrash className="text-lg" />
                                )}

                                Delete

                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>


        {/* ====================================================
            TABLE FOOTER
        ==================================================== */}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 text-sm text-gray-500 border-t border-gray-100">

          <span>
            Showing{" "}
            {filteredAmendments.length ===
            0
              ? 0
              : (safeCurrentPage -
                  1) *
                  itemsPerPage +
                1}{" "}
            to{" "}
            {Math.min(
              safeCurrentPage *
                itemsPerPage,
              filteredAmendments.length
            )}{" "}
            of{" "}
            {filteredAmendments.length}{" "}
            amendments
          </span>


          <div className="flex items-center gap-2">

            <button
              type="button"
              disabled={
                safeCurrentPage <= 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <BiChevronLeft className="text-xl" />
            </button>


            <span className="min-w-9 h-9 px-3 rounded-lg bg-blue-600 text-white flex items-center justify-center font-medium">
              {safeCurrentPage}
            </span>


            <button
              type="button"
              disabled={
                safeCurrentPage >=
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <BiChevronRight className="text-xl" />
            </button>

          </div>

        </div>

      </div>


      {/* ======================================================
          NEW AMENDMENT MODAL
      ====================================================== */}

      {showCreateModal && (

        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* HEADER */}

            <div className="flex-shrink-0 px-7 py-5 border-b border-gray-200 bg-white flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  New Amendment
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create a request to modify an existing active contract.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeCreateModal
                }
                disabled={saving}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                <BiX className="text-2xl" />
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="flex-1 overflow-y-auto"
            >

              <div className="px-7 py-6 space-y-7">

                {/* AMENDMENT NUMBER */}

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <BiFile className="text-2xl" />
                    </div>

                    <div>

                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                        Amendment Number
                      </p>

                      <p className="text-lg font-bold text-slate-800 mt-1">
                        Automatically Generated
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        The system will automatically assign the next amendment number after creation.
                      </p>

                    </div>

                  </div>

                </div>


                {/* FORM ERROR */}

                {formError && (

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">

                    <div className="flex items-start gap-3">

                      <BiXCircle className="text-red-500 text-xl flex-shrink-0" />

                      <p className="text-sm font-medium text-red-700">
                        {formError}
                      </p>

                    </div>

                  </div>

                )}


                {/* CONTRACT INFORMATION */}

                <section>

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-800">
                      Contract Information
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Select the existing active contract that you want to modify.
                    </p>

                  </div>


                  <Field
                    label="Contract"
                    required
                  >

                    <select
                      name="contract_id"
                      value={
                        form.contract_id
                      }
                      onChange={
                        handleChange
                      }
                      disabled={
                        loadingContracts
                      }
                      className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >

                      <option value="">
                        {loadingContracts
                          ? "Loading contracts..."
                          : "Select an active contract"}
                      </option>

                      {activeContracts.map(
                        (
                          contract
                        ) => (

                          <option
                            key={getContractId(
                              contract
                            )}
                            value={getContractId(
                              contract
                            )}
                          >
                            {getContractNumber(
                              contract
                            )}
                            {" — "}
                            {getContractTitle(
                              contract
                            )}
                          </option>

                        )
                      )}

                    </select>

                  </Field>


                  {/* CURRENT CONTRACT */}

                  {selectedContract && (

                    <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-5">

                      <div className="flex items-center justify-between mb-4">

                        <div>

                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Current Contract
                          </p>

                          <p className="font-bold text-slate-800 mt-1">
                            {getContractNumber(
                              selectedContract
                            )}
                          </p>

                        </div>


                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                          Active
                        </span>

                      </div>


                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

                        <InfoItem
                          label="Contract Title"
                          value={getContractTitle(
                            selectedContract
                          )}
                        />

                        <InfoItem
                          label="Contract Value"
                          value={formatCurrency(
                            selectedContract?.value ??
                              selectedContract?.contract_value ??
                              selectedContract?.amount
                          )}
                        />

                        <InfoItem
                          label="Start Date"
                          value={formatDate(
                            selectedContract?.start_date ??
                              selectedContract?.startDate
                          )}
                        />

                        <InfoItem
                          label="End Date"
                          value={formatDate(
                            selectedContract?.end_date ??
                              selectedContract?.endDate
                          )}
                        />

                      </div>

                    </div>

                  )}

                </section>


                {/* AMENDMENT DETAILS */}

                <section>

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-800">
                      Amendment Details
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Identify the type and purpose of the requested change.
                    </p>

                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <Field
                      label="Amendment Title"
                      required
                    >

                      <input
                        type="text"
                        name="title"
                        value={
                          form.title
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="e.g. Extend Contract Duration"
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />

                    </Field>


                    <Field
                      label="Amendment Type"
                      required
                    >

                      <select
                        name="amendment_type"
                        value={
                          form.amendment_type
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >

                        <option value="">
                          Select amendment type
                        </option>

                        {AMENDMENT_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          )
                        )}

                      </select>

                    </Field>

                  </div>

                </section>


                {/* PROPOSED CHANGES */}

                <section>

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-800">
                      Proposed Changes
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Enter only the contract terms that need to be changed.
                    </p>

                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <Field
                      label="New Contract Value"
                      hint="Leave blank if the contract value will not change."
                    >

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          ₱
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="amended_value"
                          value={
                            form.amended_value
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="0.00"
                          className="w-full h-12 pl-9 pr-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />

                      </div>

                    </Field>


                    <Field
                      label="New Start Date"
                      hint="Leave blank if the start date will not change."
                    >

                      <div className="relative">

                        <BiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />

                        <input
                          type="date"
                          name="new_start_date"
                          value={
                            form.new_start_date
                          }
                          onChange={
                            handleChange
                          }
                          className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />

                      </div>

                    </Field>


                    <Field
                      label="New End Date"
                      hint="Leave blank if the end date will not change."
                    >

                      <div className="relative">

                        <BiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />

                        <input
                          type="date"
                          name="new_end_date"
                          value={
                            form.new_end_date
                          }
                          onChange={
                            handleChange
                          }
                          className="w-full h-12 pl-11 pr-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        />

                      </div>

                    </Field>


                    <Field
                      label="Scope Changes"
                      hint="Describe changes to deliverables, services, requirements, or scope."
                      className="md:col-span-2"
                    >

                      <textarea
                        name="scope_changes"
                        value={
                          form.scope_changes
                        }
                        onChange={
                          handleChange
                        }
                        rows={4}
                        placeholder="Describe the proposed scope changes..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />

                    </Field>

                  </div>

                </section>


                {/* JUSTIFICATION */}

                <section>

                  <div className="mb-4">

                    <h3 className="text-lg font-bold text-slate-800">
                      Amendment Justification
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Explain why this amendment is necessary.
                    </p>

                  </div>


                  <div className="space-y-5">

                    <Field
                      label="Reason for Amendment"
                      required
                    >

                      <textarea
                        name="reason"
                        value={
                          form.reason
                        }
                        onChange={
                          handleChange
                        }
                        rows={4}
                        placeholder="Explain why this amendment is needed..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />

                    </Field>


                    <Field
                      label="Description of Proposed Change"
                      required
                    >

                      <textarea
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleChange
                        }
                        rows={5}
                        placeholder="Describe clearly what will change in the existing contract..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />

                    </Field>

                  </div>

                </section>


                {/* APPROVAL NOTICE */}

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                      <BiTime className="text-xl" />
                    </div>

                    <div>

                      <p className="font-semibold text-amber-800">
                        Approval Required
                      </p>

                      <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                        This request will be submitted as{" "}
                        <strong>
                          Pending Approval
                        </strong>
                        . Approval or rejection will be handled by the authorized user in the{" "}
                        <strong>
                          Approvals
                        </strong>{" "}
                        module.
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* FOOTER */}

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-7 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

                <p className="text-xs text-gray-400">
                  Fields marked with{" "}
                  <span className="text-red-500">
                    *
                  </span>{" "}
                  are required.
                </p>


                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={
                      closeCreateModal
                    }
                    disabled={
                      saving
                    }
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loadingContracts
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >

                    {saving ? (
                      <>
                        <BiLoaderAlt className="animate-spin text-lg" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <BiPlus className="text-lg" />
                        Submit Amendment
                      </>
                    )}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          VIEW AMENDMENT MODAL
      ====================================================== */}

      {showViewModal &&
        selectedAmendment && (

          <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

              {/* HEADER */}

              <div className="px-7 py-5 border-b border-gray-200 flex items-center justify-between">

                <div>

                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Amendment Details
                  </p>

                  <h2 className="text-2xl font-bold text-slate-800 mt-1">
                    {getAmendmentNumber(
                      selectedAmendment
                    )}
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={
                    closeViewModal
                  }
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100"
                >
                  <BiX className="text-2xl" />
                </button>

              </div>


              {/* BODY */}

              <div className="overflow-y-auto px-7 py-6 space-y-6">

                {/* STATUS */}

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-5">

                  <div>

                    <p className="text-sm text-gray-500">
                      Current Status
                    </p>

                    <p className="font-semibold text-slate-800 mt-1">
                      {getAmendmentTitle(
                        selectedAmendment
                      )}
                    </p>

                  </div>


                  <span
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${statusBadge(
                      selectedAmendment.status
                    )}`}
                  >
                    {normalizeStatus(
                      selectedAmendment.status
                    )}
                  </span>

                </div>


                {/* BASIC INFO */}

                <div>

                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Request Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <InfoItem
                      label="Amendment Number"
                      value={getAmendmentNumber(
                        selectedAmendment
                      )}
                    />

                    <InfoItem
                      label="Contract Number"
                      value={getAmendmentContractNumber(
                        selectedAmendment,
                        contracts
                      )}
                    />

                    <InfoItem
                      label="Requested By"
                      value={getRequestedBy(
                        selectedAmendment
                      )}
                    />

                    <InfoItem
                      label="Request Date"
                      value={formatDate(
                        selectedAmendment?.created_at ??
                          selectedAmendment?.amendment_date
                      )}
                    />

                  </div>

                </div>


                {/* PROPOSED CHANGES */}

                <div>

                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Proposed Changes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <InfoItem
                      label="Original Contract Value"
                      value={formatCurrency(
                        selectedAmendment?.original_value
                      )}
                    />

                    <InfoItem
                      label="New Contract Value"
                      value={formatCurrency(
                        selectedAmendment?.amended_value
                      )}
                    />

                    <InfoItem
                      label="Original Start Date"
                      value={formatDate(
                        selectedAmendment?.original_start_date
                      )}
                    />

                    <InfoItem
                      label="Original End Date"
                      value={formatDate(
                        selectedAmendment?.original_end_date
                      )}
                    />

                    <InfoItem
                      label="New Start Date"
                      value={formatDate(
                        selectedAmendment?.new_start_date
                      )}
                    />

                    <InfoItem
                      label="New End Date"
                      value={formatDate(
                        selectedAmendment?.new_end_date
                      )}
                    />

                  </div>

                </div>


                {/* REASON */}

                {selectedAmendment?.reason && (

                  <div>

                    <h3 className="text-lg font-bold text-slate-800 mb-3">
                      Reason for Amendment
                    </h3>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {
                        selectedAmendment.reason
                      }
                    </div>

                  </div>

                )}


                {/* DESCRIPTION */}

                {selectedAmendment?.description && (

                  <div>

                    <h3 className="text-lg font-bold text-slate-800 mb-3">
                      Description
                    </h3>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {
                        selectedAmendment.description
                      }
                    </div>

                  </div>

                )}


                {/* SCOPE */}

                {selectedAmendment?.scope_changes && (

                  <div>

                    <h3 className="text-lg font-bold text-slate-800 mb-3">
                      Scope Changes
                    </h3>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {
                        selectedAmendment.scope_changes
                      }
                    </div>

                  </div>

                )}


                {/* REJECTION */}

                {selectedAmendment?.rejection_reason && (

                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">

                    <p className="font-semibold text-red-800">
                      Rejection Reason
                    </p>

                    <p className="text-sm text-red-700 mt-2 whitespace-pre-wrap">
                      {
                        selectedAmendment.rejection_reason
                      }
                    </p>

                  </div>

                )}


                {/* APPROVAL NOTICE */}

                {normalizeStatus(
                  selectedAmendment.status
                ) === "Pending" && (

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">

                    <div className="flex items-start gap-3">

                      <BiInfoCircle className="text-amber-600 text-2xl flex-shrink-0" />

                      <div>

                        <p className="font-semibold text-amber-800">
                          Pending Approval
                        </p>

                        <p className="text-sm text-amber-700 mt-1">
                          This amendment is waiting for review in the Approvals module.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </div>


              {/* FOOTER */}

              <div className="px-7 py-4 border-t border-gray-200 flex justify-end">

                <button
                  type="button"
                  onClick={
                    closeViewModal
                  }
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

    </MainLayout>
  );
}

export default Amendments;