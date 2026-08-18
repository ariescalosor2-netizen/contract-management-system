import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BiArrowBack,
  BiCheckCircle,
  BiErrorCircle,
  BiWallet,
} from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";
import {
  getPayment,
  submitDemoPayment,
} from "../services/paymentService";

function DemoPayment() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!paymentId) {
      setError("Payment ID is missing.");
      setLoading(false);
      return;
    }

    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPayment(paymentId);
      setPayment(response?.data || null);
    } catch (err) {
      console.error("Failed to load payment:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load payment."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePay = async () => {
    try {
      setPaying(true);
      setError("");

      const response = await submitDemoPayment(
        paymentId,
        referenceNo || null,
        remarks || null
      );

      setPayment(response?.data || payment);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit demo payment:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to submit payment."
      );
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">
              Loading payment...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !payment) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
          >
            <BiArrowBack />
            Back
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!payment) {
    return null;
  }

  const canPay = payment.status === "Pending";

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
        >
          <BiArrowBack />
          Back
        </button>

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            ARGO Demo Payment
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-800">
            Payment Request
          </h1>

          <p className="mt-1 text-gray-500">
            This is a simulated payment page for demonstration purposes.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success || payment.status === "For Verification" ? (
          <div className="rounded-2xl border border-blue-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-4xl text-blue-600">
              <BiCheckCircle />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-800">
              Payment Submitted
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-gray-500">
              Your demo payment has been submitted successfully.
              The receiver must verify the payment before it becomes
              <strong> Paid</strong>.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl bg-gray-50 p-5 text-left">
              <div className="flex justify-between border-b py-3">
                <span className="text-gray-500">Payment No.</span>
                <span className="font-semibold">
                  {payment.payment_no}
                </span>
              </div>

              <div className="flex justify-between border-b py-3">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-blue-600">
                  {formatMoney(payment.amount)}
                </span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-gray-500">Status</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  For Verification
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/payments")}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Go to Payments
            </button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl text-blue-600">
                    <BiWallet />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Demo Payment
                    </h2>
                    <p className="text-sm text-gray-500">
                      Simulated bank payment
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-xl bg-slate-50 p-6 text-center">
                  <p className="text-sm text-gray-500">
                    Amount to Pay
                  </p>

                  <p className="mt-2 text-4xl font-bold text-slate-800">
                    {formatMoney(payment.amount)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Demo Reference No.{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) =>
                        setReferenceNo(e.target.value)
                      }
                      placeholder="e.g. BANK-DEMO-001"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Remarks{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      value={remarks}
                      onChange={(e) =>
                        setRemarks(e.target.value)
                      }
                      rows={3}
                      placeholder="Add payment remarks..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={!canPay || paying}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paying
                      ? "Processing Demo Payment..."
                      : "Simulate Payment"}
                  </button>
                </div>

                <div className="mt-5 flex gap-3 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                  <BiErrorCircle className="mt-0.5 shrink-0 text-lg" />
                  <p>
                    This is only a demo payment. No real money or bank
                    transaction will occur.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-800">
                  Payment Details
                </h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Payment No.
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {payment.payment_no}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Payment Type
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {payment.payment_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Due Date
                    </p>
                    <p className="mt-1 font-semibold text-slate-700">
                      {formatDate(payment.due_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Current Status
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default DemoPayment;