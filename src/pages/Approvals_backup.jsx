import { useEffect, useMemo, useState } from "react";

import {
  BiSearch,
  BiCheckCircle,
  BiXCircle,
  BiTime,
  BiSend,
  BiFilterAlt,
  BiDotsVerticalRounded,
  BiShow,
  BiCheck,
  BiX,
} from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import {
  getApprovals,
  approveApproval,
  rejectApproval,
} from "../services/approvalService";

import { getContracts } from "../services/contractService";

const ITEMS_PER_PAGE = 10;

function Approvals() {
  const [approvals, setApprovals] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState("Pending My Approval");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [selectedApproval, setSelectedApproval] =
    useState(null);

  const [showReviewModal, setShowReviewModal] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        approvalsResponse,
        contractsResponse,
      ] = await Promise.all([
        getApprovals(),
        getContracts(),
      ]);

      const approvalData =
        approvalsResponse?.data ??
        approvalsResponse?.items ??
        approvalsResponse ??
        [];

      const contractData =
        contractsResponse?.data ??
        contractsResponse?.items ??
        contractsResponse ??
        [];

      setApprovals(
        Array.isArray(approvalData)
          ? approvalData
          : []
      );

      setContracts(
        Array.isArray(contractData)
          ? contractData
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load approvals:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your authentication session has expired. Please log in again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to access approvals."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Failed to load approval data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FIND CONTRACT
  |--------------------------------------------------------------------------
  */

  const getContract = (approval) => {
    if (!approval?.contract_id) {
      return null;
    }

    return (
      contracts.find(
        (contract) =>
          String(contract.id) ===
          String(approval.contract_id)
      ) || null
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DECISION
  |--------------------------------------------------------------------------
  */

  const getDecision = (approval) => {
    return String(
      approval?.decision || "Pending"
    )
      .trim()
      .toLowerCase();
  };

  const isPending = (approval) => {
    const decision =
      getDecision(approval);

    return (
      decision === "pending" ||
      decision === "pending approval"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CONTRACT STATUS
  |--------------------------------------------------------------------------
  */

  const getContractStatus = (approval) => {
    const contract =
      getContract(approval);

    return (
      contract?.status ||
      (isPending(approval)
        ? "Pending Approval"
        : "Unknown")
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  const formatTime = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | STATS
  |--------------------------------------------------------------------------
  */

  const stats = useMemo(() => {
    const pending = approvals.filter(
      (approval) => {
        const decision =
          getDecision(approval);

        return (
          decision === "pending" ||
          decision === "pending approval"
        );
      }
    ).length;

    const approved = approvals.filter(
      (approval) =>
        getDecision(approval) ===
        "approved"
    ).length;

    const rejected = approvals.filter(
      (approval) =>
        getDecision(approval) ===
        "rejected"
    ).length;

    const waitingForOthers =
      approvals.filter((approval) => {
        const decision =
          getDecision(approval);

        return (
          decision ===
            "waiting for others" ||
          decision ===
            "for other approvers"
        );
      }).length;

    return {
      pending,
      approved,
      rejected,
      waitingForOthers,
    };
  }, [approvals]);

  /*
  |--------------------------------------------------------------------------
  | FILTER APPROVALS
  |--------------------------------------------------------------------------
  */

  const filteredApprovals = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return approvals.filter(
      (approval) => {
        const contract =
          getContract(approval);

        const decision =
          getDecision(approval);

        const contractNo =
          String(
            contract?.contract_no || ""
          ).toLowerCase();

        const title =
          String(
            contract?.title || ""
          ).toLowerCase();

        const party =
          String(
            contract?.party_name || ""
          ).toLowerCase();

        const contractType =
          String(
            contract?.contract_type_name ||
              ""
          ).toLowerCase();

        const matchesSearch =
          !search ||
          contractNo.includes(search) ||
          title.includes(search) ||
          party.includes(search) ||
          contractType.includes(search);

        let matchesTab = true;

        if (
          activeTab ===
          "Pending My Approval"
        ) {
          matchesTab =
            decision === "pending" ||
            decision ===
              "pending approval";
        }

        if (
          activeTab ===
          "For Other Approvers"
        ) {
          matchesTab =
            decision ===
              "waiting for others" ||
            decision ===
              "for other approvers";
        }

        if (
          activeTab ===
          "Approved"
        ) {
          matchesTab =
            decision === "approved";
        }

        if (
          activeTab ===
          "Rejected"
        ) {
          matchesTab =
            decision === "rejected";
        }

        const priority =
          String(
            approval?.priority ||
              "Medium"
          );

        const matchesPriority =
          priorityFilter === "All" ||
          priority ===
            priorityFilter;

        return (
          matchesSearch &&
          matchesTab &&
          matchesPriority
        );
      }
    );
  }, [
    approvals,
    contracts,
    searchTerm,
    activeTab,
    priorityFilter,
  ]);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredApprovals.length /
        ITEMS_PER_PAGE
    )
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safeCurrentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedApprovals =
    filteredApprovals.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );

  /*
  |--------------------------------------------------------------------------
  | REVIEW
  |--------------------------------------------------------------------------
  */

  const handleReview = (
    approval
  ) => {
    setOpenMenuId(null);
    setSelectedApproval(
      approval
    );
    setShowReviewModal(true);
  };

  const closeReview = () => {
    setShowReviewModal(false);
    setSelectedApproval(null);
  };

  /*
  |--------------------------------------------------------------------------
  | APPROVE
  |--------------------------------------------------------------------------
  */

  const handleApprove = async (
    approval
  ) => {
    if (!approval?.id) {
      alert(
        "Approval ID is missing."
      );
      return;
    }

    if (!isPending(approval)) {
      alert(
        "This approval has already been decided."
      );
      return;
    }

    const contract =
      getContract(approval);

    const contractNo =
      contract?.contract_no ||
      approval.contract_id;

    const confirmed =
      window.confirm(
        `Are you sure you want to approve ${contractNo}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await approveApproval(
        approval.id
      );

      alert(
        "Contract approved successfully."
      );

      closeReview();

      await loadData();

      setActiveTab("Approved");
      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Failed to approve:",
        err
      );

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to approve this contract."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REJECT
  |--------------------------------------------------------------------------
  */

  const handleReject = async (
    approval
  ) => {
    if (!approval?.id) {
      alert(
        "Approval ID is missing."
      );
      return;
    }

    if (!isPending(approval)) {
      alert(
        "This approval has already been decided."
      );
      return;
    }

    const remarks =
      window.prompt(
        "Enter the reason for rejection:"
      );

    if (remarks === null) {
      return;
    }

    if (!remarks.trim()) {
      alert(
        "Rejection remarks are required."
      );
      return;
    }

    try {
      await rejectApproval(
        approval.id,
        remarks.trim()
      );

      alert(
        "Contract rejected successfully."
      );

      closeReview();

      await loadData();

      setActiveTab("Rejected");
      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Failed to reject:",
        err
      );

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to reject this contract."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PRIORITY STYLE
  |--------------------------------------------------------------------------
  */

  const priorityClass = (
    priority
  ) => {
    switch (
      String(priority).toLowerCase()
    ) {
      case "high":
        return "bg-red-50 text-red-600";

      case "low":
        return "bg-green-50 text-green-600";

      default:
        return "bg-orange-50 text-orange-600";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DECISION STYLE
  |--------------------------------------------------------------------------
  */

  const decisionClass = (
    decision
  ) => {
    switch (
      String(decision).toLowerCase()
    ) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] min-w-0 items-center justify-center overflow-hidden">
          <div className="rounded-xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
            <p className="text-gray-500">
              Loading approvals...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <MainLayout>
      <div className="min-w-0 w-full max-w-full space-y-6 overflow-x-hidden">

        {/* HEADER */}

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Approvals
          </h1>

          <p className="mt-1 text-gray-500">
            Review and approve contracts and contract-related requests.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">

              <span className="text-sm text-red-700">
                {error}
              </span>

              <button
                type="button"
                onClick={loadData}
                className="text-sm font-semibold text-red-700 underline"
              >
                Retry
              </button>

            </div>
          </div>
        )}

        {/* ====================================================
            KPI CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={
              <BiTime size={25} />
            }
            title="Pending My Approval"
            value={stats.pending}
            subtitle="Requires your action"
            className="bg-orange-50 text-orange-500"
            active={
              activeTab ===
              "Pending My Approval"
            }
            onClick={() => {
              setActiveTab(
                "Pending My Approval"
              );
              setCurrentPage(1);
            }}
          />

          <StatCard
            icon={
              <BiSend size={25} />
            }
            title="For Other Approvers"
            value={
              stats.waitingForOthers
            }
            subtitle="Waiting for others"
            className="bg-blue-50 text-blue-500"
            active={
              activeTab ===
              "For Other Approvers"
            }
            onClick={() => {
              setActiveTab(
                "For Other Approvers"
              );
              setCurrentPage(1);
            }}
          />

          <StatCard
            icon={
              <BiCheckCircle
                size={25}
              />
            }
            title="Approved"
            value={stats.approved}
            subtitle="Approval records"
            className="bg-green-50 text-green-500"
            active={
              activeTab ===
              "Approved"
            }
            onClick={() => {
              setActiveTab(
                "Approved"
              );
              setCurrentPage(1);
            }}
          />

          <StatCard
            icon={
              <BiXCircle size={25} />
            }
            title="Rejected"
            value={stats.rejected}
            subtitle="Approval records"
            className="bg-red-50 text-red-500"
            active={
              activeTab ===
              "Rejected"
            }
            onClick={() => {
              setActiveTab(
                "Rejected"
              );
              setCurrentPage(1);
            }}
          />

        </div>

        {/* ====================================================
            TABS
        ==================================================== */}

        <div className="w-full border-b border-gray-200">

          <div className="flex flex-wrap gap-x-7 gap-y-0 overflow-hidden">

            {[
              "Pending My Approval",
              "For Other Approvers",
              "Approved",
              "Rejected",
              "All",
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`
                  whitespace-nowrap
                  border-b-2
                  px-1
                  pb-3
                  pt-2
                  text-sm
                  font-medium
                  transition
                  ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }
                `}
              >
                {tab}
              </button>
            ))}

          </div>

        </div>

        {/* ====================================================
            SEARCH / FILTER
        ==================================================== */}

        <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <div className="relative md:col-span-2">

              <BiSearch
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-xl
                  text-gray-400
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                placeholder="Search contract no., title, party, or contract type..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  py-3
                  pl-12
                  pr-4
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

            </div>

            <div className="flex gap-3">

              <select
                value={
                  priorityFilter
                }
                onChange={(e) => {
                  setPriorityFilter(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                className="
                  w-full
                  rounded-xl
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
                  All Priorities
                </option>

                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPriorityFilter(
                    "All"
                  );
                  setActiveTab(
                    "Pending My Approval"
                  );
                  setCurrentPage(1);
                }}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-gray-300
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
              >
                <BiFilterAlt size={18} />

                Clear
              </button>

            </div>

          </div>

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="w-full min-w-0 overflow-hidden">

            <table className="w-full table-fixed">

              <thead>

                <tr className="
                  border-b
                  bg-gray-50
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">

                  <th className="w-[11%] px-3 py-4">
                    Contract No.
                  </th>

                  <th className="w-[16%] px-3 py-4">
                    Contract Title
                  </th>

                  <th className="w-[14%] px-3 py-4">
                    Contract Type
                  </th>

                  <th className="w-[13%] px-3 py-4">
                    Party
                  </th>

                  <th className="w-[11%] px-3 py-4">
                    Status
                  </th>

                  <th className="w-[10%] px-3 py-4">
                    Decision
                  </th>

                  <th className="w-[10%] px-3 py-4">
                    Submitted
                  </th>

                  <th className="w-[8%] px-3 py-4">
                    Priority
                  </th>

                  <th className="w-[7%] px-2 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {paginatedApprovals.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="px-6 py-14 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="
                          flex
                          h-14
                          w-14
                          items-center
                          justify-center
                          rounded-full
                          bg-gray-100
                          text-gray-400
                        ">
                          <BiCheckCircle
                            size={28}
                          />
                        </div>

                        <p className="mt-4 font-semibold text-gray-700">
                          No approvals found
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Approval records will appear here when contracts are submitted for approval.
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  paginatedApprovals.map(
                    (approval) => {

                      const contract =
                        getContract(
                          approval
                        );

                      const decision =
                        approval.decision ||
                        "Pending";

                      const priority =
                        approval.priority ||
                        "Medium";

                      return (
                        <tr
                          key={
                            approval.id
                          }
                          className="
                            border-b
                            last:border-0
                            hover:bg-gray-50
                          "
                        >

                          {/* CONTRACT NO */}

                          <td className="px-3 py-4 align-middle">

                            <button
                              type="button"
                              onClick={() =>
                                handleReview(
                                  approval
                                )
                              }
                              className="
                                font-semibold
                                text-blue-600
                                hover:text-blue-800
                                hover:underline
                              "
                            >
                              {contract?.contract_no ||
                                "—"}
                            </button>

                          </td>

                          {/* TITLE */}

                          <td className="px-3 py-4 align-middle">

                            <p className="break-words font-medium text-slate-800">
                              {contract?.title ||
                                "Contract not found"}
                            </p>

                          </td>

                          {/* TYPE */}

                          <td className="px-3 py-4 align-middle">

                            <span className="
                              inline-flex
                              max-w-full
                              whitespace-normal
                              rounded-full
                              bg-blue-50
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              text-blue-700
                            ">
                              {contract?.contract_type_name ||
                                "—"}
                            </span>

                          </td>

                          {/* PARTY */}

                          <td className="break-words px-3 py-4 align-middle text-sm text-gray-600">
                            {contract?.party_name ||
                              "—"}
                          </td>

                          {/* CONTRACT STATUS */}

                          <td className="px-3 py-4 align-middle">

                            <span
                              className={`
                                inline-flex
                                max-w-full
                                whitespace-normal
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${
                                  getContractStatus(
                                    approval
                                  ) ===
                                  "Active"
                                    ? "bg-green-100 text-green-700"
                                    : getContractStatus(
                                          approval
                                        ) ===
                                        "Pending Approval"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                                }
                              `}
                            >
                              {getContractStatus(
                                approval
                              )}
                            </span>

                          </td>

                          {/* DECISION */}

                          <td className="px-3 py-4 align-middle">

                            <span
                              className={`
                                inline-flex
                                max-w-full
                                whitespace-normal
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${decisionClass(
                                  decision
                                )}
                              `}
                            >
                              {decision}
                            </span>

                          </td>

                          {/* SUBMITTED */}

                          <td className="px-3 py-4 align-middle">

                            <p className="text-sm font-medium text-gray-700">
                              {formatDate(
                                approval.created_at
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              {formatTime(
                                approval.created_at
                              )}
                            </p>

                          </td>

                          {/* PRIORITY */}

                          <td className="px-3 py-4 align-middle">

                            <span
                              className={`
                                inline-flex
                                max-w-full
                                whitespace-normal
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${priorityClass(
                                  priority
                                )}
                              `}
                            >
                              {priority}
                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="relative px-2 py-4 align-middle">

                            <div className="flex items-center justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleReview(
                                    approval
                                  )
                                }
                                className="
                                  shrink-0
                                  rounded-lg
                                  border
                                  border-blue-200
                                  px-3
                                  py-2
                                  text-xs
                                  font-medium
                                  text-blue-600
                                  hover:bg-blue-50
                                "
                              >
                                Review
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId ===
                                      approval.id
                                      ? null
                                      : approval.id
                                  )
                                }
                                className="
                                  rounded-lg
                                  p-2
                                  text-gray-500
                                  hover:bg-gray-100
                                "
                              >
                                <BiDotsVerticalRounded
                                  size={21}
                                />
                              </button>

                            </div>

                            {openMenuId ===
                              approval.id && (

                              <div className="
                                absolute
                                right-5
                                top-14
                                z-30
                                w-48
                                overflow-hidden
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                text-left
                                shadow-xl
                              ">

                                {/* REVIEW */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReview(
                                      approval
                                    )
                                  }
                                  className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    text-sm
                                    text-gray-700
                                    hover:bg-gray-50
                                  "
                                >
                                  <BiShow
                                    size={18}
                                  />

                                  Review
                                </button>

                                {/* APPROVE / REJECT */}

                                {isPending(
                                  approval
                                ) && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleApprove(
                                          approval
                                        )
                                      }
                                      className="
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        px-4
                                        py-3
                                        text-sm
                                        text-green-600
                                        hover:bg-green-50
                                      "
                                    >
                                      <BiCheck
                                        size={18}
                                      />

                                      Approve
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleReject(
                                          approval
                                        )
                                      }
                                      className="
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-600
                                        hover:bg-red-50
                                      "
                                    >
                                      <BiX
                                        size={18}
                                      />

                                      Reject
                                    </button>
                                  </>
                                )}

                              </div>
                            )}

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          {filteredApprovals.length >
            0 && (

            <div className="
              flex
              flex-col
              gap-4
              border-t
              border-gray-200
              px-6
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            ">

              <p className="text-sm text-gray-500">

                Showing{" "}

                <span className="font-medium text-gray-700">
                  {startIndex + 1}
                </span>

                {" "}to{" "}

                <span className="font-medium text-gray-700">
                  {Math.min(
                    startIndex +
                      paginatedApprovals.length,
                    filteredApprovals.length
                  )}
                </span>

                {" "}of{" "}

                <span className="font-medium text-gray-700">
                  {filteredApprovals.length}
                </span>

                {" "}approvals

              </p>

              <div className="flex max-w-full flex-wrap items-center gap-2">

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
                  className="
                    h-9
                    w-9
                    rounded-lg
                    border
                    border-gray-300
                    text-gray-600
                    hover:bg-gray-50
                    disabled:opacity-40
                  "
                >
                  ‹
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      setCurrentPage(
                        page
                      )
                    }
                    className={`
                      h-9
                      min-w-9
                      rounded-lg
                      px-2
                      text-sm
                      font-medium
                      ${
                        safeCurrentPage ===
                        page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    {page}
                  </button>

                ))}

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
                  className="
                    h-9
                    w-9
                    rounded-lg
                    border
                    border-gray-300
                    text-gray-600
                    hover:bg-gray-50
                    disabled:opacity-40
                  "
                >
                  ›
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}

      {showReviewModal &&
        selectedApproval && (

        <ReviewModal
          approval={
            selectedApproval
          }
          contract={getContract(
            selectedApproval
          )}
          onClose={
            closeReview
          }
          onApprove={() =>
            handleApprove(
              selectedApproval
            )
          }
          onReject={() =>
            handleReject(
              selectedApproval
            )
          }
        />

      )}

    </MainLayout>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  icon,
  title,
  value,
  subtitle,
  className,
  onClick,
  active = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        rounded-2xl
        border
        bg-white
        p-5
        text-left
        shadow-sm
        transition-all
        duration-200
        ${
          active
            ? "border-blue-500 ring-2 ring-blue-100 shadow-md"
            : "border-slate-200"
        }
        ${
          onClick
            ? "cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            : ""
        }
      `}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            ${className}
          `}
        >
          {icon}
        </div>

      </div>

      <div className="mt-4 text-xs font-medium text-gray-400">
        Click to view
      </div>

    </button>
  );
}

