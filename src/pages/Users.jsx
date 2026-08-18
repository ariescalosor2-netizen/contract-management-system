import { useEffect, useMemo, useState } from "react";
import {
  BiPlus,
  BiSearch,
  BiDotsVerticalRounded,
  BiShow,
  BiEdit,
  BiTrash,
  BiPowerOff,
} from "react-icons/bi";

import MainLayout from "../layouts/MainLayout";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";

import UserModal from "../components/users/UserModal";


const ITEMS_PER_PAGE = 10;


function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("All Roles");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [showModal, setShowModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [viewUser, setViewUser] =
    useState(null);


  /*
  |--------------------------------------------------------------------------
  | LOAD USERS
  |--------------------------------------------------------------------------
  */

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

      if (
        err.response?.status === 401
      ) {
        setError(
          "Authentication session expired. Please log in again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to view users."
        );
      } else {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load users."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, []);


  /*
  |--------------------------------------------------------------------------
  | RESET PAGE WHEN FILTER CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    roleFilter,
    statusFilter,
  ]);


  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const handleSaveUser = async (form) => {
    try {

      if (selectedUser) {

        await updateUser(
          selectedUser.id,
          form
        );

        alert(
          "User updated successfully."
        );

      } else {

        await createUser(form);

        alert(
          "User created successfully."
        );
      }

      setShowModal(false);
      setSelectedUser(null);

      await loadUsers();

    } catch (err) {
      console.error(
        "Failed to save user:",
        err
      );

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Unable to save user."
      );

      throw err;
    }
  };


  /*
  |--------------------------------------------------------------------------
  | NEW USER
  |--------------------------------------------------------------------------
  */

  const handleNewUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };


  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (user) => {
    setOpenMenuId(null);

    setSelectedUser(user);
    setShowModal(true);
  };


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  const handleView = (user) => {
    setOpenMenuId(null);

    setViewUser(user);
    setShowViewModal(true);
  };


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (user) => {

    setOpenMenuId(null);

    const fullName =
      `${user.first_name} ${user.last_name}`;

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${fullName}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteUser(user.id);

      await loadUsers();

      alert(
        "User deleted successfully."
      );

    } catch (err) {

      console.error(
        "Failed to delete user:",
        err
      );

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Unable to delete user."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | ACTIVATE / DEACTIVATE
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus =
    async (user) => {

      setOpenMenuId(null);

      const newStatus =
        !user.is_active;

      try {

        await updateUser(
          user.id,
          {
            is_active:
              newStatus,
          }
        );

        await loadUsers();

      } catch (err) {

        console.error(
          "Failed to update user status:",
          err
        );

        alert(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Unable to update user status."
        );
      }
    };


  /*
  |--------------------------------------------------------------------------
  | FILTER USERS
  |--------------------------------------------------------------------------
  */

  const filteredUsers =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {

          const fullName =
            `${user.first_name || ""} ${
              user.last_name || ""
            }`
              .trim()
              .toLowerCase();

          const email =
            String(
              user.email || ""
            ).toLowerCase();

          const role =
            String(
              user.role || ""
            );

          const matchesSearch =
            !search ||
            fullName.includes(search) ||
            email.includes(search);

          const matchesRole =
            roleFilter === "All Roles" ||
            role === roleFilter;

          const matchesStatus =
            statusFilter === "All Status" ||
            (
              statusFilter === "Active" &&
              user.is_active
            ) ||
            (
              statusFilter === "Inactive" &&
              !user.is_active
            );

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );

    }, [
      users,
      searchTerm,
      roleFilter,
      statusFilter,
    ]);


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredUsers.length /
          ITEMS_PER_PAGE
      )
    );

  const safePage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    (safePage - 1) *
    ITEMS_PER_PAGE;

  const paginatedUsers =
    filteredUsers.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );


  /*
  |--------------------------------------------------------------------------
  | ROLE OPTIONS
  |--------------------------------------------------------------------------
  */

  const roleOptions = [
    "Administrator",
    "Manager",
    "Staff",
  ];


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <MainLayout>

        <div className="
          flex
          min-h-[400px]
          items-center
          justify-center
        ">

          <div className="
            rounded-xl
            border
            border-gray-200
            bg-white
            px-8
            py-6
            shadow-sm
          ">

            <p className="
              text-gray-500
            ">
              Loading users...
            </p>

          </div>

        </div>

      </MainLayout>
    );
  }


  return (
    <MainLayout>

      <div className="space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="
          flex
          flex-col
          gap-4
          md:flex-row
          md:items-center
          md:justify-between
        ">

          <div>

            <h1 className="
              text-3xl
              font-bold
              text-slate-800
            ">
              Users
            </h1>

            <p className="
              mt-1
              text-gray-500
            ">
              Manage system users and permissions.
            </p>

          </div>


          <button
            type="button"
            onClick={handleNewUser}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              py-3
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
            "
          >

            <BiPlus size={22} />

            New User

          </button>

        </div>


        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (

          <div className="
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-4
            ">

              <span className="
                text-sm
                text-red-700
              ">
                {error}
              </span>

              <button
                type="button"
                onClick={loadUsers}
                className="
                  text-sm
                  font-semibold
                  text-red-700
                  underline
                "
              >
                Retry
              </button>

            </div>

          </div>

        )}


        {/* ======================================================
            SEARCH + FILTERS
        ====================================================== */}

        <div className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
        ">

          <div className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            lg:grid-cols-12
          ">

            {/* SEARCH */}

            <div className="
              relative
              lg:col-span-6
            ">

              <BiSearch className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-xl
                text-gray-400
              " />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search users..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  py-3
                  pl-12
                  pr-4
                  outline-none
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />

            </div>


            {/* ROLE */}

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value
                )
              }
              className="
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-3
                outline-none
                focus:border-blue-500
                lg:col-span-3
              "
            >

              <option value="All Roles">
                All Roles
              </option>

              {roleOptions.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                )
              )}

            </select>


            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="
                rounded-xl
                border
                border-slate-300
                bg-white
                px-4
                py-3
                outline-none
                focus:border-blue-500
                lg:col-span-3
              "
            >

              <option value="All Status">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>


        {/* ======================================================
            USERS TABLE
        ====================================================== */}

        <div className="
          overflow-visible
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        ">

          <div className="overflow-x-auto">

            <table className="
              w-full
              min-w-[950px]
            ">

              <thead>

                <tr className="
                  border-b
                  bg-gray-50
                  text-left
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">

                  <th className="px-6 py-4">
                    User
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

                  <th className="
                    px-6
                    py-4
                    text-right
                  ">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {paginatedUsers.length >
                0 ? (

                  paginatedUsers.map(
                    (user) => (

                      <tr
                        key={user.id}
                        className="
                          border-b
                          last:border-0
                          hover:bg-gray-50
                        "
                      >

                        {/* USER */}

                        <td className="
                          px-6
                          py-4
                        ">

                          <div className="
                            flex
                            items-center
                            gap-3
                          ">

                            <div className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-100
                              font-semibold
                              text-blue-700
                            ">
                              {(
                                user.first_name
                                  ?.charAt(0) ||
                                ""
                              ).toUpperCase()}
                              {(
                                user.last_name
                                  ?.charAt(0) ||
                                ""
                              ).toUpperCase()}
                            </div>

                            <div>

                              <p className="
                                font-semibold
                                text-slate-800
                              ">
                                {user.first_name}{" "}
                                {user.last_name}
                              </p>

                              <p className="
                                text-xs
                                text-gray-400
                              ">
                                User
                              </p>

                            </div>

                          </div>

                        </td>


                        {/* EMAIL */}

                        <td className="
                          px-6
                          py-4
                          text-sm
                          text-gray-600
                        ">
                          {user.email}
                        </td>


                        {/* ROLE */}

                        <td className="
                          px-6
                          py-4
                        ">

                          <span className="
                            inline-flex
                            rounded-full
                            bg-blue-50
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-blue-700
                          ">
                            {user.role || "—"}
                          </span>

                        </td>


                        {/* STATUS */}

                        <td className="
                          px-6
                          py-4
                        ">

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              ${
                                user.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${
                                  user.is_active
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }
                              `}
                            />

                            {user.is_active
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="
                          relative
                          px-6
                          py-4
                          text-right
                        ">

                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId ===
                                  user.id
                                  ? null
                                  : user.id
                              )
                            }
                            className="
                              rounded-lg
                              p-2
                              text-gray-500
                              hover:bg-gray-100
                              hover:text-gray-800
                            "
                          >

                            <BiDotsVerticalRounded
                              size={22}
                            />

                          </button>


                          {openMenuId ===
                            user.id && (

                            <div className="
                              absolute
                              right-6
                              top-12
                              z-30
                              w-48
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              text-left
                              shadow-xl
                            ">

                              {/* VIEW */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    user
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  px-4
                                  py-3
                                  text-sm
                                  text-gray-700
                                  hover:bg-gray-50
                                "
                              >

                                <BiShow
                                  size={18}
                                />

                                View

                              </button>


                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    user
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  px-4
                                  py-3
                                  text-sm
                                  text-gray-700
                                  hover:bg-gray-50
                                "
                              >

                                <BiEdit
                                  size={18}
                                />

                                Edit

                              </button>


                              {/* STATUS */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleStatus(
                                    user
                                  )
                                }
                                className={`
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  px-4
                                  py-3
                                  text-sm
                                  hover:bg-gray-50
                                  ${
                                    user.is_active
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }
                                `}
                              >

                                <BiPowerOff
                                  size={18}
                                />

                                {user.is_active
                                  ? "Deactivate"
                                  : "Activate"}

                              </button>


                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    user
                                  )
                                }
                                className="
                                  flex
                                  w-full
                                  items-center
                                  gap-3
                                  px-4
                                  py-3
                                  text-sm
                                  text-red-600
                                  hover:bg-red-50
                                "
                              >

                                <BiTrash
                                  size={18}
                                />

                                Delete

                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="
                        px-6
                        py-14
                        text-center
                      "
                    >

                      <p className="
                        text-gray-500
                      ">
                        No users found.
                      </p>

                      <p className="
                        mt-1
                        text-sm
                        text-gray-400
                      ">
                        Try changing your search or filters.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>


          {/* ====================================================
              PAGINATION
          ==================================================== */}

          <div className="
            flex
            flex-col
            gap-4
            border-t
            border-gray-200
            px-6
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <p className="
              text-sm
              text-gray-500
            ">

              Showing{" "}

              <span className="
                font-medium
                text-gray-700
              ">
                {filteredUsers.length === 0
                  ? 0
                  : startIndex + 1}
              </span>

              {" "}to{" "}

              <span className="
                font-medium
                text-gray-700
              ">
                {Math.min(
                  startIndex +
                    paginatedUsers.length,
                  filteredUsers.length
                )}
              </span>

              {" "}of{" "}

              <span className="
                font-medium
                text-gray-700
              ">
                {filteredUsers.length}
              </span>

              {" "}users

            </p>


            <div className="
              flex
              items-center
              gap-2
            ">

              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.max(
                        1,
                        prev - 1
                      )
                  )
                }
                className="
                  h-9
                  w-9
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-600
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                ‹
              </button>


              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1
              ).map((page) => (

                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`
                    h-9
                    min-w-9
                    rounded-lg
                    px-2
                    text-sm
                    font-medium
                    ${
                      safePage === page
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  {page}
                </button>

              ))}


              <button
                type="button"
                disabled={
                  safePage >=
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.min(
                        totalPages,
                        prev + 1
                      )
                  )
                }
                className="
                  h-9
                  w-9
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-600
                  hover:bg-gray-50
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                ›
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      <UserModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
      />


      {/* ========================================================
          VIEW USER MODAL
      ======================================================== */}

      {showViewModal &&
        viewUser && (

        <div className="
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          bg-black/40
          p-4
        ">

          <div className="
            w-full
            max-w-lg
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          ">

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-gray-200
              px-6
              py-5
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-slate-800
                ">
                  User Details
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  View account information.
                </p>

              </div>


              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setViewUser(null);
                }}
                className="
                  text-2xl
                  text-gray-400
                  hover:text-gray-700
                "
              >
                ×
              </button>

            </div>


            <div className="
              space-y-5
              p-6
            ">

              {/* PROFILE */}

              <div className="
                flex
                items-center
                gap-4
              ">

                <div className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  text-lg
                  font-bold
                  text-blue-700
                ">

                  {(
                    viewUser.first_name
                      ?.charAt(0) || ""
                  ).toUpperCase()}

                  {(
                    viewUser.last_name
                      ?.charAt(0) || ""
                  ).toUpperCase()}

                </div>


                <div>

                  <h3 className="
                    text-lg
                    font-bold
                    text-slate-800
                  ">
                    {viewUser.first_name}{" "}
                    {viewUser.last_name}
                  </h3>

                  <p className="
                    text-sm
                    text-gray-500
                  ">
                    {viewUser.email}
                  </p>

                </div>

              </div>


              {/* DETAILS */}

              <div className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
              ">

                <div>

                  <p className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-400
                  ">
                    Role
                  </p>

                  <p className="
                    mt-1
                    text-sm
                    font-medium
                    text-gray-700
                  ">
                    {viewUser.role || "—"}
                  </p>

                </div>


                <div>

                  <p className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-400
                  ">
                    Status
                  </p>

                  <span className={`
                    mt-1
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    ${
                      viewUser.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}>
                    {viewUser.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>


                <div className="sm:col-span-2">

                  <p className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-gray-400
                  ">
                    Email
                  </p>

                  <p className="
                    mt-1
                    break-all
                    text-sm
                    text-gray-700
                  ">
                    {viewUser.email}
                  </p>

                </div>

              </div>

            </div>


            <div className="
              flex
              justify-end
              border-t
              border-gray-200
              px-6
              py-4
            ">

              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false);
                  setViewUser(null);
                }}
                className="
                  rounded-lg
                  border
                  border-gray-300
                  px-5
                  py-2.5
                  font-medium
                  text-gray-700
                  hover:bg-gray-50
                "
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


export default Users;