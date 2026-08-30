import { useEffect, useMemo, useState } from "react";
import { BiRefresh, BiSearch, BiUser, BiFile, BiTime } from "react-icons/bi";
import MainLayout from "../layouts/MainLayout";
import { getSuperAdminDashboard } from "../services/superAdminService";

export default function SuperAdminActivity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getSuperAdminDashboard();
      setItems(response?.data?.recent_activity || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load system activity."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activityTypes = useMemo(() => {
    const types = items
      .map((item) => String(item.type || "").toLowerCase())
      .filter(Boolean);

    return [...new Set(types)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const type = String(item.type || "").toLowerCase();

      const matchesType =
        typeFilter === "all" || type === typeFilter;

      const matchesSearch =
        !query ||
        String(item.title || "")
          .toLowerCase()
          .includes(query) ||
        String(item.description || "")
          .toLowerCase()
          .includes(query) ||
        type.includes(query);

      return matchesType && matchesSearch;
    });
  }, [items, search, typeFilter]);

  const userActivityCount = useMemo(
    () =>
      items.filter((item) =>
        String(item.type || "")
          .toLowerCase()
          .includes("user")
      ).length,
    [items]
  );

  const contractActivityCount = useMemo(
    () =>
      items.filter((item) =>
        String(item.type || "")
          .toLowerCase()
          .includes("contract")
      ).length,
    [items]
  );

  const getIcon = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("user")) return BiUser;
    if (value.includes("contract")) return BiFile;

    return BiTime;
  };

  return (
    <MainLayout>
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            System Activity
          </h1>

          <p className="mt-1 text-gray-500">
            Recent system-level activity available from current records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <BiRefresh
            size={19}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => load()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* SEARCH + FILTER */}
      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <BiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Activity</option>

            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* TOTAL ACTIVITY */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Total Activity
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {loading ? "..." : items.length}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Recorded system activities
          </p>
        </div>

        {/* USER ACTIVITY */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            User Activity
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {loading ? "..." : userActivityCount}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            User-related activities
          </p>
        </div>

        {/* CONTRACT ACTIVITY */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Contract Activity
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-800">
            {loading ? "..." : contractActivityCount}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Contract-related activities
          </p>
        </div>
      </div>

      {/* ACTIVITY LOG */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Activity Log
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {loading
                ? "Loading activity..."
                : `${filteredItems.length} ${
                    filteredItems.length === 1
                      ? "activity"
                      : "activities"
                  } shown`}
            </p>
          </div>

          {lastUpdated && !loading && (
            <p className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          {/* LOADING */}
          {loading && (
            <div className="px-6 py-12 text-center text-sm text-gray-400">
              Loading activity...
            </div>
          )}

          {/* ACTIVITY ITEMS */}
          {!loading &&
            filteredItems.map((item, index) => {
              const Icon = getIcon(item.type);

              return (
                <div
                  key={`${item.type}-${item.id || index}`}
                  className="flex items-start gap-4 px-6 py-5 transition hover:bg-gray-50"
                >
                  {/* ICON */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                    <Icon />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {item.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>

                      <span className="w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* EMPTY STATE */}
          {!loading && !filteredItems.length && (
            <div className="px-6 py-12 text-center">
              <BiTime className="mx-auto text-4xl text-gray-300" />

              <p className="mt-3 text-sm font-medium text-slate-700">
                {items.length
                  ? "No matching activity found."
                  : "No activity available."}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {items.length
                  ? "Try changing your search or filter."
                  : "New system activity will appear here."}
              </p>

              {(search || typeFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setTypeFilter("all");
                  }}
                  className="mt-4 text-sm font-semibold text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}