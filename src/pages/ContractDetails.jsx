import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  BiArrowBack,
  BiFile,
  BiCheckCircle,
  BiWallet,
  BiFlag,
  BiEdit,
  BiRefresh,
  BiPlus,
  BiTrash,
} from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import { getContract, updateContract } from "../services/contractService";
import { getContractTypes } from "../services/contractTypeService";
import { getParties } from "../services/partyService";
import { getContractApprovals } from "../services/approvalService";
import { getContractAmendments } from "../services/amendmentService";
import api from "../services/api";

import {
  getContractPayments,
  createPayment,
  deletePayment,
} from "../services/paymentService";


function ContractDetails() {
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [payments, setPayments] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [amendments, setAmendments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [renewalsLoading, setRenewalsLoading] = useState(false);
  const [amendmentsLoading, setAmendmentsLoading] = useState(false);

  const [approvalsError, setApprovalsError] = useState("");
  const [milestonesError, setMilestonesError] = useState("");
  const [renewalsError, setRenewalsError] = useState("");
  const [amendmentsError, setAmendmentsError] = useState("");

  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  const [paymentForm, setPaymentForm] = useState({
    payment_no: "",
    payment_type: "Advance Payment",
    amount: "",
    payment_date: "",
    due_date: "",
    reference_no: "",
    remarks: "",
  });


  // ============================================================
  // LOAD CONTRACT
  // ============================================================

  useEffect(() => {
    if (!contractId) {
      setError("Contract ID is missing.");
      setLoading(false);
      return;
    }

    loadContract();
  }, [contractId]);


  const loadContract = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getContract(contractId);

      setContract(response?.data || null);
    } catch (error) {
      console.error(
        "Failed to load contract:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load contract."
      );
    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // LOAD CONTRACT PAYMENTS
  // ============================================================

  const loadPayments = async () => {
    if (!contractId) {
      return;
    }

    try {
      setPaymentsLoading(true);
      setPaymentError("");

      const response =
        await getContractPayments(contractId);

      const data = response?.data || [];

      setPayments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load payments:",
        error
      );

      setPaymentError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load payments."
      );
    } finally {
      setPaymentsLoading(false);
    }
  };


  useEffect(() => {
    if (
      activeTab === "payments" &&
      contractId
    ) {
      loadPayments();
    }
  }, [activeTab, contractId]);


  // ============================================================
  // LOAD CONTRACT APPROVALS
  // ============================================================

  const loadApprovals = async () => {
    if (!contractId) {
      return;
    }

    try {
      setApprovalsLoading(true);
      setApprovalsError("");

      const response = await getContractApprovals(contractId);
      const data = response?.data ?? response ?? [];

      setApprovals(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load contract approvals:",
        error
      );

      setApprovals([]);
      setApprovalsError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load contract approvals."
      );
    } finally {
      setApprovalsLoading(false);
    }
  };


  // ============================================================
  // LOAD CONTRACT MILESTONES
  // ============================================================

  const loadMilestones = async () => {
    if (!contractId) {
      return;
    }

    try {
      setMilestonesLoading(true);
      setMilestonesError("");

      const response = await api.get(
        `/milestones/contract/${contractId}`
      );

      const data = response?.data?.data ??
        response?.data ??
        response ??
        [];

      setMilestones(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load contract milestones:",
        error
      );

      setMilestones([]);
      setMilestonesError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load contract milestones."
      );
    } finally {
      setMilestonesLoading(false);
    }
  };


  // ============================================================
  // LOAD CONTRACT RENEWALS
  // ============================================================
  //
  // The current backend exposes GET /renewals/ for renewals.
  // We retrieve the organization's renewals and keep only the
  // records belonging to this contract.
  // ============================================================

  const loadRenewals = async () => {
    if (!contractId) {
      return;
    }

    try {
      setRenewalsLoading(true);
      setRenewalsError("");

      const response = await api.get("/renewals/");
      const data = response?.data?.data ??
        response?.data ??
        response ??
        [];

      const rows = Array.isArray(data) ? data : [];

      setRenewals(
        rows.filter(
          (renewal) =>
            String(renewal.contract_id) ===
            String(contractId)
        )
      );
    } catch (error) {
      console.error(
        "Failed to load contract renewals:",
        error
      );

      setRenewals([]);
      setRenewalsError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load contract renewals."
      );
    } finally {
      setRenewalsLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === "approvals" && contractId) {
      loadApprovals();
    }
  }, [activeTab, contractId]);


  useEffect(() => {
    if (activeTab === "milestones" && contractId) {
      loadMilestones();
    }
  }, [activeTab, contractId]);


  useEffect(() => {
    if (activeTab === "renewals" && contractId) {
      loadRenewals();
    }
  }, [activeTab, contractId]);


  // ============================================================
  // LOAD CONTRACT AMENDMENTS
  // ============================================================

  const loadAmendments = async () => {
    if (!contractId) {
      return;
    }

    try {
      setAmendmentsLoading(true);
      setAmendmentsError("");

      const response = await getContractAmendments(contractId);
      const data = response?.data ?? response ?? [];

      setAmendments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load amendments:",
        error
      );

      setAmendments([]);
      setAmendmentsError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load amendments."
      );
    } finally {
      setAmendmentsLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeTab === "amendments" &&
      contractId
    ) {
      loadAmendments();
    }
  }, [activeTab, contractId]);


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };


  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "₱0.00";
    }

    return `₱${Number(value).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };


  // ============================================================
  // CONTRACT STATUS
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Draft":
        return "bg-blue-100 text-blue-700";

      case "Pending":
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-700";

      case "Approved":
        return "bg-emerald-100 text-emerald-700";

      case "Active":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Expired":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  // ============================================================
  // PAYMENT STATUS
  // ============================================================

  const getPaymentStatus = (payment) => {
    /*
     * Paid is always Paid.
     */
    if (payment.status === "Paid") {
      return "Paid";
    }

    /*
     * For Review remains For Review.
     */
    if (payment.status === "For Review") {
      return "For Review";
    }

    /*
     * If backend already says Overdue,
     * respect it.
     */
    if (payment.status === "Overdue") {
      return "Overdue";
    }

    /*
     * Pending payment becomes Overdue
     * when the due date has passed.
     */
    if (payment.due_date) {
      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const dueDate = new Date(
        payment.due_date
      );

      dueDate.setHours(
        0,
        0,
        0,
        0
      );

      if (dueDate < today) {
        return "Overdue";
      }
    }

    return "Pending";
  };


  // ============================================================
  // PAYMENT STATUS CLASS
  // ============================================================

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "For Review":
        return "bg-blue-100 text-blue-700";

      case "Overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  // ============================================================
  // NORMALIZE PAYMENTS
  // ============================================================

  const normalizedPayments = useMemo(() => {
    return payments.map((payment) => ({
      ...payment,
      computedStatus:
        getPaymentStatus(payment),
    }));
  }, [payments]);


  // ============================================================
  // PAYMENT TOTALS
  // ============================================================

  const totalPayments =
    normalizedPayments.reduce(
      (total, payment) =>
        total +
        Number(payment.amount || 0),
      0
    );


  const paidAmount =
    normalizedPayments
      .filter(
        (payment) =>
          payment.computedStatus ===
          "Paid"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      );


  const pendingAmount =
    normalizedPayments
      .filter(
        (payment) =>
          payment.computedStatus ===
          "Pending"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      );


  const overdueAmount =
    normalizedPayments
      .filter(
        (payment) =>
          payment.computedStatus ===
          "Overdue"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0
      );


  // ============================================================
  // TABS
  // ============================================================

  const tabs = [
    {
      key: "overview",
      label: "Overview",
      icon: <BiFile size={18} />,
    },
    {
      key: "approvals",
      label: "Approvals",
      icon: <BiCheckCircle size={18} />,
    },
    {
      key: "payments",
      label: "Payments",
      icon: <BiWallet size={18} />,
    },
    {
      key: "milestones",
      label: "Milestones",
      icon: <BiFlag size={18} />,
    },
    {
      key: "amendments",
      label: "Amendments",
      icon: <BiEdit size={18} />,
    },
    {
      key: "renewals",
      label: "Renewals",
      icon: <BiRefresh size={18} />,
    },
  ];


  // ============================================================
  // PAYMENT FORM CHANGE
  // ============================================================

  const handlePaymentChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }));
  };


  // ============================================================
  // OPEN PAYMENT FORM
  // ============================================================

  const openPaymentForm = () => {
    setPaymentError("");

    setPaymentForm({
      payment_no: "",
      payment_type: "Advance Payment",
      amount: "",
      payment_date: "",
      due_date: "",
      reference_no: "",
      remarks: "",
    });

    setShowPaymentForm(true);
  };


  // ============================================================
  // CREATE PAYMENT
  // ============================================================

  const handleCreatePayment = async (event) => {
    event.preventDefault();

    if (!contractId) {
      setPaymentError(
        "Contract ID is missing."
      );
      return;
    }

    if (
      !paymentForm.payment_no.trim()
    ) {
      setPaymentError(
        "Payment number is required."
      );
      return;
    }

    if (
      !paymentForm.amount ||
      Number(paymentForm.amount) < 0
    ) {
      setPaymentError(
        "Enter a valid payment amount."
      );
      return;
    }

    try {
      setSavingPayment(true);
      setPaymentError("");

      /*
       * IMPORTANT:
       *
       * No status is sent here.
       *
       * Backend automatically creates
       * every new payment as Pending.
       */

      const payload = {
        contract_id: contractId,

        payment_no:
          paymentForm.payment_no.trim(),

        payment_type:
          paymentForm.payment_type,

        amount:
          Number(paymentForm.amount),

        payment_date:
          paymentForm.payment_date ||
          null,

        due_date:
          paymentForm.due_date ||
          null,

        reference_no:
          paymentForm.reference_no.trim() ||
          null,

        remarks:
          paymentForm.remarks.trim() ||
          null,
      };

      await createPayment(payload);

      setShowPaymentForm(false);

      setPaymentForm({
        payment_no: "",
        payment_type: "Advance Payment",
        amount: "",
        payment_date: "",
        due_date: "",
        reference_no: "",
        remarks: "",
      });

      await loadPayments();

    } catch (error) {
      console.error(
        "Failed to create payment:",
        error
      );

      setPaymentError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to create payment."
      );
    } finally {
      setSavingPayment(false);
    }
  };


  // ============================================================
  // PAYMENT ACTIONS
  // ============================================================

  // Payment approval is intentionally NOT handled here.
  // ContractDetails only creates payment requests.
  // Receiving/confirming a payment happens on the Payments page.

  // ============================================================
  // DELETE PAYMENT
  // ============================================================

  const handleDeletePayment = async (payment) => {
    if (!payment?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${payment.payment_no}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingPaymentId(
        payment.id
      );

      setPaymentError("");

      await deletePayment(payment.id);

      await loadPayments();

    } catch (error) {
      console.error(
        "Failed to delete payment:",
        error
      );

      setPaymentError(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete payment."
      );
    } finally {
      setProcessingPaymentId(null);
    }
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <MainLayout>
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-gray-500">
            Loading contract...
          </p>

        </div>
      </MainLayout>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error || !contract) {
    return (
      <MainLayout>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">

          <p className="font-medium text-red-700">
            {error ||
              "Contract not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/contracts")
            }
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Contracts
          </button>

        </div>

      </MainLayout>
    );
  }


  // ============================================================
  // MAIN
  // ============================================================

  return (
    <MainLayout>

      <div className="space-y-6">

        {/* ======================================================
            BACK BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/contracts")
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          <BiArrowBack size={20} />

          Back to Contracts
        </button>


        {/* ======================================================
            CONTRACT HEADER
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-5 border-b px-6 py-6 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold text-slate-800">
                  {contract.contract_no}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    contract.status
                  )}`}
                >
                  {contract.status}
                </span>

              </div>

              <p className="mt-2 text-lg font-medium text-gray-700">
                {contract.title || "-"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {contract.party_name || "-"}
              </p>

            </div>


            {contract.status === "Draft" && (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <BiEdit size={19} />

                Edit Contract
              </button>
            )}

          </div>


          {/* QUICK INFO */}

          <div className="grid grid-cols-1 divide-y md:grid-cols-4 md:divide-x md:divide-y-0">

            <div className="p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Contract Type
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {contract.contract_type_name ||
                  "-"}
              </p>

            </div>


            <div className="p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Contract Value
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatValue(
                  contract.value
                )}
              </p>

            </div>


            <div className="p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Start Date
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatDate(
                  contract.start_date
                )}
              </p>

            </div>


            <div className="p-5">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                End Date
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {formatDate(
                  contract.end_date
                )}
              </p>

            </div>

          </div>


          {/* TABS */}

          <div className="overflow-x-auto border-t">

            <div className="flex min-w-max">

              {tabs.map((tab) => (

                <button
                  key={tab.key}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.key)
                  }
                  className={`inline-flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.icon}

                  {tab.label}
                </button>

              ))}

            </div>

          </div>

        </div>


        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">


          {/* ====================================================
              OVERVIEW
          ==================================================== */}

          {activeTab === "overview" && (

            <div className="space-y-6">

              <div>

                <h2 className="text-lg font-semibold text-slate-800">
                  Contract Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  General information about this contract.
                </p>

              </div>


              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="rounded-xl border border-gray-200 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Contract Number
                  </p>

                  <p className="mt-2 font-semibold text-gray-800">
                    {contract.contract_no}
                  </p>

                </div>


                <div className="rounded-xl border border-gray-200 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Party
                  </p>

                  <p className="mt-2 font-semibold text-gray-800">
                    {contract.party_name ||
                      "-"}
                  </p>

                </div>


                <div className="rounded-xl border border-gray-200 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Contract Type
                  </p>

                  <p className="mt-2 font-semibold text-gray-800">
                    {contract.contract_type_name ||
                      "-"}
                  </p>

                </div>


                <div className="rounded-xl border border-gray-200 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Contract Value
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-800">
                    {formatValue(
                      contract.value
                    )}
                  </p>

                </div>

              </div>


              <div>

                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Contract Period
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                    <p className="text-xs text-gray-400">
                      Start Date
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatDate(
                        contract.start_date
                      )}
                    </p>

                  </div>


                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                    <p className="text-xs text-gray-400">
                      End Date
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {formatDate(
                        contract.end_date
                      )}
                    </p>

                  </div>

                </div>

              </div>


              <div>

                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  Description
                </h3>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                    {contract.description ||
                      "No description provided."}
                  </p>

                </div>

              </div>

            </div>
          )}


          {/* ====================================================
              APPROVALS
          ==================================================== */}

          {activeTab === "approvals" && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Contract Approvals
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Approval records for {contract.contract_no}.
              </p>

              {approvalsError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {approvalsError}
                </div>
              )}

              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                {approvalsLoading ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="text-sm text-gray-500">Loading approvals...</p>
                  </div>
                ) : approvals.length === 0 ? (
                  <div className="p-10 text-center">
                    <BiCheckCircle size={40} className="mx-auto text-gray-300" />
                    <p className="mt-3 font-medium text-gray-600">
                      No approval records for this contract
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b bg-gray-50">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="px-5 py-4">Approval Type</th>
                        <th className="px-5 py-4">Decision</th>
                        <th className="px-5 py-4">Approver</th>
                        <th className="px-5 py-4">Submitted</th>
                        <th className="px-5 py-4">Approved At</th>
                        <th className="px-5 py-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvals.map((approval) => (
                        <tr key={approval.id} className="border-b last:border-none hover:bg-gray-50">
                          <td className="px-5 py-4 font-medium text-gray-800">
                            {approval.approval_type || "Contract"}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(approval.decision)}`}>
                              {approval.decision || "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-700">
                            {approval.approver_name || "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(approval.created_at)}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(approval.approved_at)}
                          </td>
                          <td className="max-w-[280px] px-5 py-4 text-gray-600">
                            {approval.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}


          {/* ====================================================
              PAYMENTS
          ==================================================== */}

          {activeTab === "payments" && (

            <div className="space-y-6">

              {/* HEADER */}

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-lg font-semibold text-slate-800">
                    Contract Payments
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Payments belonging to{" "}
                    {contract.contract_no}.
                  </p>

                </div>

              </div>


              {/* ERROR */}

              {paymentError && (

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {paymentError}
                </div>

              )}


              {/* PAYMENT KDI */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Total Payments
                  </p>

                  <p className="mt-2 text-xl font-bold text-gray-800">
                    {formatValue(
                      totalPayments
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    All payment records
                  </p>

                </div>


                <div className="rounded-xl border border-green-200 bg-green-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                    Paid Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-green-700">
                    {formatValue(
                      paidAmount
                    )}
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    Confirmed payments
                  </p>

                </div>


                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-yellow-600">
                    Pending Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-yellow-700">
                    {formatValue(
                      pendingAmount
                    )}
                  </p>

                  <p className="mt-1 text-xs text-yellow-600">
                    Awaiting payment
                  </p>

                </div>


                <div className="rounded-xl border border-red-200 bg-red-50 p-5">

                  <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                    Overdue Amount
                  </p>

                  <p className="mt-2 text-xl font-bold text-red-700">
                    {formatValue(
                      overdueAmount
                    )}
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    Past due date
                  </p>

                </div>

              </div>


              {/* PAYMENT TABLE */}

              <div className="overflow-x-auto rounded-xl border border-gray-200">

                {paymentsLoading ? (

                  <div className="p-10 text-center">

                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="text-sm text-gray-500">
                      Loading payments...
                    </p>

                  </div>

                ) : payments.length === 0 ? (

                  <div className="p-12 text-center">

                    <BiWallet
                      size={42}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-medium text-gray-600">
                      No payments yet
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Request a payment for this contract.
                    </p>

                  </div>

                ) : (

                  <table className="w-full min-w-[1000px]">

                    <thead className="border-b bg-gray-50">

                      <tr className="text-left text-sm text-gray-600">

                        <th className="px-5 py-4">
                          Payment No.
                        </th>

                        <th className="px-5 py-4">
                          Type
                        </th>

                        <th className="px-5 py-4">
                          Amount
                        </th>

                        <th className="px-5 py-4">
                          Payment Date
                        </th>

                        <th className="px-5 py-4">
                          Due Date
                        </th>

                        <th className="px-5 py-4">
                          Status
                        </th>

                        <th className="px-5 py-4 text-center">
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {normalizedPayments.map(
                        (payment) => (

                          <tr
                            key={payment.id}
                            className="border-b last:border-none hover:bg-gray-50"
                          >

                            <td className="px-5 py-4 font-medium text-blue-600">
                              {payment.payment_no}
                            </td>


                            <td className="px-5 py-4 text-gray-700">
                              {payment.payment_type}
                            </td>


                            <td className="px-5 py-4 font-semibold text-gray-800">
                              {formatValue(
                                payment.amount
                              )}
                            </td>


                            <td className="px-5 py-4 text-gray-600">
                              {formatDate(
                                payment.payment_date
                              )}
                            </td>


                            <td className="px-5 py-4 text-gray-600">
                              {formatDate(
                                payment.due_date
                              )}
                            </td>


                            <td className="px-5 py-4">

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusClass(
                                  payment.computedStatus
                                )}`}
                              >
                                {payment.computedStatus}
                              </span>

                            </td>


                            <td className="px-5 py-4">

                              <div className="flex items-center justify-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeletePayment(
                                      payment
                                    )
                                  }
                                  disabled={
                                    processingPaymentId ===
                                    payment.id
                                  }
                                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                                  title="Delete payment"
                                >
                                  <BiTrash
                                    size={18}
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                )}

              </div>

            </div>
          )}


          {/* ====================================================
              MILESTONES
          ==================================================== */}

          {activeTab === "milestones" && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Contract Milestones
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Milestones associated with this contract.
              </p>

              {milestonesError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {milestonesError}
                </div>
              )}

              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                {milestonesLoading ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="text-sm text-gray-500">Loading milestones...</p>
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="p-10 text-center">
                    <BiFlag size={40} className="mx-auto text-gray-300" />
                    <p className="mt-3 font-medium text-gray-600">
                      No milestones for this contract
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b bg-gray-50">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="px-5 py-4">Milestone No.</th>
                        <th className="px-5 py-4">Title</th>
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4">Due Date</th>
                        <th className="px-5 py-4">Progress</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {milestones.map((milestone) => (
                        <tr key={milestone.id} className="border-b last:border-none hover:bg-gray-50">
                          <td className="px-5 py-4 font-medium text-blue-600">
                            {milestone.milestone_no || "—"}
                          </td>
                          <td className="px-5 py-4 font-medium text-gray-800">
                            {milestone.title || "—"}
                          </td>
                          <td className="max-w-[300px] px-5 py-4 text-gray-600">
                            {milestone.description || "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(milestone.due_date)}
                          </td>
                          <td className="px-5 py-4 text-gray-700">
                            {milestone.progress ?? 0}%
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(milestone.status)}`}>
                              {milestone.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}


          {/* ====================================================
              AMENDMENTS
          ==================================================== */}

          {activeTab === "amendments" && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Contract Amendments
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Changes and amendments for this contract.
              </p>

              {amendmentsError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {amendmentsError}
                </div>
              )}

              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                {amendmentsLoading ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="text-sm text-gray-500">
                      Loading amendments...
                    </p>
                  </div>
                ) : amendments.length === 0 ? (
                  <div className="p-10 text-center">
                    <BiEdit
                      size={40}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 font-medium text-gray-600">
                      No amendments for this contract
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Approved and pending amendment requests will appear here.
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[1100px]">
                    <thead className="border-b bg-gray-50">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="px-5 py-4">Amendment No.</th>
                        <th className="px-5 py-4">Type</th>
                        <th className="px-5 py-4">Original Value</th>
                        <th className="px-5 py-4">Amended Value</th>
                        <th className="px-5 py-4">Original Start</th>
                        <th className="px-5 py-4">New Start</th>
                        <th className="px-5 py-4">Original End</th>
                        <th className="px-5 py-4">New End</th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {amendments.map((amendment) => (
                        <tr
                          key={amendment.id}
                          className="border-b last:border-none hover:bg-gray-50"
                        >
                          <td className="px-5 py-4 font-medium text-blue-600">
                            {amendment.amendment_no || "—"}
                          </td>

                          <td className="px-5 py-4 text-gray-700">
                            {amendment.amendment_type || "—"}
                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-800">
                            {formatValue(
                              amendment.original_value ??
                                amendment.original_contract_value
                            )}
                          </td>

                          <td className="px-5 py-4 font-semibold text-blue-700">
                            {formatValue(amendment.amended_value)}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(amendment.original_start_date)}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(amendment.new_start_date)}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(amendment.original_end_date)}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(amendment.new_end_date)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                amendment.status
                              )}`}
                            >
                              {amendment.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}


          {/* ====================================================
              RENEWALS
          ==================================================== */}

          {activeTab === "renewals" && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Contract Renewals
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Renewal records for this contract.
              </p>

              {renewalsError && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {renewalsError}
                </div>
              )}

              <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                {renewalsLoading ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                    <p className="text-sm text-gray-500">Loading renewals...</p>
                  </div>
                ) : renewals.length === 0 ? (
                  <div className="p-10 text-center">
                    <BiRefresh size={40} className="mx-auto text-gray-300" />
                    <p className="mt-3 font-medium text-gray-600">
                      No renewals for this contract
                    </p>
                  </div>
                ) : (
                  <table className="w-full min-w-[900px]">
                    <thead className="border-b bg-gray-50">
                      <tr className="text-left text-sm text-gray-600">
                        <th className="px-5 py-4">Renewal No.</th>
                        <th className="px-5 py-4">Renewal Type</th>
                        <th className="px-5 py-4">Current End</th>
                        <th className="px-5 py-4">New End</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renewals.map((renewal) => (
                        <tr key={renewal.id} className="border-b last:border-none hover:bg-gray-50">
                          <td className="px-5 py-4 font-medium text-blue-600">
                            {renewal.renewal_no || "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-700">
                            {renewal.renewal_type || "—"}
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(renewal.current_end_date)}
                          </td>
                          <td className="px-5 py-4 font-semibold text-blue-700">
                            {formatDate(renewal.new_end_date)}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(renewal.status)}`}>
                              {renewal.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600">
                            {formatDate(renewal.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>

      </div>



      {/* ========================================================
          EDIT CONTRACT MODAL
      ======================================================== */}

      {showEditModal && (
        <ContractEditModal
          contract={contract}
          onClose={() => setShowEditModal(false)}
          onSaved={async () => {
            setShowEditModal(false);
            await loadContract();
          }}
        />
      )}

      {/* ========================================================
          ADD PAYMENT MODAL
      ======================================================== */}

      {showPaymentForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-xl font-semibold text-gray-900">
                  Request Payment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add a payment for{" "}
                  <span className="font-medium text-gray-700">
                    {contract.contract_no}
                  </span>
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowPaymentForm(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleCreatePayment}
            >

              <div className="space-y-5 p-6">

                {/* CONTRACT */}

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

                  <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                    Contract
                  </p>

                  <p className="mt-1 font-semibold text-blue-800">
                    {contract.contract_no}
                  </p>

                  <p className="text-sm text-blue-700">
                    {contract.title}
                  </p>

                </div>


                {/* PAYMENT NUMBER */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment No.
                  </label>

                  <input
                    type="text"
                    name="payment_no"
                    value={
                      paymentForm.payment_no
                    }
                    onChange={
                      handlePaymentChange
                    }
                    placeholder="PAY-2026-001"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* PAYMENT TYPE + AMOUNT */}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Payment Type
                    </label>

                    <select
                      name="payment_type"
                      value={
                        paymentForm.payment_type
                      }
                      onChange={
                        handlePaymentChange
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >

                      <option>
                        Advance Payment
                      </option>

                      <option>
                        Progress Payment
                      </option>

                      <option>
                        Partial Payment
                      </option>

                      <option>
                        Final Payment
                      </option>

                    </select>

                  </div>


                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Amount
                    </label>

                    <input
                      type="number"
                      name="amount"
                      value={
                        paymentForm.amount
                      }
                      onChange={
                        handlePaymentChange
                      }
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* DUE DATE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="due_date"
                    value={
                      paymentForm.due_date
                    }
                    onChange={
                      handlePaymentChange
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* STATUS INFORMATION */}

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">

                  <div className="flex items-start gap-3">

                    <BiWallet
                      size={22}
                      className="mt-0.5 text-yellow-600"
                    />

                    <div>

                      <p className="text-sm font-semibold text-yellow-800">
                        Payment starts as Pending
                      </p>

                      <p className="mt-1 text-sm text-yellow-700">
                        You don't need to select a payment status. New payments are automatically created as{" "}
                        <strong>
                          Pending
                        </strong>
                        .
                      </p>

                    </div>

                  </div>

                </div>


                {/* REMARKS */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={
                      paymentForm.remarks
                    }
                    onChange={
                      handlePaymentChange
                    }
                    rows="3"
                    placeholder="Optional remarks..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>


              {/* MODAL FOOTER */}

              <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentForm(false)
                  }
                  disabled={savingPayment}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>


              </div>

            </form>

          </div>

        </div>

      )}

    </MainLayout>
  );
}

/*
|----------------------------------------------------------------------
| EDIT CONTRACT MODAL
|----------------------------------------------------------------------
| Only used by ContractDetails.
| It opens in-place and does not change the existing page/navigation.
|---------------------------------------------------------------------- 
*/

function ContractEditModal({
  contract,
  onClose,
  onSaved,
}) {
  const [contractTypes, setContractTypes] = useState([]);
  const [parties, setParties] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    contract_no: contract?.contract_no || "",
    title: contract?.title || "",
    contract_type_id: contract?.contract_type_id || "",
    party_id: contract?.party_id || "",
    status: contract?.status || "Draft",
    start_date: contract?.start_date
      ? String(contract.start_date).substring(0, 10)
      : "",
    end_date: contract?.end_date
      ? String(contract.end_date).substring(0, 10)
      : "",
    value:
      contract?.value !== null &&
      contract?.value !== undefined
        ? contract.value
        : "",
    description: contract?.description || "",
  });

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          typesResponse,
          partiesResponse,
        ] = await Promise.all([
          getContractTypes(),
          getParties(),
        ]);

        setContractTypes(
          typesResponse?.data || []
        );

        setParties(
          partiesResponse?.data || []
        );
      } catch (err) {
        console.error(
          "Failed to load contract edit data:",
          err
        );

        setError(
          "Failed to load contract types and parties."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadFormData();
  }, []);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError(
        "Contract title is required."
      );
      return;
    }

    if (!formData.contract_type_id) {
      setError(
        "Please select a contract type."
      );
      return;
    }

    if (!formData.party_id) {
      setError(
        "Please select a party."
      );
      return;
    }

    if (
      formData.start_date &&
      formData.end_date
    ) {
      const startDate = new Date(
        formData.start_date
      );

      const endDate = new Date(
        formData.end_date
      );

      if (startDate > endDate) {
        setError(
          "Start date must be before or equal to the end date."
        );
        return;
      }
    }

    if (
      formData.value === "" ||
      formData.value === null ||
      Number.isNaN(
        Number(formData.value)
      ) ||
      Number(formData.value) < 0
    ) {
      setError(
        "Contract value must be a valid amount."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        contract_no:
          formData.contract_no.trim(),

        title:
          formData.title.trim(),

        contract_type_id:
          String(
            formData.contract_type_id
          ),

        party_id:
          String(
            formData.party_id
          ),

        status:
          formData.status,

        start_date:
          formData.start_date,

        end_date:
          formData.end_date,

        value:
          Number(
            formData.value
          ),

        description:
          formData.description.trim(),
      };

      await updateContract(
        contract.id,
        payload
      );

      if (onSaved) {
        await onSaved();
      }
    } catch (err) {
      console.error(
        "Failed to save contract:",
        err
      );

      const responseData =
        err.response?.data;

      const detail =
        responseData?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item.msg ||
                "Validation error."
            )
            .join(", ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else if (
        responseData?.message
      ) {
        setError(
          responseData.message
        );
      } else {
        setError(
          "Failed to save contract."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Contract
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update contract information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-col"
        >
          <div className="space-y-4 overflow-y-auto px-6 py-5">

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* CONTRACT NO + TITLE */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Contract No.
                </label>

                <input
                  type="text"
                  name="contract_no"
                  value={
                    formData.contract_no
                  }
                  onChange={
                    handleChange
                  }
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3.5 py-2.5 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Contract Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    formData.title
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* TYPE + PARTY */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Contract Type
                </label>

                <select
                  name="contract_type_id"
                  value={
                    formData.contract_type_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    loadingData ||
                    saving
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingData
                      ? "Loading..."
                      : "Select contract type"}
                  </option>

                  {contractTypes
                    .filter(
                      (type) =>
                        type.status ===
                        "Active"
                    )
                    .map(
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

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Party
                </label>

                <select
                  name="party_id"
                  value={
                    formData.party_id
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    loadingData ||
                    saving
                  }
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingData
                      ? "Loading..."
                      : "Select party"}
                  </option>

                  {parties
                    .filter(
                      (party) =>
                        party.status ===
                        "Active"
                    )
                    .map(
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
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Status
              </label>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Pending Approval">
                  Pending Approval
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Expired">
                  Expired
                </option>
              </select>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Start Date
                </label>

                <input
                  type="date"
                  name="start_date"
                  value={
                    formData.start_date
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  End Date
                </label>

                <input
                  type="date"
                  name="end_date"
                  value={
                    formData.end_date
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* VALUE */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Contract Value
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  ₱
                </span>

                <input
                  type="number"
                  name="value"
                  value={
                    formData.value
                  }
                  onChange={
                    handleChange
                  }
                  required
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pl-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                disabled={saving}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3.5 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingData
              }
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContractDetails;
