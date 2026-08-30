import { useEffect, useMemo, useState } from "react";
import { BiDotsVerticalRounded } from "react-icons/bi";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/userService";

function UserRolesSettings() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [roleFilter, setRoleFilter] =
    useState("All");

  const [showForm, setShowForm] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState(null);

  const [showActions, setShowActions] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  // ============================================================
  // LOAD USERS
  // ============================================================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load users:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ============================================================
  // ROLES FROM ACTUAL USERS
  // ============================================================

  const roles = useMemo(() => {
    const uniqueRoles = users
      .map((user) => user.role)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(
        new Set(uniqueRoles)
      ),
    ];
  }, [users]);

  // ============================================================
  // FILTER USERS
  // ============================================================

  const filteredUsers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const fullName =
        `${user.first_name || ""} ${
          user.last_name || ""
        }`
          .trim()
          .toLowerCase();

      const email =
        (user.email || "").toLowerCase();

      const role =
        (user.role || "").toLowerCase();

      const status =
        user.is_active
          ? "Active"
          : "Inactive";

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [
    users,
    search,
    statusFilter,
    roleFilter,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        itemsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    itemsPerPage;

  const paginatedUsers =
    filteredUsers.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  // ============================================================
  // FORM
  // ============================================================

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    });

    setEditingUser(null);
  };

  const openAddUser = () => {
    resetForm();

    setShowForm(true);
    setShowActions(null);
    setError("");
    setMessage("");
  };

  const openEditUser = (user) => {
    setEditingUser(user);

    setForm({
      first_name:
        user.first_name || "",

      last_name:
        user.last_name || "",

      email:
        user.email || "",

      password: "",
    });

    setShowForm(true);
    setShowActions(null);
    setError("");
    setMessage("");
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  };

  const handleFormChange = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setMessage("");
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!form.first_name.trim()) {
      return "First name is required.";
    }

    if (!form.last_name.trim()) {
      return "Last name is required.";
    }

    if (!form.email.trim()) {
      return "Email is required.";
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        form.email.trim()
      )
    ) {
      return "Please enter a valid email address.";
    }

    if (
      !editingUser &&
      !form.password
    ) {
      return "Password is required when creating a user.";
    }

    if (
      !editingUser &&
      form.password.length < 8
    ) {
      return "Password must be at least 8 characters.";
    }

    return null;
  };

  // ============================================================
  // SAVE USER
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation =
      validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim(),

        email:
          form.email.trim(),
      };

      // Password is only sent when supplied.
      if (form.password.trim()) {
        payload.password =
          form.password;
      }

      if (editingUser) {
        await updateUser(
          editingUser.id,
          payload
        );

        setMessage(
          "User updated successfully."
        );
      } else {
        await createUser(payload);

        setMessage(
          "User created successfully."
        );
      }

      setShowForm(false);
      resetForm();

      await loadUsers();

      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Failed to save user:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // TOGGLE USER STATUS
  // ============================================================

  const handleToggleStatus = async (
    user
  ) => {
    const nextStatus =
      !user.is_active;

    const action =
      nextStatus
        ? "activate"
        : "deactivate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setShowActions(null);

      await updateUser(user.id, {
        is_active: nextStatus,
      });

      setMessage(
        `User ${
          nextStatus
            ? "activated"
            : "deactivated"
        } successfully.`
      );

      await loadUsers();
    } catch (err) {
      console.error(
        "Failed to update user status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to update user status."
      );
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDelete = async (
    user
  ) => {
    const confirmed =
      window.confirm(
        `Delete ${user.first_name} ${user.last_name}? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setShowActions(null);

      await deleteUser(user.id);

      setMessage(
        "User deleted successfully."
      );

      await loadUsers();

      if (
        currentPage > 1 &&
        paginatedUsers.length === 1
      ) {
        setCurrentPage(
          currentPage - 1
        );
      }
    } catch (err) {
      console.error(
        "Failed to delete user:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to delete user."
      );
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const statusBadge = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="px-6 py-5 border-b">
        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Users & Roles
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Manage system users and account access.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition"
          >
            + Add User
          </button>

        </div>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {message && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setCurrentPage(1);
            }}
            placeholder="Search users..."
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-blue-500"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(
                event.target.value
              );
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-blue-500"
          >
            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role === "All"
                  ? "All Roles"
                  : role}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600 text-sm">

              <th className="px-6 py-4">
                Name
              </th>

              <th className="px-6 py-4">
                Email
              </th>

              <th className="px-6 py-4">
                Role
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4 text-center">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Loading users...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              paginatedUsers.map(
                (user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50 transition"
                  >

                    <td className="px-6 py-5 font-medium text-slate-800">
                      {user.first_name}{" "}
                      {user.last_name}
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {user.role || "—"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                          user.is_active
                        )}`}
                      >
                        {user.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="relative flex justify-center">

                        <button
                          type="button"
                          onClick={() =>
                            setShowActions(
                              showActions ===
                                user.id
                                ? null
                                : user.id
                            )
                          }
                          className="text-xl text-gray-500 hover:text-black p-2 rounded-lg hover:bg-gray-100"
                        >
                          <BiDotsVerticalRounded />
                        </button>

                        {showActions ===
                          user.id && (
                          <div className="absolute right-8 top-10 z-20 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">

                            <button
                              type="button"
                              onClick={() =>
                                openEditUser(
                                  user
                                )
                              }
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                            >
                              Edit User
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  user
                                )
                              }
                              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                            >
                              {user.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  user
                                )
                              }
                              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete User
                            </button>

                          </div>
                        )}

                      </div>
                    </td>

                  </tr>
                )
              )
            )}

          </tbody>
        </table>

      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-500">

        <span>
          {filteredUsers.length === 0
            ? "Showing 0 users"
            : `Showing ${
                startIndex + 1
              } to ${Math.min(
                startIndex +
                  paginatedUsers.length,
                filteredUsers.length
              )} of ${
                filteredUsers.length
              } users`}
        </span>

        <div className="flex items-center gap-2">

          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.max(
                    1,
                    page - 1
                  )
              )
            }
            className={`w-9 h-9 rounded-lg border ${
              safePage <= 1
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            &lt;
          </button>

          <span className="px-3">
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={
              safePage >= totalPages
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
              )
            }
            className={`w-9 h-9 rounded-lg border ${
              safePage >= totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
          >
            &gt;
          </button>

        </div>
      </div>

      {/* ======================================================
          ADD / EDIT USER MODAL
      ====================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-5 border-b">

              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingUser
                    ? "Edit User"
                    : "Add User"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {editingUser
                    ? "Update the user's account information."
                    : "Create a new system user."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>

                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(event) =>
                      handleFormChange(
                        "first_name",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>

                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(event) =>
                      handleFormChange(
                        "last_name",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleFormChange(
                        "email",
                        event.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                {!editingUser && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>

                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        handleFormChange(
                          "password",
                          event.target.value
                        )
                      }
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                )}

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 rounded-lg text-white ${
                    saving
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default UserRolesSettings;