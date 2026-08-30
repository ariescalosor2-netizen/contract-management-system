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
  getApproval,
  approveApproval,
  rejectApproval,
} from "../services/approvalService";

import { getContracts } from "../services/contractService";

const ITEMS_PER_PAGE = 10;

// ============================================================
// HELPERS
// ============================================================

function getDecision(approval) {
  return String(
    approval?.decision || "Pending"
  )
    .trim()
    .toLowerCase();
}

function isPending(approval) {
  const decision = getDecision(
    approval
  );

  return (
    decision === "pending" ||
    decision === "pending approval"
  );
}

function getApprovalType(approval) {
  if (!approval) {
    return "Unknown";
  }

  if (approval.approval_type) {
    return String(
      approval.approval_type
    );
  }

  if (approval.renewal_id) {
    return "Renewal";
  }

  if (approval.amendment_id) {
    return "Amendment";
  }

  if (approval.contract_id) {
    return "Contract";
  }

  return "Unknown";
}

function formatDate(value) {
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
}

function formatTime(value) {
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
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return `${formatDate(
    value
  )} ${formatTime(value)}`;
}

// ============================================================
// MAIN
// ============================================================

function Approvals() {
  const [approvals, setApprovals] =
    useState([]);

  const [contracts, setContracts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState(
      "Pending My Approval"
    );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [
    selectedApproval,
    setSelectedApproval,
  ] = useState(null);

  const [
    showReviewModal,
    setShowReviewModal,
  ] = useState(false);

  const [
    reviewLoading,
    setReviewLoading,
  ] = useState(false);

  // ============================================================
  // LOAD DATA
  // ============================================================

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

      if (
        err.response?.status === 401
      ) {
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

  // ============================================================
  // FIND CONTRACT
  // ============================================================

  const getContract = (
    approval
  ) => {
    if (!approval) {
      return null;
    }

    if (
      approval.contract_id
    ) {
      const found =
        contracts.find(
          (contract) =>
            String(contract.id) ===
            String(
              approval.contract_id
            )
        );

      if (found) {
        return found;
      }
    }

    // Backend may already return
    // contract information.
    if (
      approval.contract_no ||
      approval.contract_title
    ) {
      return {
        id:
          approval.contract_id ||
          null,

        contract_no:
          approval.contract_no ||
          null,

        title:
          approval.contract_title ||
          null,

        contract_type_name:
          approval.contract_type ||
          null,

        party_name:
          approval.party_name ||
          null,

        status:
          approval.contract_status ||
          null,

        start_date:
          approval.contract_start_date ||
          null,

        end_date:
          approval.contract_end_date ||
          null,

        value:
          approval.contract_value ||
          null,

        description:
          approval.contract_description ||
          null,
      };
    }

    return null;
  };

  // ============================================================
  // STATUS
  // ============================================================

  const getStatus = (
    approval
  ) => {
    const type =
      getApprovalType(
        approval
      ).toLowerCase();

    if (
      type === "renewal" &&
      approval.renewal_status
    ) {
      return approval.renewal_status;
    }

    if (
      type === "amendment" &&
      approval.amendment_status
    ) {
      return approval.amendment_status;
    }

    const contract =
      getContract(approval);

    return (
      approval.contract_status ||
      contract?.status ||
      (isPending(approval)
        ? "Pending Approval"
        : "Unknown")
    );
  };

  // ============================================================
  // STATS
  // ============================================================

  const stats = useMemo(() => {
    const pending =
      approvals.filter(
        (approval) =>
          getDecision(approval) ===
            "pending" ||
          getDecision(approval) ===
            "pending approval"
      ).length;

    const approved =
      approvals.filter(
        (approval) =>
          getDecision(approval) ===
          "approved"
      ).length;

    const rejected =
      approvals.filter(
        (approval) =>
          getDecision(approval) ===
          "rejected"
      ).length;

    const waitingForOthers =
      approvals.filter(
        (approval) => {
          const decision =
            getDecision(
              approval
            );

          return (
            decision ===
              "waiting for others" ||
            decision ===
              "for other approvers"
          );
        }
      ).length;

    return {
      pending,
      approved,
      rejected,
      waitingForOthers,
    };
  }, [approvals]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredApprovals =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return approvals.filter(
        (approval) => {
          const contract =
            getContract(approval);

          const decision =
            getDecision(
              approval
            );

          const type =
            getApprovalType(
              approval
            ).toLowerCase();

          const contractNo =
            String(
              approval.contract_no ||
                contract?.contract_no ||
                ""
            ).toLowerCase();

          const title =
            String(
              approval.contract_title ||
                approval.amendment_title ||
                contract?.title ||
                ""
            ).toLowerCase();

          const party =
            String(
              approval.party_name ||
                contract?.party_name ||
                ""
            ).toLowerCase();

          const amendmentNo =
            String(
              approval.amendment_no ||
                ""
            ).toLowerCase();

          const renewalNo =
            String(
              approval.renewal_no ||
                ""
            ).toLowerCase();

          const matchesSearch =
            !search ||
            contractNo.includes(
              search
            ) ||
            title.includes(search) ||
            party.includes(search) ||
            amendmentNo.includes(
              search
            ) ||
            renewalNo.includes(
              search
            ) ||
            type.includes(search);

          let matchesTab = true;

          if (
            activeTab ===
            "Pending My Approval"
          ) {
            matchesTab =
              decision ===
                "pending" ||
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

          return (
            matchesSearch &&
            matchesTab
          );
        }
      );
    }, [
      approvals,
      contracts,
      searchTerm,
      activeTab,
    ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.max(
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

  // ============================================================
  // KPI CLICK
  // ============================================================

  const handleKpiClick = (
    tab
  ) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setOpenMenuId(null);
  };

  // ============================================================
  // REVIEW
  // ============================================================

  const handleReview = async (
    approval
  ) => {
    if (!approval?.id) {
      return;
    }

    setOpenMenuId(null);
    setReviewLoading(true);
    setError("");

    try {
      const response =
        await getApproval(
          approval.id
        );

const fullApproval =
  response?.data ??
  response?.approval ??
  response ??
  approval;

console.log(
  "REACT FULL APPROVAL:",
  fullApproval
);

console.log(
  "REACT NEW END DATE:",
  fullApproval?.new_end_date
);

setSelectedApproval(
  fullApproval
);

      setShowReviewModal(true);
    } catch (err) {
      console.error(
        "Failed to load approval details:",
        err
      );

      // Fallback to current row data
      setSelectedApproval(
        approval
      );

      setShowReviewModal(true);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setShowReviewModal(false);
    setSelectedApproval(null);
  };

  // ============================================================
  // APPROVE
  // ============================================================

  const handleApprove = async (
    approval
  ) => {
    if (!approval?.id) {
      alert(
        "Approval ID is missing."
      );
      return;
    }

    const type =
      getApprovalType(
        approval
      );

    const reference =
      approval.contract_no ||
      approval.amendment_no ||
      approval.renewal_no ||
      "this request";

    const confirmed =
      window.confirm(
        `Are you sure you want to approve ${type} ${reference}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await approveApproval(
        approval.id
      );

      alert(
        `${type} approved successfully.`
      );

      closeReview();

      await loadData();
    } catch (err) {
      console.error(
        "Failed to approve:",
        err
      );

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          `Failed to approve this ${type.toLowerCase()}.`
      );
    }
  };

  // ============================================================
  // REJECT
  // ============================================================

  const handleReject = async (
    approval
  ) => {
    if (!approval?.id) {
      alert(
        "Approval ID is missing."
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

      const type =
        getApprovalType(
          approval
        );

      alert(
        `${type} rejected successfully.`
      );

      closeReview();

      await loadData();
    } catch (err) {
      console.error(
        "Failed to reject:",
        err
      );

      alert(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to reject this request."
      );
    }
  };

  // ============================================================
  // DECISION STYLE
  // ============================================================

  const decisionClass = (
    decision
  ) => {
    switch (
      String(
        decision
      ).toLowerCase()
    ) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const statusClass = (
    status
  ) => {
    switch (
      String(
        status
      ).toLowerCase()
    ) {
      case "active":
      case "approved":
        return "bg-green-100 text-green-700";

      case "pending":
      case "pending approval":
        return "bg-yellow-100 text-yellow-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ============================================================
  // TYPE STYLE
  // ============================================================

  const typeClass = (
    approval
  ) => {
    const type =
      getApprovalType(
        approval
      ).toLowerCase();

    if (type === "renewal") {
      return "bg-blue-50 text-blue-700";
    }

    if (type === "amendment") {
      return "bg-purple-50 text-purple-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="rounded-xl border border-gray-200 bg-white px-8 py-6 shadow-sm">
            <p className="text-gray-500">
              Loading approvals...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <MainLayout>
      <div className="space-y-6">

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

        {/* ======================================================
            KPI
        ====================================================== */}

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
            onClick={() =>
              handleKpiClick(
                "Pending My Approval"
              )
            }
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
            onClick={() =>
              handleKpiClick(
                "For Other Approvers"
              )
            }
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
            onClick={() =>
              handleKpiClick(
                "Approved"
              )
            }
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
            onClick={() =>
              handleKpiClick(
                "Rejected"
              )
            }
          />

        </div>

        {/* TABS */}

        <div className="border-b border-gray-200">

          <div className="flex gap-7 overflow-x-auto">

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

        {/* SEARCH */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex gap-3">

            <div className="relative flex-1">

              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(
                    e.target.value
                  );
                  setCurrentPage(1);
                }}
                placeholder="Search contract no., title, party, amendment, or renewal..."
                className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <BiFilterAlt
                size={18}
              />
              Clear
            </button>

          </div>

        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead>

                <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">

                  <th className="px-5 py-4">
                    Type
                  </th>

                  <th className="px-5 py-4">
                    Reference No.
                  </th>

                  <th className="px-5 py-4">
                    Contract Title
                  </th>

                  <th className="px-5 py-4">
                    Contract Type
                  </th>

                  <th className="px-5 py-4">
                    Party
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Decision
                  </th>

                  <th className="px-5 py-4">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-right">
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

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">

                          <BiCheckCircle
                            size={28}
                          />

                        </div>

                        <p className="mt-4 font-semibold text-gray-700">
                          No approvals found
                        </p>

                        <p className="mt-1 text-sm text-gray-400">
                          Approval records will appear here when requests are submitted for approval.
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

                      const type =
                        getApprovalType(
                          approval
                        );

                      const referenceNo =
                        approval.renewal_no ||
                        approval.amendment_no ||
                        approval.contract_no ||
                        contract?.contract_no ||
                        "—";

                      const title =
                        approval.contract_title ||
                        approval.amendment_title ||
                        contract?.title ||
                        "—";

                      const contractType =
                        approval.contract_type ||
                        contract?.contract_type_name ||
                        "—";

                      const party =
                        approval.party_name ||
                        contract?.party_name ||
                        "—";

                      const status =
                        getStatus(
                          approval
                        );

                      const decision =
                        approval.decision ||
                        "Pending";

                      return (
                        <tr
                          key={
                            approval.id
                          }
                          className="border-b last:border-0 hover:bg-gray-50"
                        >

                          {/* TYPE */}

                          <td className="px-5 py-5">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${typeClass(
                                  approval
                                )}
                              `}
                            >
                              {type}
                            </span>

                          </td>

                          {/* REFERENCE */}

                          <td className="px-5 py-5">

                            <span className="font-semibold text-slate-800">
                              {referenceNo}
                            </span>

                          </td>

                          {/* TITLE */}

                          <td className="max-w-[240px] px-5 py-5">

                            <p className="max-w-[240px] truncate font-medium text-slate-800">
                              {title}
                            </p>

                          </td>

                          {/* CONTRACT TYPE */}

                          <td className="px-5 py-5">

                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              {contractType}
                            </span>

                          </td>

                          {/* PARTY */}

                          <td className="px-5 py-5 text-sm text-gray-600">
                            {party}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5">

                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1.5
                                text-xs
                                font-semibold
                                ${statusClass(
                                  status
                                )}
                              `}
                            >
                              {status}
                            </span>

                          </td>

                          {/* DECISION */}

                          <td className="px-5 py-5">

                            <span
                              className={`
                                inline-flex
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

                          <td className="px-5 py-5">

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

                          {/* ACTIONS */}

                          <td className="relative px-5 py-5">

                            <div className="flex justify-end">

                              <button
                                type="button"
                                aria-label="Approval actions"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId ===
                                      approval.id
                                      ? null
                                      : approval.id
                                  )
                                }
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                              >

                                <BiDotsVerticalRounded
                                  size={22}
                                />

                              </button>

                            </div>

                            {/* MENU */}

                            {openMenuId ===
                              approval.id && (
                              <div className="absolute right-5 top-14 z-50 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-xl">

                                {/* REVIEW */}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReview(
                                      approval
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                >

                                  <BiShow
                                    size={18}
                                  />

                                  Review

                                </button>

                                {/* APPROVE */}

                                {isPending(
                                  approval
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApprove(
                                        approval
                                      )
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-green-600 hover:bg-green-50"
                                  >

                                    <BiCheck
                                      size={18}
                                    />

                                    Approve

                                  </button>
                                )}

                                {/* REJECT */}

                                {isPending(
                                  approval
                                ) && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReject(
                                        approval
                                      )
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                  >

                                    <BiX
                                      size={18}
                                    />

                                    Reject

                                  </button>
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
            <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

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
                  {
                    filteredApprovals.length
                  }
                </span>

                {" "}approvals

              </p>

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
                  className="h-9 w-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  ‹
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (page) => (
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
                  )
                )}

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
                  className="h-9 w-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
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
            loading={
              reviewLoading
            }
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

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  title,
  value,
  subtitle,
  className,
  active,
  onClick,
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
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        ${
          active
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-slate-200"
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

    </button>
  );
}

// ============================================================
// REVIEW MODAL
// ============================================================

function ReviewModal({
  approval,
  contract,
  loading,
  onClose,
  onApprove,
  onReject,
}) {
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

        <div className="rounded-2xl bg-white px-10 py-8 shadow-2xl">

          <p className="text-gray-600">
            Loading approval details...
          </p>

        </div>

      </div>
    );
  }

  const type =
    getApprovalType(
      approval
    );

  const pending =
    isPending(
      approval
    );

  const contractNo =
    approval.contract_no ||
    contract?.contract_no ||
    "—";

  const contractTitle =
    approval.contract_title ||
    contract?.title ||
    "—";

  const contractType =
    approval.contract_type ||
    contract?.contract_type_name ||
    "—";

  const party =
    approval.party_name ||
    contract?.party_name ||
    "—";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >

      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-5">

          <div>

            <div className="flex items-center gap-3">

              <h2 className="text-xl font-bold text-slate-800">
                Review {type}
              </h2>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {type}
              </span>

            </div>

            <p className="mt-1 text-sm text-gray-500">
              Review the approval request before making a decision.
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>

        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-6">

          <div className="space-y-7">

            {/* CONTRACT */}

            <section>

              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Contract Details
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <Detail
                  label="Contract No."
                  value={contractNo}
                />

                <Detail
                  label="Contract Title"
                  value={contractTitle}
                />

                <Detail
                  label="Contract Type"
                  value={contractType}
                />

                <Detail
                  label="Party"
                  value={party}
                />

                <Detail
                  label="Contract Status"
                  value={
                    approval.contract_status ||
                    contract?.status
                  }
                />

                <Detail
                  label="Contract Value"
                  value={
                    approval.contract_value !=
                    null
                      ? Number(
                          approval.contract_value
                        ).toLocaleString()
                      : contract?.value !=
                        null
                      ? Number(
                          contract.value
                        ).toLocaleString()
                      : "—"
                  }
                />

                <Detail
                  label="Start Date"
                  value={formatDate(
                    approval.contract_start_date ||
                      contract?.start_date
                  )}
                />

                <Detail
                  label="End Date"
                  value={formatDate(
                    approval.contract_end_date ||
                      contract?.end_date
                  )}
                />

              </div>

              <div className="mt-5">

                <InfoBox
                  label="Description"
                  value={
                    approval.contract_description ||
                    contract?.description
                  }
                />

              </div>

            </section>

            {/* AMENDMENT */}

            {type.toLowerCase() ===
              "amendment" && (
              <section className="rounded-2xl border border-purple-200 bg-purple-50/40 p-5">

                <h3 className="mb-4 text-lg font-semibold text-purple-800">
                  Amendment Details
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <Detail
                    label="Amendment No."
                    value={
                      approval.amendment_no
                    }
                  />

                  <Detail
                    label="Amendment Title"
                    value={
                      approval.amendment_title
                    }
                  />

                  <Detail
                    label="Amendment Type"
                    value={
                      approval.amendment_type
                    }
                  />

                  <Detail
                    label="Amendment Status"
                    value={
                      approval.amendment_status
                    }
                  />

                  <Detail
                    label="Original Value"
                    value={
                      approval.original_value !=
                      null
                        ? Number(
                            approval.original_value
                          ).toLocaleString()
                        : "—"
                    }
                  />

                  <Detail
                    label="Amended Value"
                    value={
                      approval.amended_value !=
                      null
                        ? Number(
                            approval.amended_value
                          ).toLocaleString()
                        : "—"
                    }
                  />

                  <Detail
                    label="Original Start Date"
                    value={formatDate(
                      approval.original_start_date
                    )}
                  />

                  <Detail
                    label="Original End Date"
                    value={formatDate(
                      approval.original_end_date
                    )}
                  />

                  <Detail
                    label="New Start Date"
                    value={formatDate(
                      approval.new_start_date
                    )}
                  />

                  <Detail
                    label="New End Date"
                    value={formatDate(
                      approval.new_end_date
                    )}
                  />

                  <Detail
                    label="Request Date"
                    value={formatDate(
                      approval.request_date
                    )}
                  />

                  <Detail
                    label="Effective Date"
                    value={formatDate(
                      approval.effective_date
                    )}
                  />

                </div>

                <div className="mt-5 space-y-4">

                  <InfoBox
                    label="Description"
                    value={
                      approval.amendment_description
                    }
                  />

                  <InfoBox
                    label="Reason"
                    value={
                      approval.amendment_reason
                    }
                  />

                  <InfoBox
                    label="Scope Changes"
                    value={
                      approval.scope_changes
                    }
                  />

                  {approval.rejection_reason && (
                    <InfoBox
                      label="Rejection Reason"
                      value={
                        approval.rejection_reason
                      }
                      danger
                    />
                  )}

                </div>

              </section>
            )}

            {/* RENEWAL */}

            {type.toLowerCase() ===
              "renewal" && (
              <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">

                <h3 className="mb-4 text-lg font-semibold text-blue-800">
                  Renewal Details
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <Detail
                    label="Renewal No."
                    value={
                      approval.renewal_no
                    }
                  />

                  <Detail
                    label="Renewal Type"
                    value={
                      approval.renewal_type
                    }
                  />

                  <Detail
                    label="Current End Date"
                    value={formatDate(
                      approval.current_end_date
                    )}
                  />

                  <Detail
                    label="New End Date"
                    value={formatDate(
                      approval.new_end_date
                    )}
                  />

                  <Detail
                    label="Renewal Status"
                    value={
                      approval.renewal_status
                    }
                  />

                  <Detail
                    label="Renewal ID"
                    value={
                      approval.renewal_id
                    }
                  />

                </div>

              </section>
            )}

            {/* APPROVAL */}

            <section>

              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Approval Details
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <Detail
                  label="Approval Type"
                  value={type}
                />

                <Detail
                  label="Decision"
                  value={
                    approval.decision ||
                    "Pending"
                  }
                />

                <Detail
                  label="Approver"
                  value={
                    approval.approver_name
                  }
                />

                <Detail
                  label="Submitted"
                  value={formatDateTime(
                    approval.created_at
                  )}
                />

                <Detail
                  label="Approved At"
                  value={formatDateTime(
                    approval.approved_at
                  )}
                />

              </div>

              <div className="mt-5">

                <InfoBox
                  label="Approval Remarks"
                  value={
                    approval.remarks
                  }
                />

              </div>

            </section>

          </div>

        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>

          {pending && (
            <>
              <button
                type="button"
                onClick={onReject}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 font-medium text-red-600 hover:bg-red-50"
              >
                <BiX size={19} />
                Reject
              </button>

              <button
                type="button"
                onClick={onApprove}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
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

// ============================================================
// DETAIL
// ============================================================

function Detail({
  label,
  value,
}) {
  return (
    <div className="min-w-0">

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value || "—"}
      </p>

    </div>
  );
}

// ============================================================
// INFO BOX
// ============================================================

function InfoBox({
  label,
  value,
  danger = false,
}) {
  return (
    <div>

      <p
        className={`
          mb-2
          text-sm
          font-semibold
          ${
            danger
              ? "text-red-700"
              : "text-gray-700"
          }
        `}
      >
        {label}
      </p>

      <div
        className={`
          min-h-[60px]
          rounded-xl
          border
          p-4
          text-sm
          leading-6
          ${
            danger
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }
        `}
      >
        {value ||
          "No information provided."}
      </div>

    </div>
  );
}

export default Approvals;