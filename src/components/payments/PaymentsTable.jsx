import {
  BiCheckCircle,
  BiEdit,
  BiShow,
  BiLoaderAlt,
  BiTrash,
  BiXCircle,
} from "react-icons/bi";


function PaymentsTable({
  payments = [],
  loading = false,
  processingPaymentId = null,

  onView,
  onEdit,
  onDelete,

  onSubmitForVerification,
  onConfirmReceived,
  onReject,
}) {

  /*
  |--------------------------------------------------------------------------
  | FORMAT MONEY
  |--------------------------------------------------------------------------
  */

  const formatMoney = (value) => {
    return `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };


  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
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

    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };


  /*
  |--------------------------------------------------------------------------
  | STATUS CLASS
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (status) => {
    switch (String(status || "").trim()) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "For Review":
        return "bg-blue-100 text-blue-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Overdue":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12">
        <div className="flex flex-col items-center justify-center">

          <BiLoaderAlt
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading payments...
          </p>

        </div>
      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | EMPTY
  |--------------------------------------------------------------------------
  */

  if (!payments.length) {
    return (
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-12">

        <div className="text-center">

          <p className="text-base font-semibold text-gray-700">
            No payments found
          </p>

          <p className="mt-1 text-sm text-gray-500">
            There are no payment records matching your current filters.
          </p>

        </div>

      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | TABLE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* =========================================================
          DESKTOP TABLE
      ========================================================= */}

      <div className="hidden overflow-x-auto md:block">

        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-gray-50">

            <tr>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Payment
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contract
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Type
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Amount
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-gray-100">

            {payments.map((payment) => {

              const status =
                String(
                  payment.status || ""
                ).trim();

              const isProcessing =
                processingPaymentId === payment.id;


              return (
                <tr
                  key={payment.id}
                  className="transition hover:bg-gray-50"
                >

                  {/* =================================================
                      PAYMENT
                  ================================================= */}

                  <td className="px-5 py-4">

                    <p className="font-semibold text-gray-800">
                      {payment.payment_no || "—"}
                    </p>


                    {payment.reference_no && (
                      <p className="mt-1 text-xs text-gray-500">
                        Ref: {payment.reference_no}
                      </p>
                    )}

                  </td>


                  {/* =================================================
                      CONTRACT
                  ================================================= */}

                  <td className="px-5 py-4">

                    <p className="font-medium text-gray-700">
                      {payment.contract_no || "—"}
                    </p>


                    {payment.contract_title && (
                      <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                        {payment.contract_title}
                      </p>
                    )}

                  </td>


                  {/* =================================================
                      TYPE
                  ================================================= */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {payment.payment_type || "—"}
                  </td>


                  {/* =================================================
                      AMOUNT
                  ================================================= */}

                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-gray-800">
                    {formatMoney(payment.amount)}
                  </td>


                  {/* =================================================
                      DATE
                  ================================================= */}

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {formatDate(payment.payment_date)}
                  </td>


                  {/* =================================================
                      STATUS
                  ================================================= */}

                  <td className="px-5 py-4">

                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        ${getStatusClass(status)}
                      `}
                    >
                      {status || "Unknown"}
                    </span>

                  </td>


                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <td className="px-5 py-4">

                    <div className="flex flex-wrap items-center justify-end gap-2">

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          onView?.(payment)
                        }
                        title="View payment"
                        className="
                          inline-flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-gray-200
                          text-gray-600
                          hover:bg-gray-50
                        "
                      >
                        <BiShow size={18} />
                      </button>


                      {/* EDIT */}

                      {status === "Pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            onEdit?.(payment)
                          }
                          title="Edit payment"
                          className="
                            inline-flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-gray-200
                            text-gray-600
                            hover:bg-gray-50
                          "
                        >
                          <BiEdit size={18} />
                        </button>
                      )}


                      {/* DELETE */}

                      {status === "Pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete?.(payment)
                          }
                          title="Delete payment"
                          className="
                            inline-flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            border
                            border-red-200
                            text-red-500
                            hover:bg-red-50
                          "
                        >
                          <BiTrash size={18} />
                        </button>
                      )}


                      {/* =================================================
                          PENDING → FOR REVIEW
                      ================================================= */}

                      {status === "Pending" && (
                        <button
                          type="button"
                          onClick={() =>
                            onSubmitForVerification?.(payment)
                          }
                          disabled={isProcessing}
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            bg-blue-600
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            hover:bg-blue-700
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >

                          {isProcessing ? (
                            <BiLoaderAlt
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <BiCheckCircle size={15} />
                          )}

                          {isProcessing
                            ? "Submitting..."
                            : "Submit"}

                        </button>
                      )}


                      {/* =================================================
                          FOR REVIEW → PAID / REJECTED
                      ================================================= */}

                      {status === "For Review" && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              onConfirmReceived?.(payment)
                            }
                            disabled={isProcessing}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              bg-green-600
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-white
                              hover:bg-green-700
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >

                            {isProcessing ? (
                              <BiLoaderAlt
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <BiCheckCircle size={15} />
                            )}

                            {isProcessing
                              ? "Processing..."
                              : "Confirm"}

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              onReject?.(payment)
                            }
                            disabled={isProcessing}
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              bg-red-600
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-white
                              hover:bg-red-700
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >

                            <BiXCircle size={15} />

                            Reject

                          </button>
                        </>
                      )}


                      {/* PAID */}

                      {status === "Paid" && (
                        <span className="
                          px-2
                          text-xs
                          font-medium
                          text-green-600
                        ">
                          Completed
                        </span>
                      )}


                      {/* REJECTED */}

                      {status === "Rejected" && (
                        <span className="
                          px-2
                          text-xs
                          font-medium
                          text-red-600
                        ">
                          Rejected
                        </span>
                      )}

                    </div>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>


      {/* =========================================================
          MOBILE TABLE
      ========================================================= */}

      <div className="space-y-4 p-4 md:hidden">

        {payments.map((payment) => {

          const status =
            String(
              payment.status || ""
            ).trim();

          const isProcessing =
            processingPaymentId === payment.id;


          return (
            <div
              key={payment.id}
              className="rounded-xl border border-gray-200 p-4"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <p className="font-semibold text-gray-800">
                    {payment.payment_no || "—"}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {payment.contract_no || "No contract"}
                  </p>

                </div>


                <span
                  className={`
                    inline-flex
                    shrink-0
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    ${getStatusClass(status)}
                  `}
                >
                  {status}
                </span>

              </div>


              <div className="mt-4 grid grid-cols-2 gap-3">

                <div>

                  <p className="text-xs text-gray-500">
                    Amount
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {formatMoney(payment.amount)}
                  </p>

                </div>


                <div>

                  <p className="text-xs text-gray-500">
                    Payment Date
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatDate(payment.payment_date)}
                  </p>

                </div>

              </div>


              <div className="mt-4 flex flex-wrap gap-2">

                {/* VIEW */}

                <button
                  type="button"
                  onClick={() =>
                    onView?.(payment)
                  }
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-gray-200
                    px-3
                    py-2
                    text-xs
                    font-medium
                    text-gray-700
                  "
                >
                  <BiShow size={16} />
                  View
                </button>


                {/* EDIT */}

                {status === "Pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      onEdit?.(payment)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-gray-200
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-gray-700
                    "
                  >
                    <BiEdit size={16} />
                    Edit
                  </button>
                )}


                {/* DELETE */}

                {status === "Pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      onDelete?.(payment)
                    }
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      border
                      border-red-200
                      px-3
                      py-2
                      text-xs
                      font-medium
                      text-red-600
                    "
                  >
                    <BiTrash size={16} />
                    Delete
                  </button>
                )}


                {/* SUBMIT */}

                {status === "Pending" && (
                  <button
                    type="button"
                    onClick={() =>
                      onSubmitForVerification?.(payment)
                    }
                    disabled={isProcessing}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-blue-600
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-white
                      disabled:opacity-50
                    "
                  >

                    {isProcessing ? (
                      <BiLoaderAlt
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <BiCheckCircle size={15} />
                    )}

                    {isProcessing
                      ? "Submitting..."
                      : "Submit"}

                  </button>
                )}


                {/* CONFIRM */}

                {status === "For Review" && (
                  <button
                    type="button"
                    onClick={() =>
                      onConfirmReceived?.(payment)
                    }
                    disabled={isProcessing}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-green-600
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-white
                      disabled:opacity-50
                    "
                  >

                    {isProcessing ? (
                      <BiLoaderAlt
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <BiCheckCircle size={15} />
                    )}

                    Confirm

                  </button>
                )}


                {/* REJECT */}

                {status === "For Review" && (
                  <button
                    type="button"
                    onClick={() =>
                      onReject?.(payment)
                    }
                    disabled={isProcessing}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-red-600
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-white
                      disabled:opacity-50
                    "
                  >

                    <BiXCircle size={15} />

                    Reject

                  </button>
                )}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}


export default PaymentsTable;