/*
|--------------------------------------------------------------------------
| REVIEW MODAL
|--------------------------------------------------------------------------
*/

function ReviewModal({
  approval,
  contract,
  onClose,
  onApprove,
  onReject,
}) {
  const pending =
    String(
      approval?.decision || ""
    ).toLowerCase() ===
      "pending" ||
    String(
      approval?.decision || ""
    ).toLowerCase() ===
      "pending approval";

  return (
    <div className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-4
    ">

      <div className="
        max-h-[90vh]
        w-full
        max-w-3xl
        overflow-y-auto
        rounded-2xl
        bg-white
        shadow-2xl
      ">

        {/* HEADER */}

        <div className="
          sticky
          top-0
          z-10
          flex
          items-center
          justify-between
          border-b
          border-gray-200
          bg-white
          px-6
          py-5
        ">

          <div>

            <h2 className="text-xl font-bold text-slate-800">
              Review Approval
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review the contract before making a decision.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-2xl
              text-gray-400
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            ×
          </button>

        </div>

        {/* CONTENT */}

        <div className="space-y-6 p-6">

          {/* CONTRACT DETAILS */}

          <div className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          ">

            <Detail
              label="Contract No."
              value={
                contract?.contract_no ||
                "—"
              }
            />

            <Detail
              label="Title"
              value={
                contract?.title ||
                "—"
              }
            />

            <Detail
              label="Contract Type"
              value={
                contract?.contract_type_name ||
                "—"
              }
            />

            <Detail
              label="Party"
              value={
                contract?.party_name ||
                "—"
              }
            />

            <Detail
              label="Contract Status"
              value={
                contract?.status ||
                "—"
              }
            />

            <Detail
              label="Approval Decision"
              value={
                approval?.decision ||
                "Pending"
              }
            />

            <Detail
              label="Start Date"
              value={formatSimpleDate(
                contract?.start_date
              )}
            />

            <Detail
              label="End Date"
              value={formatSimpleDate(
                contract?.end_date
              )}
            />

          </div>

          {/* DESCRIPTION */}

          <div>

            <p className="mb-2 text-sm font-semibold text-gray-700">
              Contract Description
            </p>

            <div className="
              min-h-[100px]
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-4
              text-sm
              leading-6
              text-gray-600
            ">
              {contract?.description ||
                "No description provided."}
            </div>

          </div>

          {/* APPROVAL REMARKS */}

          <div>

            <p className="mb-2 text-sm font-semibold text-gray-700">
              Approval Remarks
            </p>

            <div className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              p-4
              text-sm
              text-gray-600
            ">
              {approval?.remarks ||
                "No remarks provided."}
            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="
          flex
          flex-col-reverse
          gap-3
          border-t
          border-gray-200
          px-6
          py-4
          sm:flex-row
          sm:justify-end
        ">

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              border
              border-gray-300
              px-5
              py-2.5
              font-medium
              text-gray-700
              hover:bg-gray-50
            "
          >
            Close
          </button>

          {pending && (
            <>

              <button
                type="button"
                onClick={onReject}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-red-200
                  px-5
                  py-2.5
                  font-medium
                  text-red-600
                  hover:bg-red-50
                "
              >
                <BiX size={19} />

                Reject
              </button>

              <button
                type="button"
                onClick={onApprove}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-blue-600
                  px-5
                  py-2.5
                  font-medium
                  text-white
                  hover:bg-blue-700
                "
              >
                <BiCheck size={19} />

                Approve
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DETAIL
|--------------------------------------------------------------------------
*/

function Detail({
  label,
  value,
}) {
  return (
    <div>

      <p className="
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-gray-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        text-sm
        font-medium
        text-gray-700
      ">
        {value || "—"}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SIMPLE DATE
|--------------------------------------------------------------------------
*/

function formatSimpleDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default Approvals;