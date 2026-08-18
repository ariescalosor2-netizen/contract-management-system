import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BiBarChartAlt2,
  BiCalendar,
  BiCheckCircle,
  BiChevronDown,
  BiChevronUp,
  BiFilter,
  BiMoney,
  BiRefresh,
  BiSearch,
  BiShow,
  BiTimeFive,
  BiXCircle,
  BiFlag,
  BiFile,
} from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import { getContracts } from "../services/contractService";
import { getMilestones } from "../services/milestoneService";
import { getApprovals } from "../services/approvalService";
import { getContractPayments } from "../services/paymentService";

const DAY = 24 * 60 * 60 * 1000;

function unwrap(response) {
  const data =
    response?.data ??
    response?.items ??
    response ??
    [];

  return Array.isArray(data) ? data : [];
}

function money(value) {
  const number = Number(value || 0);

  return number.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  });
}

function number(value) {
  return Number(value || 0).toLocaleString("en-PH");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function statusClass(status) {
  const value = normalize(status);

  if (
    value === "active" ||
    value === "completed" ||
    value === "paid" ||
    value === "approved"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (
    value === "pending" ||
    value === "in progress" ||
    value === "due soon"
  ) {
    return "bg-yellow-100 text-yellow-700";
  }

  if (
    value === "expired" ||
    value === "overdue" ||
    value === "rejected" ||
    value === "terminated"
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-600";
}

function Reports() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [partyFilter, setPartyFilter] = useState("All");
  const [reportDateFrom, setReportDateFrom] = useState("");
  const [reportDateTo, setReportDateTo] = useState("");

  const [activeSection, setActiveSection] = useState("contracts");
  const [expandedKpi, setExpandedKpi] = useState(null);

  const loadReports = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        contractsResponse,
        milestonesResponse,
        approvalsResponse,
      ] = await Promise.all([
        getContracts(),
        getMilestones(),
        getApprovals(),
      ]);

      const contractData = unwrap(contractsResponse);
      const milestoneData = unwrap(milestonesResponse);
      const approvalData = unwrap(approvalsResponse);

      setContracts(contractData);
      setMilestones(milestoneData);
      setApprovals(approvalData);

      // The current payment module exposes payments per contract.
      // Load those records in parallel so Reports still uses real
      // database data without introducing a second payment model/API.
      const paymentResults = await Promise.all(
        contractData.map(async (contract) => {
          try {
            const response = await getContractPayments(contract.id);
            const rows = unwrap(response);

            return rows.map((payment) => ({
              ...payment,
              contract_id:
                payment.contract_id || contract.id,
              contract_no:
                payment.contract_no || contract.contract_no,
              contract_title:
                payment.contract_title || contract.title,
            }));
          } catch {
            return [];
          }
        })
      );

      setPayments(paymentResults.flat());
    } catch (err) {
      console.error("Failed to load reports:", err);

      if (err?.response?.status === 401) {
        setError(
          "Your authentication session has expired. Please log in again."
        );
      } else if (err?.response?.status === 403) {
        setError(
          "You do not have permission to access one or more report sources."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load reports."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const daysUntil = (dateValue) => {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return null;

    date.setHours(0, 0, 0, 0);

    return Math.ceil((date.getTime() - today.getTime()) / DAY);
  };

  const isDateInRange = (value) => {
    if (!value) return true;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;

    if (reportDateFrom) {
      const from = new Date(`${reportDateFrom}T00:00:00`);
      if (date < from) return false;
    }

    if (reportDateTo) {
      const to = new Date(`${reportDateTo}T23:59:59`);
      if (date > to) return false;
    }

    return true;
  };

  const getContractType = (contract) =>
    contract.contract_type_name ||
    contract.contract_type ||
    contract.type ||
    "Unknown";

  const getParty = (contract) =>
    contract.party_name ||
    contract.party ||
    "Unknown";

  const filteredContracts = useMemo(() => {
    const query = normalize(search);

    return contracts.filter((contract) => {
      const contractStatus = normalize(contract.status);
      const contractType = normalize(getContractType(contract));
      const party = normalize(getParty(contract));

      const matchesSearch =
        !query ||
        normalize(contract.contract_no).includes(query) ||
        normalize(contract.title).includes(query) ||
        contractType.includes(query) ||
        party.includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        contractStatus === normalize(statusFilter);

      const matchesType =
        typeFilter === "All" ||
        contractType === normalize(typeFilter);

      const matchesParty =
        partyFilter === "All" ||
        party === normalize(partyFilter);

      const matchesDate =
        isDateInRange(contract.start_date) ||
        isDateInRange(contract.end_date);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesParty &&
        matchesDate
      );
    });
  }, [
    contracts,
    search,
    statusFilter,
    typeFilter,
    partyFilter,
    reportDateFrom,
    reportDateTo,
  ]);

  const filteredMilestones = useMemo(() => {
    const query = normalize(search);

    return milestones.filter((milestone) => {
      const status = normalize(milestone.status);

      const matchesSearch =
        !query ||
        normalize(milestone.milestone_no).includes(query) ||
        normalize(milestone.title).includes(query) ||
        normalize(milestone.contract_no).includes(query) ||
        normalize(milestone.contract_title).includes(query);

      const matchesDate = isDateInRange(milestone.due_date);

      return matchesSearch && matchesDate;
    });
  }, [
    milestones,
    search,
    reportDateFrom,
    reportDateTo,
  ]);

  const expiringContracts = useMemo(() => {
    return filteredContracts
      .map((contract) => ({
        ...contract,
        days_remaining: daysUntil(contract.end_date),
      }))
      .filter(
        (contract) =>
          contract.days_remaining !== null &&
          contract.days_remaining >= 0 &&
          contract.days_remaining <= 90
      )
      .sort(
        (a, b) =>
          a.days_remaining - b.days_remaining
      );
  }, [filteredContracts]);

  const activeContracts = contracts.filter(
    (item) => normalize(item.status) === "active"
  );

  const expiredContracts = contracts.filter(
    (item) => normalize(item.status) === "expired"
  );

  const expiringSoonContracts = contracts.filter((item) => {
    const days = daysUntil(item.end_date);
    return days !== null && days >= 0 && days <= 30;
  });

  const totalContractValue = contracts.reduce(
    (sum, contract) =>
      sum + Number(contract.value || 0),
    0
  );

  const pendingApprovals = approvals.filter(
    (approval) =>
      normalize(approval.decision) === "pending"
  );

  const completedMilestones = milestones.filter(
    (item) => normalize(item.status) === "completed"
  );

  const inProgressMilestones = milestones.filter(
    (item) => normalize(item.status) === "in progress"
  );

  const notStartedMilestones = milestones.filter(
    (item) => normalize(item.status) === "not started"
  );

  const overdueMilestones = milestones.filter((item) => {
    const days = daysUntil(item.due_date);
    return (
      days !== null &&
      days < 0 &&
      normalize(item.status) !== "completed"
    );
  });

  const paidPayments = payments.filter(
    (payment) =>
      normalize(payment.status) === "paid"
  );

  const pendingPayments = payments.filter(
    (payment) =>
      normalize(payment.status) === "pending"
  );

  const overduePayments = payments.filter((payment) => {
    const days = daysUntil(payment.due_date);

    return (
      days !== null &&
      days < 0 &&
      normalize(payment.status) !== "paid"
    );
  });

  const totalPaymentAmount = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const paidAmount = paidPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const overdueAmount = overduePayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const statusBreakdown = [
    {
      label: "Draft",
      value: contracts.filter(
        (item) => normalize(item.status) === "draft"
      ).length,
    },
    {
      label: "Pending Approval",
      value: contracts.filter((item) =>
        ["pending", "pending approval"].includes(
          normalize(item.status)
        )
      ).length,
    },
    {
      label: "Active",
      value: activeContracts.length,
    },
    {
      label: "Completed",
      value: contracts.filter(
        (item) => normalize(item.status) === "completed"
      ).length,
    },
    {
      label: "Expired",
      value: expiredContracts.length,
    },
    {
      label: "Terminated",
      value: contracts.filter(
        (item) =>
          normalize(item.status) === "terminated"
      ).length,
    },
  ];

  const milestoneBreakdown = [
    {
      label: "Completed",
      value: completedMilestones.length,
    },
    {
      label: "In Progress",
      value: inProgressMilestones.length,
    },
    {
      label: "Not Started",
      value: notStartedMilestones.length,
    },
    {
      label: "Overdue",
      value: overdueMilestones.length,
    },
  ];

  const averageMilestoneProgress = milestones.length
    ? Math.round(
        milestones.reduce(
          (sum, item) =>
            sum + Number(item.progress || 0),
          0
        ) / milestones.length
      )
    : 0;

  const contractTypes = [
    ...new Set(
      contracts.map(getContractType).filter(Boolean)
    ),
  ].sort();

  const parties = [
    ...new Set(
      contracts.map(getParty).filter(Boolean)
    ),
  ].sort();

  const handleKpiClick = (type) => {
    setExpandedKpi(type);

    if (type === "active") {
      setStatusFilter("Active");
      setActiveSection("contracts");
    } else if (type === "expired") {
      setStatusFilter("Expired");
      setActiveSection("contracts");
    } else if (type === "expiring") {
      setStatusFilter("All");
      setActiveSection("expiring");
    } else if (type === "approvals") {
      setActiveSection("approvals");
    } else if (type === "milestones") {
      setActiveSection("milestones");
    } else if (type === "overdue-milestones") {
      setActiveSection("milestones");
    } else if (type === "payments") {
      setActiveSection("payments");
    } else if (type === "overdue-payments") {
      setActiveSection("payments");
    } else {
      setStatusFilter("All");
      setActiveSection("contracts");
    }

    window.setTimeout(() => {
      document
        .getElementById("report-detail-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPartyFilter("All");
    setReportDateFrom("");
    setReportDateTo("");
    setExpandedKpi(null);
  };

  const exportCsv = () => {
    const rows = filteredContracts.map((contract) => [
      contract.contract_no || "",
      contract.title || "",
      getContractType(contract),
      getParty(contract),
      contract.status || "",
      contract.start_date || "",
      contract.end_date || "",
      contract.value ?? "",
    ]);

    const header = [
      "Contract No.",
      "Title",
      "Contract Type",
      "Party",
      "Status",
      "Start Date",
      "End Date",
      "Value",
    ];

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ARGO-contract-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">
            Loading reports...
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-10">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              ARGO Contract Management
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Contract, milestone, approval, and payment performance reports.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => loadReports(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <BiRefresh
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <BiFile size={18} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={printReport}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <BiBarChartAlt2 size={18} />
              Print / PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <button
            type="button"
            onClick={() => handleKpiClick("contracts")}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Contracts
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {number(contracts.length)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              All contract records
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("active")}
            className="rounded-xl border border-green-200 bg-green-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
              Active Contracts
            </p>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {number(activeContracts.length)}
            </p>
            <p className="mt-1 text-xs text-green-600">
              Click to filter active
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("expiring")}
            className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700">
              Expiring Soon
            </p>
            <p className="mt-2 text-2xl font-bold text-yellow-700">
              {number(expiringSoonContracts.length)}
            </p>
            <p className="mt-1 text-xs text-yellow-700">
              Within 30 days
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("expired")}
            className="rounded-xl border border-red-200 bg-red-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
              Expired Contracts
            </p>
            <p className="mt-2 text-2xl font-bold text-red-700">
              {number(expiredContracts.length)}
            </p>
            <p className="mt-1 text-xs text-red-600">
              Click to filter expired
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("value")}
            className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Contract Value
            </p>
            <p className="mt-2 text-xl font-bold text-blue-700">
              {money(totalContractValue)}
            </p>
            <p className="mt-1 text-xs text-blue-600">
              Total portfolio value
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <button
            type="button"
            onClick={() => handleKpiClick("approvals")}
            className="rounded-xl border border-purple-200 bg-purple-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
              Pending Approvals
            </p>
            <p className="mt-2 text-2xl font-bold text-purple-700">
              {number(pendingApprovals.length)}
            </p>
            <p className="mt-1 text-xs text-purple-600">
              Click to view
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("milestones")}
            className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Milestones
            </p>
            <p className="mt-2 text-2xl font-bold text-indigo-700">
              {number(milestones.length)}
            </p>
            <p className="mt-1 text-xs text-indigo-600">
              Avg. progress {averageMilestoneProgress}%
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("overdue-milestones")}
            className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              Overdue Milestones
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-700">
              {number(overdueMilestones.length)}
            </p>
            <p className="mt-1 text-xs text-orange-600">
              Not completed and past due
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("payments")}
            className="rounded-xl border border-cyan-200 bg-cyan-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
              Total Payments
            </p>
            <p className="mt-2 text-xl font-bold text-cyan-700">
              {money(totalPaymentAmount)}
            </p>
            <p className="mt-1 text-xs text-cyan-600">
              Payment records: {number(payments.length)}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleKpiClick("overdue-payments")}
            className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              Overdue Payments
            </p>
            <p className="mt-2 text-xl font-bold text-rose-700">
              {money(overdueAmount)}
            </p>
            <p className="mt-1 text-xs text-rose-600">
              Past due amount
            </p>
          </button>
        </div>

        {/* FILTERS */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Search
              </label>

              <div className="relative">
                <BiSearch
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Contract no., title, type, party..."
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="w-full lg:w-44">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option>All</option>
                <option>Draft</option>
                <option>Pending</option>
                <option>Active</option>
                <option>Completed</option>
                <option>Expired</option>
                <option>Terminated</option>
              </select>
            </div>

            <div className="w-full lg:w-44">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Contract Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option>All</option>
                {contractTypes.map((type) => (
                  <option key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-44">
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Party
              </label>

              <select
                value={partyFilter}
                onChange={(e) =>
                  setPartyFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option>All</option>
                {parties.map((party) => (
                  <option key={party}>
                    {party}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Date From
              </label>

              <input
                type="date"
                value={reportDateFrom}
                onChange={(e) =>
                  setReportDateFrom(e.target.value)
                }
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                Date To
              </label>

              <input
                type="date"
                value={reportDateTo}
                onChange={(e) =>
                  setReportDateTo(e.target.value)
                }
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <BiFilter size={18} />
              Clear Filters
            </button>
          </div>
        </section>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-slate-800">
                Contract Status
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Click a status to filter contracts.
              </p>
            </div>

            <div className="space-y-3">
              {statusBreakdown.map((item) => {
                const percentage = contracts.length
                  ? Math.round(
                      (item.value /
                        contracts.length) *
                        100
                    )
                  : 0;

                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      setStatusFilter(
                        item.label ===
                          "Pending Approval"
                          ? "Pending"
                          : item.label
                      );
                      setActiveSection("contracts");
                      setExpandedKpi(item.label);
                    }}
                    className="w-full text-left"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">
                        {item.label}
                      </span>
                      <span className="font-semibold text-gray-600">
                        {item.value} ({percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-slate-800">
                Milestone Performance
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Current milestone completion distribution.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {milestoneBreakdown.map((item) => {
                const percentage = milestones.length
                  ? Math.round(
                      (item.value /
                        milestones.length) *
                        100
                    )
                  : 0;

                return (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      setActiveSection("milestones");
                      setExpandedKpi(item.label);
                    }}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <p className="text-xs font-medium text-gray-500">
                      {item.label}
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {item.value}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {percentage}% of milestones
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-gray-600">
                  Average Progress
                </span>
                <span className="font-bold text-blue-600">
                  {averageMilestoneProgress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${averageMilestoneProgress}%`,
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* PAYMENT SUMMARY */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="font-semibold text-slate-800">
              Payment Summary
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Click a payment category to view the detailed payment report.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <button
              type="button"
              onClick={() =>
                setActiveSection("payments")
              }
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:border-blue-300"
            >
              <p className="text-xs font-medium text-gray-500">
                Total
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {money(totalPaymentAmount)}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("payments")
              }
              className="rounded-xl border border-green-200 bg-green-50 p-4 text-left hover:border-green-300"
            >
              <p className="text-xs font-medium text-green-600">
                Paid
              </p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {money(paidAmount)}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("payments")
              }
              className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-left hover:border-yellow-300"
            >
              <p className="text-xs font-medium text-yellow-700">
                Pending
              </p>
              <p className="mt-1 text-xl font-bold text-yellow-700">
                {money(pendingAmount)}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("payments")
              }
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-left hover:border-red-300"
            >
              <p className="text-xs font-medium text-red-600">
                Overdue
              </p>
              <p className="mt-1 text-xl font-bold text-red-700">
                {money(overdueAmount)}
              </p>
            </button>
          </div>
        </section>

        {/* DETAIL SECTION */}
        <section
          id="report-detail-section"
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 p-4 print:hidden">
            {[
              ["contracts", "Contracts"],
              ["milestones", "Milestones"],
              ["payments", "Payments"],
              ["approvals", "Approvals"],
              ["expiring", "Expiring Soon"],
            ].map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() =>
                  setActiveSection(key)
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeSection === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* CONTRACT REPORT */}
          {activeSection === "contracts" && (
            <div className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Contract Report
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {filteredContracts.length} matching contracts
                  </p>
                </div>

                {statusFilter !== "All" && (
                  <button
                    type="button"
                    onClick={() =>
                      setStatusFilter("All")
                    }
                    className="print:hidden inline-flex items-center gap-1 text-xs font-medium text-blue-600"
                  >
                    <BiXCircle />
                    Clear status
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[1050px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Contract No.
                      </th>
                      <th className="px-4 py-3">
                        Contract
                      </th>
                      <th className="px-4 py-3">
                        Type
                      </th>
                      <th className="px-4 py-3">
                        Party
                      </th>
                      <th className="px-4 py-3">
                        Start
                      </th>
                      <th className="px-4 py-3">
                        End
                      </th>
                      <th className="px-4 py-3">
                        Value
                      </th>
                      <th className="px-4 py-3">
                        Status
                      </th>
                      <th className="px-4 py-3 print:hidden">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredContracts.map(
                      (contract) => (
                        <tr
                          key={contract.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/contracts/${contract.id}`
                                )
                              }
                              className="font-semibold text-blue-600 hover:text-blue-800"
                            >
                              {contract.contract_no ||
                                "—"}
                            </button>
                          </td>

                          <td className="px-4 py-3 font-medium text-slate-800">
                            {contract.title || "—"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {getContractType(contract)}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {getParty(contract)}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(
                              contract.start_date
                            )}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(
                              contract.end_date
                            )}
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {money(contract.value)}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                contract.status
                              )}`}
                            >
                              {contract.status ||
                                "Unknown"}
                            </span>
                          </td>

                          <td className="px-4 py-3 print:hidden">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/contracts/${contract.id}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              <BiShow size={16} />
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    )}

                    {filteredContracts.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No contracts match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MILESTONES */}
          {activeSection === "milestones" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-800">
                  Milestone Performance Report
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredMilestones.length} milestones
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Milestone No.
                      </th>
                      <th className="px-4 py-3">
                        Milestone
                      </th>
                      <th className="px-4 py-3">
                        Contract
                      </th>
                      <th className="px-4 py-3">
                        Due Date
                      </th>
                      <th className="px-4 py-3">
                        Progress
                      </th>
                      <th className="px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMilestones.map(
                      (milestone) => (
                        <tr
                          key={milestone.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-semibold text-blue-600">
                            {milestone.milestone_no ||
                              "—"}
                          </td>

                          <td className="px-4 py-3 font-medium text-slate-800">
                            {milestone.title || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                milestone.contract_id &&
                                navigate(
                                  `/contracts/${milestone.contract_id}`
                                )
                              }
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              {milestone.contract_no ||
                                milestone.contract_title ||
                                "—"}
                            </button>
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(
                              milestone.due_date
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="w-32">
                              <div className="mb-1 flex justify-between text-xs">
                                <span className="text-gray-500">
                                  Progress
                                </span>
                                <span className="font-semibold text-gray-700">
                                  {Number(
                                    milestone.progress || 0
                                  )}
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width: `${Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        Number(
                                          milestone.progress ||
                                            0
                                        )
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                milestone.status
                              )}`}
                            >
                              {milestone.status ||
                                "Unknown"}
                            </span>
                          </td>
                        </tr>
                      )
                    )}

                    {filteredMilestones.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No milestones found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeSection === "payments" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-800">
                  Payment Report
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {payments.length} payment records
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[950px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Payment No.
                      </th>
                      <th className="px-4 py-3">
                        Contract
                      </th>
                      <th className="px-4 py-3">
                        Type
                      </th>
                      <th className="px-4 py-3">
                        Amount
                      </th>
                      <th className="px-4 py-3">
                        Payment Date
                      </th>
                      <th className="px-4 py-3">
                        Due Date
                      </th>
                      <th className="px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-semibold text-blue-600">
                          {payment.payment_no ||
                            "—"}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              payment.contract_id &&
                              navigate(
                                `/contracts/${payment.contract_id}`
                              )
                            }
                            className="text-left font-medium text-blue-600 hover:text-blue-800"
                          >
                            {payment.contract_no ||
                              payment.contract_title ||
                              "—"}
                          </button>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {payment.payment_type ||
                            "—"}
                        </td>

                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {money(payment.amount)}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(
                            payment.payment_date
                          )}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(
                            payment.due_date
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                              payment.status
                            )}`}
                          >
                            {payment.status ||
                              "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {payments.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No payment records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* APPROVALS */}
          {activeSection === "approvals" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-800">
                  Approval Report
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Pending approvals: {pendingApprovals.length}
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Type
                      </th>
                      <th className="px-4 py-3">
                        Contract
                      </th>
                      <th className="px-4 py-3">
                        Approver
                      </th>
                      <th className="px-4 py-3">
                        Decision
                      </th>
                      <th className="px-4 py-3">
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {approvals.map((approval) => (
                      <tr
                        key={approval.id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {approval.approval_type ||
                            "Contract"}
                        </td>

<td className="px-4 py-3">
  {approval.contract_id ||
  approval.renewal_contract_id ? (
    <button
      type="button"
      onClick={() =>
        navigate(
          `/contracts/${
            approval.contract_id ||
            approval.renewal_contract_id
          }`
        )
      }
      className="font-medium text-blue-600 hover:text-blue-800"
    >
      {approval.contract_no ||
        approval.contract_title ||
        "View Contract"}
    </button>
  ) : (
    <span className="text-gray-500">
      {approval.amendment_no ||
        "—"}
    </span>
  )}
</td>
                        <td className="px-4 py-3 text-gray-600">
                          {approval.approver_name ||
                            "—"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                              approval.decision
                            )}`}
                          >
                            {approval.decision ||
                              "Unknown"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(
                            approval.created_at
                          )}
                        </td>
                      </tr>
                    ))}

                    {approvals.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No approval records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXPIRING */}
          {activeSection === "expiring" && (
            <div className="p-5">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-800">
                  Contracts Expiring Soon
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Contracts ending within the next 90 days.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">
                        Contract
                      </th>
                      <th className="px-4 py-3">
                        End Date
                      </th>
                      <th className="px-4 py-3">
                        Days Remaining
                      </th>
                      <th className="px-4 py-3">
                        Value
                      </th>
                      <th className="px-4 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {expiringContracts.map(
                      (contract) => (
                        <tr
                          key={contract.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/contracts/${contract.id}`
                                )
                              }
                              className="text-left"
                            >
                              <p className="font-semibold text-blue-600 hover:text-blue-800">
                                {contract.contract_no ||
                                  "—"}
                              </p>

                              <p className="text-xs text-gray-500">
                                {contract.title ||
                                  "—"}
                              </p>
                            </button>
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(
                              contract.end_date
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`font-bold ${
                                contract.days_remaining <=
                                30
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {contract.days_remaining}{" "}
                              days
                            </span>
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {money(contract.value)}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                contract.status
                              )}`}
                            >
                              {contract.status ||
                                "Active"}
                            </span>
                          </td>
                        </tr>
                      )
                    )}

                    {expiringContracts.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-12 text-center text-sm text-gray-500"
                        >
                          No contracts are expiring within 90 days.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* FOOTER NOTE */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 print:hidden">
          <BiCheckCircle
            size={20}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="text-sm font-semibold text-blue-800">
              Report data is live
            </p>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              Reports are calculated from the current contract,
              milestone, approval, and payment records returned by
              the ARGO API. Use Refresh after making changes in
              another module.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Reports;