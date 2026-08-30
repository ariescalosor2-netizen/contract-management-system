import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BiBuilding,
  BiCheckCircle,
  BiFile,
  BiRefresh,
  BiUser,
  BiTime,
  BiTrendingUp,
} from "react-icons/bi";
import MainLayout from "../layouts/MainLayout";
import { getSuperAdminDashboard } from "../services/superAdminService";

const REPORT_CARDS = [
  {
    key: "total_organizations",
    activeKey: "active_organizations",
    title: "Organizations",
    activeLabel: "Active Organizations",
    icon: BiBuilding,
  },
  {
    key: "total_users",
    activeKey: "active_users",
    title: "Users",
    activeLabel: "Active Users",
    icon: BiUser,
  },
  {
    key: "total_contracts",
    activeKey: "active_contracts",
    title: "Contracts",
    activeLabel: "Active Contracts",
    icon: BiFile,
  },
];

function getPercentage(active, total) {
  if (!total || total <= 0) return 0;

  return Math.min(100, Math.round((active / total) * 100));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function ReportCard({
  title,
  activeLabel,
  total,
  active,
  Icon,
  loading,
}) {
  const percentage = getPercentage(active, total);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
          <Icon />
        </div>

        <div className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
          {loading ? "Loading" : `${percentage}% active`}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-gray-500">{title}</p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
          {loading ? "..." : formatNumber(total)}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-gray-500">
              {activeLabel}
            </span>

            <span className="font-semibold text-slate-700">
              {loading ? "..." : formatNumber(active)}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: loading ? "0%" : `${percentage}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadReport = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getSuperAdminDashboard();

      setData(response?.data || null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load system reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const summary = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        active: 0,
        percentage: 0,
      };
    }

    const total =
      Number(data.total_organizations || 0) +
      Number(data.total_users || 0) +
      Number(data.total_contracts || 0);

    const active =
      Number(data.active_organizations || 0) +
      Number(data.active_users || 0) +
      Number(data.active_contracts || 0);

    return {
      total,
      active,
      percentage: getPercentage(active, total),
    };
  }, [data]);

  return (
    <MainLayout>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <BiTrendingUp className="text-lg" />
            </span>

            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              System Analytics
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            System Reports
          </h1>

          <p className="mt-1 text-gray-500">
            High-level system-wide reporting and performance overview.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadReport(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BiRefresh
            className={`text-lg ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          {refreshing ? "Refreshing..." : "Refresh Report"}
        </button>
      </div>

      {/* =====================================================
          ERROR MESSAGE
      ====================================================== */}
      {error && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-red-700">
              Unable to load report
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadReport()}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          REPORT SUMMARY
      ====================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Total Records
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {loading ? "..." : formatNumber(summary.total)}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Organizations, users and contracts
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              <BiFile />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Active Records
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {loading ? "..." : formatNumber(summary.active)}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Currently active across the system
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl text-green-600">
              <BiCheckCircle />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Activity Rate
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-800">
                {loading ? "..." : `${summary.percentage}%`}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Active records versus total records
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">
              <BiTrendingUp />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN REPORT
      ====================================================== */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              System Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current totals and active records across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
            <BiTime className="text-base" />
            Live system data
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {REPORT_CARDS.map((card) => (
            <ReportCard
              key={card.key}
              title={card.title}
              activeLabel={card.activeLabel}
              total={data?.[card.key]}
              active={data?.[card.activeKey]}
              Icon={card.icon}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* =====================================================
          RECENT ACTIVITY
      ====================================================== */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-800">
                Recent System Activity
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest activity recorded by the system.
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600 sm:flex">
              <BiTime />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading && (
            <>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-52 animate-pulse rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-72 animate-pulse rounded bg-gray-100" />
                  </div>

                  <div className="h-7 w-16 animate-pulse rounded-full bg-gray-100" />
                </div>
              ))}
            </>
          )}

          {!loading &&
            (data?.recent_activity || []).length > 0 &&
            data.recent_activity.slice(0, 5).map((item, index) => (
              <div
                key={`${item.type || "activity"}-${index}`}
                className="flex items-start justify-between gap-4 px-6 py-5 transition hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    {String(item.type || "").toLowerCase() ===
                    "contract" ? (
                      <BiFile />
                    ) : (
                      <BiUser />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.title}
                    </p>

                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                  {item.type || "Activity"}
                </span>
              </div>
            ))}

          {!loading &&
            !(data?.recent_activity || []).length && (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 text-2xl text-gray-400">
                  <BiTime />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No recent activity
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  System activity will appear here when records are created
                  or updated.
                </p>
              </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
}