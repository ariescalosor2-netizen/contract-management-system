import {
  BiWallet,
  BiCheckCircle,
  BiTime,
  BiErrorCircle,
} from "react-icons/bi";

function PaymentCards({
  totalAmount = 0,
  paidAmount = 0,
  pendingAmount = 0,
  overdueAmount = 0,
  loading = false,
  activeCard = "all",
  onCardClick,
}) {
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString(
      "en-PH",
      {
        style: "currency",
        currency: "PHP",
      }
    );
  };

  const getPercentage = (amount) => {
    const total = Number(totalAmount) || 0;

    if (total === 0) {
      return "0.00%";
    }

    return `${(
      (Number(amount || 0) / total) *
      100
    ).toFixed(2)}%`;
  };

  const cards = [
    {
      id: "all",
      title: "Total Payments",
      value: formatCurrency(totalAmount),
      subtitle: "All payments",
      icon: <BiWallet />,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      id: "paid",
      title: "Paid Amount",
      value: formatCurrency(paidAmount),
      subtitle: `${getPercentage(
        paidAmount
      )} of total`,
      icon: <BiCheckCircle />,
      bg: "bg-green-100",
      color: "text-green-600",
    },
    {
      id: "pending",
      title: "Pending Amount",
      value: formatCurrency(pendingAmount),
      subtitle: `${getPercentage(
        pendingAmount
      )} of total`,
      icon: <BiTime />,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      id: "overdue",
      title: "Overdue Amount",
      value: formatCurrency(overdueAmount),
      subtitle: `${getPercentage(
        overdueAmount
      )} of total`,
      icon: <BiErrorCircle />,
      bg: "bg-red-100",
      color: "text-red-600",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isActive =
          activeCard === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() =>
              onCardClick?.(card.id)
            }
            className={`
              rounded-xl
              border
              bg-white
              p-6
              text-left
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              ${
                isActive
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <div
                className={`
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-3xl
                  ${card.bg}
                  ${card.color}
                `}
              >
                {card.icon}
              </div>

              <div className="min-w-0">
                <p className="text-sm text-gray-500">
                  {card.title}
                </p>

                <h2 className="mt-1 truncate text-2xl font-bold text-slate-800">
                  {loading
                    ? "—"
                    : card.value}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {loading
                    ? "Loading..."
                    : card.subtitle}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default PaymentCards;