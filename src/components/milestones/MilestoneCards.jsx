import {
  BiTask,
  BiCheckCircle,
  BiTime,
  BiErrorCircle,
} from "react-icons/bi";


function MilestoneCards({
  milestones = [],
  activeStatus = "All Status",
  onStatusSelect,
}) {

  const total =
    milestones.length;


  const completed =
    milestones.filter(
      (item) =>
        item.status === "Completed"
    ).length;


  const inProgress =
    milestones.filter(
      (item) =>
        item.status === "In Progress"
    ).length;


  const overdue =
    milestones.filter(
      (item) =>
        item.status === "Overdue"
    ).length;


  const completedPercentage =
    total > 0
      ? (
          (completed / total) *
          100
        ).toFixed(1)
      : "0.0";


  const cards = [
    {
      title: "Total Milestones",
      value: total,
      subtitle: "Across all contracts",
      icon: <BiTask />,
      bg: "bg-blue-100",
      color: "text-blue-600",
      filter: "All Status",
    },

    {
      title: "Completed",
      value: completed,
      subtitle: `${completedPercentage}% completed`,
      icon: <BiCheckCircle />,
      bg: "bg-green-100",
      color: "text-green-600",
      filter: "Completed",
    },

    {
      title: "In Progress",
      value: inProgress,
      subtitle: "Currently active",
      icon: <BiTime />,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
      filter: "In Progress",
    },

    {
      title: "Overdue",
      value: overdue,
      subtitle: "Needs attention",
      icon: <BiErrorCircle />,
      bg: "bg-red-100",
      color: "text-red-600",
      filter: "Overdue",
    },
  ];


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

      {cards.map(
        (card, index) => (

          <button
            key={index}
            type="button"
            onClick={() =>
              onStatusSelect?.(card.filter)
            }
            aria-pressed={
              activeStatus === card.filter
            }
            className={`w-full text-left bg-white border rounded-xl shadow-sm p-6 transition hover:shadow-md hover:border-blue-300 ${
              activeStatus === card.filter
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200"
            }`}
          >

            <div className="flex items-center gap-4">

              <div
                className={`
                  w-14 h-14
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-3xl
                  ${card.bg}
                  ${card.color}
                `}
              >
                {card.icon}
              </div>


              <div>

                <p className="text-sm text-gray-500">
                  {card.title}
                </p>


                <h2 className="text-2xl font-bold mt-1">
                  {card.value}
                </h2>


                <p className="text-sm text-gray-400 mt-1">
                  {card.subtitle}
                </p>

              </div>

            </div>

          </button>

        )
      )}

    </div>
  );
}


export default MilestoneCards;