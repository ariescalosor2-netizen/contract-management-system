import { useEffect, useMemo, useState } from "react";
import { BiShield, BiUser, BiX } from "react-icons/bi";
import MainLayout from "../layouts/MainLayout";
import {
  getSuperAdminUsers,
  getSystemRoles,
} from "../services/superAdminService";

export default function SuperAdminRoles() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [rolesResponse, usersResponse] = await Promise.all([
          getSystemRoles(),
          getSuperAdminUsers(),
        ]);

        setRoles(rolesResponse?.data || []);
        setUsers(usersResponse?.data || []);
      } catch (e) {
        setError(
          e.response?.data?.detail ||
            "Failed to load roles and permissions."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const usersByRole = useMemo(() => {
    return users.reduce((groups, user) => {
      const role = user.role || "Unassigned";
      if (!groups[role]) groups[role] = [];
      groups[role].push(user);
      return groups;
    }, {});
  }, [users]);

  const selectedRoleUsers = selectedRole
    ? usersByRole[selectedRole.name] || []
    : [];

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Roles &amp; Permissions
        </h1>
        <p className="mt-1 text-gray-500">
          System roles available for user assignment.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="h-6 w-32 rounded-full bg-gray-100" />
              <div className="mt-5 h-4 w-3/4 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : roles.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            const roleUsers = usersByRole[role.name] || [];

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role)}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {role.name}
                  </span>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-lg text-blue-600">
                    <BiShield />
                  </div>
                </div>

                <p className="mt-4 min-h-[40px] text-sm text-gray-500">
                  {role.description || "System role"}
                </p>

                <div className="mt-5 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs font-medium text-gray-500">
                  <BiUser className="text-blue-600" size={17} />
                  <span>
                    {roleUsers.length} {roleUsers.length === 1 ? "user" : "users"} assigned
                  </span>
                  <span className="ml-auto text-blue-600">View details →</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <BiShield className="mx-auto text-4xl text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">No roles found.</p>
        </div>
      )}

      {selectedRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRole(null);
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                    <BiShield />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedRole.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                      Role details and assigned users
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label="Close"
              >
                <BiX size={22} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Description
                </p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {selectedRole.description || "System role"}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Assigned Users
                  </h3>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {selectedRoleUsers.length}
                  </span>
                </div>

                {selectedRoleUsers.length ? (
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {selectedRoleUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                          {`${user.first_name || ""} ${user.last_name || ""}`
                            .trim()
                            .charAt(0)
                            .toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                              user.email}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                    No users are currently assigned to this role.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
