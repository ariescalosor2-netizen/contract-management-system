import {
  BiRefresh,
  BiCheckCircle,
  BiTime,
  BiXCircle,
} from "react-icons/bi";


function RenewalCards({
  renewals = [],
  activeCard,
  onCardClick,
}) {

  const total =
    renewals.length;

  const active =
    renewals.filter(
      (renewal) =>
        renewal.status ===
        "Active"
    ).length;

  const dueSoon =
    renewals.filter(
      (renewal) =>
        renewal.status
          ?.toLowerCase()
          .includes("due")
    ).length;

  const expired =
    renewals.filter(
      (renewal) =>
        renewal.status ===
        "Expired"
    ).length;


  const percentage = (
    value
  ) => {

    if (!total) {
      return "0.00%";
    }

    return `${(
      (value / total) *
      100
    ).toFixed(2)}% of total`;

  };


  const cards = [

    {
      key: "All",

      title:
        "Total Renewals",

      value: total,

      subtitle:
        "All time",

      icon:
        <BiRefresh />,

      bg:
        "bg-blue-100",

      color:
        "text-blue-600",
    },

    {
      key: "Active",

      title:
        "Active Renewals",

      value: active,

      subtitle:
        percentage(active),

      icon:
        <BiCheckCircle />,

      bg:
        "bg-green-100",

      color:
        "text-green-600",
    },

    {
      key: "Due Soon",

      title:
        "Due for Renewal (30 Days)",

      value: dueSoon,

      subtitle:
        percentage(dueSoon),

      icon:
        <BiTime />,

      bg:
        "bg-yellow-100",

      color:
        "text-yellow-600",
    },

    {
      key: "Expired",

      title:
        "Expired",

      value: expired,

      subtitle:
        percentage(expired),

      icon:
        <BiXCircle />,

      bg:
        "bg-red-100",

      color:
        "text-red-600",
    },

  ];


  return (

    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card) => (

        <button
          key={card.key}
          type="button"
          onClick={() =>
            onCardClick(
              card.key
            )
          }
          className={`rounded-xl border bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
            activeCard === card.key
              ? "border-blue-400 ring-2 ring-blue-100"
              : "border-gray-200"
          }`}
        >

          <div className="flex items-center gap-4">

            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl ${card.bg} ${card.color}`}
            >
              {card.icon}
            </div>

            <div className="min-w-0">

              <p className="text-sm text-gray-500">
                {card.title}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {card.value}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                {card.subtitle}
              </p>

            </div>

          </div>

        </button>

      ))}

    </div>

  );
}


export default RenewalCards;