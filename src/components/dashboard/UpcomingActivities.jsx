import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BiCalendarEvent } from "react-icons/bi";

function UpcomingActivities({
  contracts = [],
  loading = false,
}) {
  const navigate = useNavigate();

  const activities =
    useMemo(() => {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      return contracts
        .filter((contract) => {
          if (
            !contract.end_date ||
            contract.status !== "Active"
          ) {
            return false;
          }

          const endDate =
            new Date(
              contract.end_date
            );

          if (
            Number.isNaN(
              endDate.getTime()
            )
          ) {
            return false;
          }

          endDate.setHours(
            0,
            0,
            0,
            0
          );

          const difference =
            endDate.getTime() -
            today.getTime();

          const daysLeft =
            Math.ceil(
              difference /
                (1000 *
                  60 *
                  60 *
                  24)
            );

          return (
            daysLeft >= 0 &&
            daysLeft <= 30
          );
        })
        .map((contract) => {
          const endDate =
            new Date(
              contract.end_date
            );

          endDate.setHours(
            0,
            0,
            0,
            0
          );

          const difference =
            endDate.getTime() -
            today.getTime();

          const daysLeft =
            Math.ceil(
              difference /
                (1000 *
                  60 *
                  60 *
                  24)
            );

          return {
            id: contract.id,

            contract:
              contract.contract_no ||
              contract.title ||
              "Contract",

            date:
              endDate.toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }
              ),

            daysLeft,
          };
        })
        .sort(
          (a, b) =>
            a.daysLeft -
            b.daysLeft
        )
        .slice(0, 5);
    }, [contracts]);

  const getColor = (
    daysLeft
  ) => {
    if (daysLeft <= 7) {
      return "text-red-500";
    }

    if (daysLeft <= 14) {
      return "text-orange-500";
    }

    return "text-blue-500";
  };

  const getDaysText = (
    daysLeft
  ) => {
    if (daysLeft === 0) {
      return "Expires today";
    }

    if (daysLeft === 1) {
      return "1 day left";
    }

    return `${daysLeft} days left`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Upcoming Activities
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Contracts expiring within
            30 days.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/contracts?filter=expiring"
            )
          }
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View All
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="py-10 text-center text-gray-400">
          Loading activities...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        activities.length ===
          0 && (
          <div className="py-10 text-center text-gray-400">
            No upcoming contract
            activities.
          </div>
        )}

      {/* ACTIVITIES */}

      {!loading &&
        activities.length > 0 && (
          <div className="space-y-5">

            {activities.map(
              (item) => {
                const color =
                  getColor(
                    item.daysLeft
                  );

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 items-start"
                  >

                    {/* ICON */}

                    <div
                      className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-2xl ${color}`}
                    >
                      <BiCalendarEvent />
                    </div>

                    {/* DETAILS */}

                    <div className="flex-1 min-w-0">

                      <h4 className="font-semibold text-gray-800">
                        Contract Expiry
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/contracts?filter=expiring"
                          )
                        }
                        className="text-sm text-gray-500 hover:text-blue-600 hover:underline truncate max-w-full"
                      >
                        {item.contract}
                      </button>

                    </div>

                    {/* DATE */}

                    <div className="text-right shrink-0">

                      <p className="text-sm font-medium text-gray-800">
                        {item.date}
                      </p>

                      <p
                        className={`text-xs font-medium ${color}`}
                      >
                        {getDaysText(
                          item.daysLeft
                        )}
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

    </div>
  );
}

export default UpcomingActivities;