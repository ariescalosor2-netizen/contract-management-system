import { useEffect, useMemo, useState } from "react";
import {
  BiBuilding,
  BiUser,
  BiFile,
  BiCheckCircle,
  BiTime,
  BiRefresh,
  BiBarChartAlt2,
} from "react-icons/bi";
import MainLayout from "../layouts/MainLayout";
import { getSuperAdminDashboard } from "../services/superAdminService";

const cards = [
  ["total_organizations", "Organizations", BiBuilding],
  ["total_users", "Users", BiUser],
  ["total_contracts", "Contracts", BiFile],
  ["active_users", "Active Users", BiCheckCircle],
  ["active_organizations", "Active Organizations", BiTime],
];

function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSuperAdminDashboard();
      setData(response?.data || null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load Super Admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeUserRate = useMemo(() => {
    const total = Number(data?.total_users || 0);
    const active = Number(data?.active_users || 0);

    return total > 0 ? Math.round((active / total) * 100) : 0;
  }, [data]);

  const activeOrganizationRate = useMemo(() => {
    const total = Number(data?.total_organizations || 0);
    const active = Number(data?.active_organizations || 0);

    return total > 0 ? Math.round((active / total) * 100) : 0;
  }, [data]);

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="mt-1 text-gray-500">
            System-wide overview and administration.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BiRefresh className={loading ? "animate-spin" : ""} size={19} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([key, title, Icon]) => (
          <div
            key={key}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              <Icon />
            </div>

            <p className="text-sm text-gray-500">{title}</p>

            <p className="mt-1 text-2xl font-bold text-slate-800">
              {loading ? "..." : data?.[key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                User Activity Rate
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Active users compared with total users.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              <BiUser />
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <p className="text-3xl font-bold text-slate-800">
              {loading ? "..." : `${activeUserRate}%`}
            </p>
            <p className="text-xs text-gray-500">
              {loading
                ? "Loading..."
                : `${data?.active_users ?? 0} of ${data?.total_users ?? 0} users active`}
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${activeUserRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Organization Activity Rate
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Active organizations compared with total organizations.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              <BiBuilding />
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between">
            <p className="text-3xl font-bold text-slate-800">
              {loading ? "..." : `${activeOrganizationRate}%`}
            </p>
            <p className="text-xs text-gray-500">
              {loading
                ? "Loading..."
                : `${data?.active_organizations ?? 0} of ${
                    data?.total_organizations ?? 0
                  } organizations active`}
            </p>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${activeOrganizationRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Recent System Activity
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Recent users and contracts recorded by the system.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Live system data
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {(data?.recent_activity || []).map((item, index) => (
            <div
              key={`${item.type}-${item.id || index}`}
              className="flex items-start justify-between gap-4 px-6 py-4 transition hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                {item.type}
              </span>
            </div>
          ))}

          {!loading &&
            !(data?.recent_activity || []).length && (
              <div className="px-6 py-10 text-center">
                <BiBarChartAlt2 className="mx-auto text-3xl text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No recent activity.
                </p>
              </div>
            )}

          {loading && (
            <div className="px-6 py-10 text-center text-sm text-gray-400">
              Loading recent activity...
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-right text-xs text-gray-400">
        {lastUpdated
          ? `Last updated ${lastUpdated.toLocaleTimeString()}`
          : "Waiting for data..."}
      </div>
    </MainLayout>
  );
}

export default SuperAdminDashboard;
