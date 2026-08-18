import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BiPlus,
  BiWallet,
  BiX,
} from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import PaymentCards from "../components/payments/PaymentCards";
import PaymentSearchFilters from "../components/payments/PaymentSearchFilters";
import PaymentsTable from "../components/payments/PaymentsTable";

import {
  getPayments,
  createPayment,
  deletePayment,
  submitPaymentForVerification,
  confirmPayment,
  rejectPayment,
} from "../services/paymentService";

import {
  getContracts,
} from "../services/contractService";


function Payments() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [payments, setPayments] = useState([]);

  const [contracts, setContracts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingContracts, setLoadingContracts] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [processingPaymentId, setProcessingPaymentId] =
    useState(null);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [
    paymentTypeFilter,
    setPaymentTypeFilter,
  ] = useState("All Payment Types");

  const [
    contractFilter,
    setContractFilter,
  ] = useState("All Contracts");

  const [activeCard, setActiveCard] =
    useState("all");

  const [showNewPayment, setShowNewPayment] =
    useState(false);

  const [showViewPayment, setShowViewPayment] =
    useState(false);

  const [selectedPayment, setSelectedPayment] =
    useState(null);

  const [formError, setFormError] =
    useState("");


  // ==========================================================
  // NEW PAYMENT FORM
  // ==========================================================

  const emptyForm = {
    contract_id: "",
    payment_type: "Advance Payment",
    amount: "",
    payment_date: "",
    due_date: "",
    reference_no: "",
    remarks: "",
  };

  const [formData, setFormData] =
    useState(emptyForm);


  // ==========================================================
  // LOAD PAYMENTS
  // ==========================================================

  const loadPayments = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await getPayments();

      const data =
        response?.data ??
        response?.items ??
        response ??
        [];

      setPayments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load payments:",
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
          "You do not have permission to access payments."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load payments."
        );
      }

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // LOAD APPROVED CONTRACTS
  // ==========================================================

  const loadApprovedContracts = async () => {

    try {

      setLoadingContracts(true);

      const response = await getContracts();

      const data =
        response?.data ??
        response?.items ??
        response ??
        [];

      const approved =
        Array.isArray(data)
          ? data.filter(
              (contract) =>
                String(
                  contract.status || ""
                ).toLowerCase() ===
                "approved"
            )
          : [];

      setContracts(approved);

    } catch (err) {

      console.error(
        "Failed to load approved contracts:",
        err
      );

      setFormError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to load approved contracts."
      );

    } finally {

      setLoadingContracts(false);

    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadPayments();

  }, []);


  // ==========================================================
  // OPEN NEW PAYMENT
  // ==========================================================

  const openNewPayment = async () => {

    setFormError("");

    setFormData({
      ...emptyForm,

      payment_date:
        new Date()
          .toISOString()
          .slice(0, 10),
    });

    setShowNewPayment(true);

    await loadApprovedContracts();
  };


  // ==========================================================
  // CLOSE NEW PAYMENT
  // ==========================================================

  const closeNewPayment = () => {

    if (saving) {
      return;
    }

    setShowNewPayment(false);

    setFormError("");

    setFormData(emptyForm);
  };


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setFormError("");
  };


  // ==========================================================
  // SELECTED CONTRACT
  // ==========================================================

  const selectedContract =
    useMemo(() => {

      return contracts.find(
        (contract) =>
          String(contract.id) ===
          String(formData.contract_id)
      );

    }, [
      contracts,
      formData.contract_id,
    ]);


  // ==========================================================
  // CREATE PAYMENT
  // ==========================================================

  const handleCreatePayment =
    async (e) => {

      e.preventDefault();

      setFormError("");


      // ------------------------------------------------------
      // VALIDATION
      // ------------------------------------------------------

      if (!formData.contract_id) {

        setFormError(
          "Please select an approved contract."
        );

        return;
      }


      if (!formData.payment_type) {

        setFormError(
          "Please select a payment type."
        );

        return;
      }


      if (
        formData.amount === "" ||
        Number(formData.amount) <= 0
      ) {

        setFormError(
          "Please enter a valid payment amount."
        );

        return;
      }


      if (
        formData.payment_date &&
        formData.due_date &&
        formData.payment_date >
          formData.due_date
      ) {

        setFormError(
          "Payment date cannot be later than the due date."
        );

        return;
      }


      try {

        setSaving(true);


        // --------------------------------------------------
        // PAYMENT NUMBER
        // --------------------------------------------------
        // DO NOT SEND payment_no.
        // Backend automatically generates it.
        // --------------------------------------------------

        const payload = {

          contract_id:
            formData.contract_id,

          payment_type:
            formData.payment_type,

          amount:
            Number(formData.amount),

          payment_date:
            formData.payment_date ||
            null,

          due_date:
            formData.due_date ||
            null,

          reference_no:
            formData.reference_no
              .trim() ||
            null,

          remarks:
            formData.remarks
              .trim() ||
            null,
        };


        await createPayment(payload);


        setShowNewPayment(false);

        setFormData(emptyForm);

        await loadPayments();

      } catch (err) {

        console.error(
          "Failed to create payment:",
          err
        );

        setFormError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create payment."
        );

      } finally {

        setSaving(false);

      }
    };


  // ==========================================================
  // CONTRACT OPTIONS FOR FILTER
  // ==========================================================

  const contractOptions =
    useMemo(() => {

      const contracts =
        payments
          .map(
            (payment) =>
              payment.contract_no ||
              payment.contractNo
          )
          .filter(Boolean);

      return [
        ...new Set(contracts),
      ];

    }, [payments]);


  // ==========================================================
  // FILTER PAYMENTS
  // ==========================================================

  const filteredPayments =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return payments.filter(
        (payment) => {

          const paymentNo =
            String(
              payment.payment_no ||
              payment.paymentNo ||
              ""
            ).toLowerCase();


          const contractNo =
            String(
              payment.contract_no ||
              payment.contractNo ||
              ""
            ).toLowerCase();


          const payee =
            String(
              payment.payee ||
              ""
            ).toLowerCase();


          const paymentType =
            String(
              payment.payment_type ||
              payment.paymentType ||
              ""
            ).toLowerCase();


          const status =
            String(
              payment.status ||
              ""
            );


          const matchesSearch =
            !search ||
            paymentNo.includes(search) ||
            contractNo.includes(search) ||
            payee.includes(search) ||
            paymentType.includes(search);


          const matchesStatus =
            statusFilter === "All Status" ||
            status === statusFilter;


          const matchesPaymentType =
            paymentTypeFilter ===
              "All Payment Types" ||
            paymentType ===
              paymentTypeFilter;


          const paymentContract =
            payment.contract_no ||
            payment.contractNo ||
            "";


          const matchesContract =
            contractFilter === "All Contracts" ||
            paymentContract === contractFilter;


          return (
            matchesSearch &&
            matchesStatus &&
            matchesPaymentType &&
            matchesContract
          );
        }
      );

    }, [
      payments,
      searchTerm,
      statusFilter,
      paymentTypeFilter,
      contractFilter,
    ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics =
    useMemo(() => {

      let total = 0;
      let paid = 0;
      let pending = 0;
      let overdue = 0;


      payments.forEach(
        (payment) => {

          const amount =
            Number(payment.amount) || 0;


          const status =
            String(
              payment.status || ""
            ).toLowerCase();


          total += amount;


          if (status === "paid") {

            paid += amount;

          }


          if (
            status === "pending" ||
            status === "for review"
          ) {

            pending += amount;

          }


          if (status === "overdue") {

            overdue += amount;

          }

        }
      );


      return {
        total,
        paid,
        pending,
        overdue,
      };

    }, [payments]);


  // ==========================================================
  // CARD CLICK
  // ==========================================================

  const handleCardClick = (card) => {

    setActiveCard(card);


    if (card === "all") {

      setStatusFilter("All Status");

      return;
    }


    if (card === "paid") {

      setStatusFilter("Paid");

      return;
    }


    if (card === "pending") {

      setStatusFilter("Pending");

      return;
    }


    if (card === "overdue") {

      setStatusFilter("Overdue");
    }
  };


  // ==========================================================
  // STATUS FILTER
  // ==========================================================

  const handleStatusChange =
    (status) => {

      setStatusFilter(status);


      if (status === "All Status") {

        setActiveCard("all");

      } else if (status === "Paid") {

        setActiveCard("paid");

      } else if (
        status === "Pending" ||
        status === "For Review"
      ) {

        setActiveCard("pending");

      } else if (status === "Overdue") {

        setActiveCard("overdue");

      } else {

        setActiveCard("all");
      }
    };


  // ==========================================================
  // VIEW PAYMENT
  // ==========================================================

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setShowViewPayment(true);
  };

  const closeViewPayment = () => {
    setShowViewPayment(false);
    setSelectedPayment(null);
  };

  const formatPaymentDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPaymentStatusClasses = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (
      normalized === "pending" ||
      normalized === "for review"
    ) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalized === "rejected") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };


  // ==========================================================
  // EDIT PAYMENT
  // ==========================================================

  const handleEdit = (payment) => {

    if (payment.status !== "Pending") {

      alert(
        "Only Pending payments can be edited."
      );

      return;
    }


    alert(
      "Payment editing will be added after the create/payment workflow is verified."
    );
  };


  // ==========================================================
  // DELETE PAYMENT
  // ==========================================================

  const handleDelete =
    async (payment) => {

      const paymentNo =
        payment.payment_no ||
        payment.paymentNo ||
        "this payment";


      if (payment.status !== "Pending") {

        alert(
          "Only Pending payments can be deleted."
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${paymentNo}?`
        );


      if (!confirmed) {
        return;
      }


      try {

        await deletePayment(
          payment.id
        );


        setPayments(
          (currentPayments) =>
            currentPayments.filter(
              (item) =>
                item.id !== payment.id
            )
        );

      } catch (err) {

        console.error(
          "Failed to delete payment:",
          err
        );


        alert(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete payment."
        );
      }
    };


  // ==========================================================
  // SUBMIT PAYMENT FOR VERIFICATION
  // ==========================================================
  //
  // FIXED:
  //
  // paymentService expects:
  //
  // submitPaymentForVerification(
  //     paymentId,
  //     referenceNo,
  //     remarks
  // )
  //
  // NOT:
  //
  // submitPaymentForVerification(
  //     paymentId,
  //     { reference_no, remarks }
  // )
  //
  // ==========================================================

  const handleSubmitForVerification =
    async (payment) => {

      if (payment.status !== "Pending") {

        return;
      }


      const confirmed =
        window.confirm(
          `Submit ${payment.payment_no} for verification?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setProcessingPaymentId(
          payment.id
        );


        await submitPaymentForVerification(
          payment.id,
          payment.reference_no || null,
          payment.remarks || null
        );


        await loadPayments();

      } catch (err) {

        console.error(
          "Failed to submit payment:",
          err
        );


        alert(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to submit payment for verification."
        );

      } finally {

        setProcessingPaymentId(
          null
        );
      }
    };


  // ==========================================================
  // CONFIRM PAYMENT
  // ==========================================================
  //
  // For Review → Paid
  //
  // FIXED:
  //
  // confirmPayment(
  //     paymentId,
  //     remarks
  // )
  //
  // ==========================================================

  const handleConfirmReceived =
    async (payment) => {

      if (payment.status !== "For Review") {

        return;
      }


      const confirmed =
        window.confirm(
          `Confirm that ${payment.payment_no} has been received?`
        );


      if (!confirmed) {
        return;
      }


      try {

        setProcessingPaymentId(
          payment.id
        );


        await confirmPayment(
          payment.id,
          "Payment confirmed by administrator."
        );


        await loadPayments();

      } catch (err) {

        console.error(
          "Failed to confirm payment:",
          err
        );


        alert(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to confirm payment."
        );

      } finally {

        setProcessingPaymentId(
          null
        );
      }
    };


  // ==========================================================
  // REJECT PAYMENT
  // ==========================================================
  //
  // For Review → Rejected
  //
  // FIXED:
  //
  // rejectPayment(
  //     paymentId,
  //     remarks
  // )
  //
  // ==========================================================

  const handleReject =
    async (payment) => {

      if (payment.status !== "For Review") {

        return;
      }


      const remarks =
        window.prompt(
          "Enter the reason for rejecting this payment:"
        );


      if (
        !remarks ||
        !remarks.trim()
      ) {

        return;
      }


      try {

        setProcessingPaymentId(
          payment.id
        );


        await rejectPayment(
          payment.id,
          remarks.trim()
        );


        await loadPayments();

      } catch (err) {

        console.error(
          "Failed to reject payment:",
          err
        );


        alert(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to reject payment."
        );

      } finally {

        setProcessingPaymentId(
          null
        );
      }
    };


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearchTerm("");

    setStatusFilter(
      "All Status"
    );

    setPaymentTypeFilter(
      "All Payment Types"
    );

    setContractFilter(
      "All Contracts"
    );

    setActiveCard("all");
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <MainLayout>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-slate-800">
            Payments
          </h1>

          <p className="mt-1 text-gray-500">
            Track and manage payments for approved contracts.
          </p>

        </div>


        <button
          type="button"
          onClick={openNewPayment}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-blue-600
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-blue-700
          "
        >

          <BiPlus size={20} />

          New Payment

        </button>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="
          mb-6
          rounded-xl
          border
          border-red-200
          bg-red-50
          px-4
          py-3
        ">

          <div className="
            flex
            items-center
            justify-between
            gap-4
          ">

            <p className="text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadPayments}
              className="
                text-sm
                font-semibold
                text-red-700
                underline
              "
            >
              Retry
            </button>

          </div>

        </div>
      )}


      {/* ======================================================
          CARDS
      ====================================================== */}

      <PaymentCards
        totalAmount={statistics.total}
        paidAmount={statistics.paid}
        pendingAmount={statistics.pending}
        overdueAmount={statistics.overdue}
        loading={loading}
        activeCard={activeCard}
        onCardClick={handleCardClick}
      />


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <PaymentSearchFilters

        searchTerm={searchTerm}

        onSearchChange={
          setSearchTerm
        }

        statusFilter={statusFilter}

        onStatusChange={
          handleStatusChange
        }

        paymentTypeFilter={
          paymentTypeFilter
        }

        onPaymentTypeChange={
          setPaymentTypeFilter
        }

        contractFilter={
          contractFilter
        }

        onContractChange={
          setContractFilter
        }

        contractOptions={
          contractOptions
        }

        onClear={
          clearFilters
        }

      />


      {/* ======================================================
          TABLE
      ====================================================== */}

      <PaymentsTable

        payments={
          filteredPayments
        }

        loading={
          loading
        }

        processingPaymentId={
          processingPaymentId
        }

        onView={
          handleView
        }

        onEdit={
          handleEdit
        }

        onDelete={
          handleDelete
        }

        onSubmitForVerification={
          handleSubmitForVerification
        }

        onConfirmReceived={
          handleConfirmReceived
        }

        onReject={
          handleReject
        }

      />


      {/* ======================================================
          VIEW PAYMENT MODAL
      ====================================================== */}

      {showViewPayment && selectedPayment && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40 p-4
          "
          onClick={closeViewPayment}
        >
          <div
            className="
              max-h-[90vh] w-full max-w-2xl
              overflow-y-auto rounded-2xl
              bg-white shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="
              flex items-center justify-between
              border-b px-6 py-5
            ">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Payment Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review payment information and transaction details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeViewPayment}
                className="
                  rounded-lg p-2 text-gray-400
                  hover:bg-gray-100 hover:text-gray-700
                "
                aria-label="Close"
              >
                <BiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="
                mb-6 rounded-xl border border-blue-100
                bg-blue-50 p-4
              ">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="
                      text-xs font-semibold uppercase
                      tracking-wide text-blue-600
                    ">
                      Payment Number
                    </p>
                    <p className="
                      mt-1 text-lg font-bold text-slate-800
                    ">
                      {selectedPayment.payment_no ||
                        selectedPayment.paymentNo ||
                        "—"}
                    </p>
                  </div>

                  <span className={`
                    inline-flex rounded-full px-3 py-1.5
                    text-sm font-semibold
                    ${getPaymentStatusClasses(selectedPayment.status)}
                  `}>
                    {selectedPayment.status || "—"}
                  </span>
                </div>
              </div>

              <div className="
                grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2
              ">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Contract No.
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedPayment.contract_no ||
                      selectedPayment.contractNo ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Contract Title
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedPayment.contract_title ||
                      selectedPayment.contractTitle ||
                      selectedPayment.title ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Payee
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedPayment.payee || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Payment Type
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedPayment.payment_type ||
                      selectedPayment.paymentType ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Amount
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-800">
                    ₱{Number(selectedPayment.amount || 0).toLocaleString(
                      "en-PH",
                      { minimumFractionDigits: 2 }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Payment Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatPaymentDate(
                      selectedPayment.payment_date ||
                        selectedPayment.paymentDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Due Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatPaymentDate(
                      selectedPayment.due_date ||
                        selectedPayment.dueDate
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Reference Number
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedPayment.reference_no ||
                      selectedPayment.referenceNo ||
                      "—"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Remarks
                </p>
                <div className="
                  mt-2 min-h-[90px] rounded-xl
                  border border-gray-200 bg-gray-50
                  px-4 py-3 text-sm leading-6 text-gray-700
                ">
                  {selectedPayment.remarks || "No remarks provided."}
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={closeViewPayment}
                className="
                  rounded-lg border border-gray-300
                  px-5 py-2.5 font-medium text-gray-700
                  hover:bg-gray-50
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          NEW PAYMENT MODAL
      ====================================================== */}

      {showNewPayment && (

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
            max-w-2xl
            overflow-y-auto
            rounded-2xl
            bg-white
            shadow-2xl
          ">

            {/* HEADER */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              px-6
              py-5
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-slate-800
                ">
                  New Payment
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Create a payment for an approved contract.
                </p>

              </div>


              <button
                type="button"
                onClick={closeNewPayment}
                disabled={saving}
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                "
              >

                <BiX size={24} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleCreatePayment
              }
              className="p-6"
            >

              {formError && (

                <div className="
                  mb-5
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                ">
                  {formError}
                </div>

              )}


              {/* INFO */}

              <div className="
                mb-6
                rounded-xl
                border
                border-blue-200
                bg-blue-50
                p-4
              ">

                <div className="
                  flex
                  gap-3
                ">

                  <div className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-100
                    text-blue-600
                  ">

                    <BiWallet size={22} />

                  </div>


                  <div>

                    <p className="
                      text-sm
                      font-semibold
                      text-blue-800
                    ">
                      Approved contracts only
                    </p>

                    <p className="
                      mt-1
                      text-xs
                      leading-5
                      text-blue-700
                    ">
                      Payment Number will be automatically generated by the system.
                    </p>

                  </div>

                </div>

              </div>


              <div className="space-y-5">

                {/* CONTRACT */}

                <div>

                  <label className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Approved Contract

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <select
                    name="contract_id"
                    value={
                      formData.contract_id
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving ||
                      loadingContracts
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  >

                    <option value="">

                      {loadingContracts
                        ? "Loading approved contracts..."
                        : contracts.length
                        ? "Select approved contract"
                        : "No approved contracts available"}

                    </option>


                    {contracts.map(
                      (contract) => (

                        <option
                          key={contract.id}
                          value={contract.id}
                        >

                          {contract.contract_no}

                          {" — "}

                          {contract.title}

                        </option>

                      )
                    )}

                  </select>


                  {selectedContract && (

                    <div className="
                      mt-2
                      rounded-lg
                      bg-gray-50
                      px-3
                      py-2
                      text-xs
                      text-gray-600
                    ">

                      Contract Value:

                      {" "}

                      <strong>

                        ₱
                        {Number(
                          selectedContract.value ||
                          0
                        ).toLocaleString(
                          "en-PH",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}

                      </strong>

                    </div>

                  )}

                </div>


                {/* PAYMENT NUMBER */}

                <div>

                  <label className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  ">
                    Payment Number
                  </label>


                  <div className="
                    flex
                    items-center
                    justify-between
                    rounded-lg
                    border
                    border-gray-300
                    bg-gray-100
                    px-4
                    py-3
                  ">

                    <span className="
                      text-sm
                      font-medium
                      text-gray-500
                    ">
                      Auto-generated
                    </span>

                    <span className="
                      text-xs
                      font-semibold
                      text-blue-600
                    ">
                      AUTO
                    </span>

                  </div>


                  <p className="
                    mt-1
                    text-xs
                    text-gray-500
                  ">
                    Example: PAY-2026-0001
                  </p>

                </div>


                {/* PAYMENT TYPE */}

                <div>

                  <label className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Payment Type

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <select
                    name="payment_type"
                    value={
                      formData.payment_type
                    }
                    onChange={
                      handleFormChange
                    }
                    disabled={
                      saving
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-4
                      py-3
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
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


                {/* AMOUNT */}

                <div>

                  <label className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  ">

                    Amount

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>


                  <input
                    type="number"
                    name="amount"
                    value={
                      formData.amount
                    }
                    onChange={
                      handleFormChange
                    }
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    disabled={
                      saving
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-3
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                </div>


                {/* DATES */}

                <div className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                ">

                  <div>

                    <label className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    ">
                      Payment Date
                    </label>


                    <input
                      type="date"
                      name="payment_date"
                      value={
                        formData.payment_date
                      }
                      onChange={
                        handleFormChange
                      }
                      disabled={
                        saving
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-4
                        py-3
                        outline-none
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>


                  <div>

                    <label className="
                      mb-2
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    ">
                      Due Date
                    </label>


                    <input
                      type="date"
                      name="due_date"
                      value={
                        formData.due_date
                      }
                      onChange={
                        handleFormChange
                      }
                      disabled={
                        saving
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-300
                        px-4
                        py-3
                        outline-none
                        focus:border-blue-500
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>

                </div>


                {/* REFERENCE */}

                <div>

                  <label className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  ">
                    Reference Number
                  </label>


                  <input
                    type="text"
                    name="reference_no"
                    value={
                      formData.reference_no
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Optional payment/reference number"
                    disabled={
                      saving
                    }
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-3
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                </div>


                {/* REMARKS */}

                <div>

                  <label className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  ">
                    Remarks
                  </label>


                  <textarea
                    name="remarks"
                    value={
                      formData.remarks
                    }
                    onChange={
                      handleFormChange
                    }
                    rows={3}
                    placeholder="Optional remarks..."
                    disabled={
                      saving
                    }
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-gray-300
                      px-4
                      py-3
                      outline-none
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                    "
                  />

                </div>

              </div>


              {/* FOOTER */}

              <div className="
                mt-6
                flex
                justify-end
                gap-3
                border-t
                pt-5
              ">

                <button
                  type="button"
                  onClick={closeNewPayment}
                  disabled={saving}
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    px-5
                    py-3
                    font-medium
                    text-gray-700
                    hover:bg-gray-50
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingContracts ||
                    contracts.length === 0
                  }
                  className="
                    rounded-lg
                    bg-blue-600
                    px-5
                    py-3
                    font-medium
                    text-white
                    hover:bg-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {saving
                    ? "Creating..."
                    : "Create Payment"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </MainLayout>
  );
}


export default Payments;