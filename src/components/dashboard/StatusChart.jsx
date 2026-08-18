import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function StatusChart({
  contracts = [],
  loading = false,
}) {
  const navigate = useNavigate();

  const statusData = useMemo(() => {
    const counts = {
      Active: 0,
      Draft: 0,
      Expired: 0,
      "Pending Approval": 0,
    };

    contracts.forEach((contract) => {
      const status = contract.status;

      if (
        Object.prototype.hasOwnProperty.call(
          counts,
          status
        )
      ) {
        counts[status]++;
      }
    });

    return [
      {
        label: "Active",
        value: counts.Active,
        color: "#22C55E",
      },
      {
        label: "Draft",
        value: counts.Draft,
        color: "#3B82F6",
      },
      {
        label: "Expired",
        value: counts.Expired,
        color: "#EF4444",
      },
      {
        label: "Pending Approval",
        value:
          counts["Pending Approval"],
        color: "#FACC15",
      },
    ];
  }, [contracts]);

  const total = statusData.reduce(
    (sum, item) =>
      sum + item.value,
    0
  );

  const radius = 80;

  const circumference =
    2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-semibold text-slate-800">
          Contracts by Status
        </h2>

        <button
          type="button"
          onClick={() =>
            navigate("/contracts")
          }
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </button>

      </div>

      <div className="relative mt-6 flex items-center justify-center">

        {loading ? (
          <div className="h-[230px] flex items-center justify-center text-gray-400">
            Loading chart...
          </div>
        ) : total === 0 ? (
          <div className="h-[230px] flex items-center justify-center text-gray-400">
            No contract data available.
          </div>
        ) : (
          <div className="relative w-[230px] h-[230px]">

            <svg
              width="230"
              height="230"
              viewBox="0 0 230 230"
              className="-rotate-90"
            >

              <circle
                cx="115"
                cy="115"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="32"
              />

              {statusData.map(
                (item) => {
                  if (item.value === 0) {
                    return null;
                  }

                  const percentage =
                    item.value /
                    total;

                  const segmentLength =
                    percentage *
                    circumference;

                  const dashOffset =
                    circumference -
                    accumulated;

                  accumulated +=
                    segmentLength;

                  return (
                    <circle
                      key={item.label}
                      cx="115"
                      cy="115"
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth="32"
                      strokeDasharray={`${segmentLength} ${
                        circumference -
                        segmentLength
                      }`}
                      strokeDashoffset={
                        dashOffset
                      }
                      strokeLinecap="butt"
                    />
                  );
                }
              )}

            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">
                {total}
              </span>

              <span className="text-sm text-gray-400">
                Contracts
              </span>
            </div>

          </div>
        )}

      </div>

      {!loading &&
        total > 0 && (
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-2">

            {statusData.map(
              (item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() =>
                    navigate(
                      `/contracts?status=${encodeURIComponent(
                        item.label
                      )}`
                    )
                  }
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >

                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor:
                        item.color,
                    }}
                  />

                  <span>
                    {item.label}
                  </span>

                  <span className="text-gray-400">
                    ({item.value})
                  </span>

                </button>
              )
            )}

          </div>
        )}

    </div>
  );
}

export default StatusChart;