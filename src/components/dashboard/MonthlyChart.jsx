import { useMemo } from "react";

function MonthlyChart({
  contracts = [],
  loading = false,
}) {
  const monthlyData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const currentYear =
      new Date().getFullYear();

    const counts = months.map(
      (month) => ({
        month,
        value: 0,
      })
    );

    contracts.forEach(
      (contract) => {
        const dateValue =
          contract.created_at ||
          contract.createdAt ||
          contract.start_date ||
          contract.startDate ||
          contract.date;

        if (!dateValue) {
          return;
        }

        const date =
          new Date(dateValue);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return;
        }

        if (
          date.getFullYear() !==
          currentYear
        ) {
          return;
        }

        counts[
          date.getMonth()
        ].value += 1;
      }
    );

    return counts;
  }, [contracts]);

  const maxValue = Math.max(
    ...monthlyData.map(
      (item) => item.value
    ),
    1
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[300px]">

      <h2 className="text-xl font-semibold text-slate-800">
        Contracts by Month
      </h2>

      {loading ? (
        <div className="h-[230px] flex items-center justify-center text-gray-400">
          Loading chart...
        </div>
      ) : contracts.length === 0 ? (
        <div className="h-[230px] flex items-center justify-center text-gray-400">
          No contract data available.
        </div>
      ) : (
        <div className="mt-6">

          <div className="h-[220px] flex items-end gap-3 px-3">

            {monthlyData.map(
              (item) => {
                const height =
                  item.value === 0
                    ? 0
                    : Math.max(
                        (item.value /
                          maxValue) *
                          180,
                        12
                      );

                return (
                  <div
                    key={item.month}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >

                    <div className="relative w-full flex justify-center items-end h-[190px]">

                      {item.value >
                        0 && (
                        <div
                          className="w-7 bg-blue-600 rounded-t-md hover:bg-blue-700 transition"
                          style={{
                            height: `${height}px`,
                          }}
                          title={`${item.month}: ${item.value} contract${
                            item.value !==
                            1
                              ? "s"
                              : ""
                          }`}
                        >

                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600">
                            {item.value}
                          </span>

                        </div>
                      )}

                    </div>

                    <span className="text-xs text-gray-500 mt-2">
                      {item.month}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default MonthlyChart;