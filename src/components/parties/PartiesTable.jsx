import { useEffect, useMemo, useState } from "react";

import {
  BiDotsVerticalRounded,
  BiShow,
  BiEdit,
  BiTrash,
  BiPowerOff,
} from "react-icons/bi";

import {
  getParties,
  updateParty,
  deleteParty,
} from "../../services/partyService";

import PartyModal from "./PartyModal";

const ITEMS_PER_PAGE = 15;

function PartiesTable({
  searchTerm = "",
  typeFilter = "All Types",
  statusFilter = "All Status",
  refreshKey = 0,
}) {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedParty, setSelectedParty] =
    useState(null);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [selectedViewParty, setSelectedViewParty] =
    useState(null);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [currentPage, setCurrentPage] =
    useState(1);


  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  const loadParties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getParties();

      if (response?.success === false) {
        throw new Error(
          response.message ||
          "Failed to load parties."
        );
      }

      setParties(
        Array.isArray(response?.data)
          ? response.data
          : []
      );

    } catch (error) {
      console.error(
        "Failed to load parties:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Authentication session expired. Please log in again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You do not have permission to view parties."
        );
      } else {
        setError(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to load parties."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadParties();
  }, [refreshKey]);


  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    typeFilter,
    statusFilter,
  ]);


  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredParties = useMemo(() => {
    const search =
      searchTerm
        .trim()
        .toLowerCase();

    return parties.filter((party) => {

      const matchesSearch =
        !search ||
        String(party.name || "")
          .toLowerCase()
          .includes(search) ||
        String(party.email || "")
          .toLowerCase()
          .includes(search) ||
        String(party.contact || "")
          .toLowerCase()
          .includes(search);

      const matchesType =
        typeFilter === "All Types" ||
        party.type === typeFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        party.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    parties,
    searchTerm,
    typeFilter,
    statusFilter,
  ]);


  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredParties.length /
        ITEMS_PER_PAGE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    ITEMS_PER_PAGE;

  const currentParties =
    filteredParties.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  const handleView = (party) => {
    setOpenMenuId(null);
    setSelectedViewParty(party);
  };


  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (party) => {
    setOpenMenuId(null);
    setSelectedParty(party);
    setIsEditModalOpen(true);
  };


  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  const handleUpdate = async (data) => {
    try {
      const response =
        await updateParty(
          selectedParty.id,
          data
        );

      if (response?.success === false) {
        throw new Error(
          response.message ||
          "Failed to update party."
        );
      }

      setIsEditModalOpen(false);
      setSelectedParty(null);

      await loadParties();

    } catch (error) {
      console.error(
        "Failed to update party:",
        error
      );

      alert(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update party."
      );

      throw error;
    }
  };


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (party) => {
    setOpenMenuId(null);

    const confirmed = window.confirm(
      `Are you sure you want to delete "${party.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await deleteParty(party.id);

      if (response?.success === false) {
        throw new Error(
          response.message ||
          "Failed to delete party."
        );
      }

      await loadParties();

      setCurrentPage(1);

    } catch (error) {
      console.error(
        "Failed to delete party:",
        error
      );

      alert(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete party."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | ACTIVATE / DEACTIVATE
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus = async (party) => {
    setOpenMenuId(null);

    const newStatus =
      party.status === "Active"
        ? "Inactive"
        : "Active";

    try {
      const response =
        await updateParty(
          party.id,
          {
            name: party.name,
            type: party.type,
            email: party.email,
            contact: party.contact,
            status: newStatus,
          }
        );

      if (response?.success === false) {
        throw new Error(
          response.message ||
          "Failed to update party status."
        );
      }

      await loadParties();

    } catch (error) {
      console.error(
        "Failed to update party status:",
        error
      );

      alert(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Failed to update party status."
      );
    }
  };


  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }
    );
  };


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="
        rounded-xl
        border
        border-gray-200
        bg-white
        p-12
        text-center
        shadow-sm
      ">
        <p className="text-gray-500">
          Loading parties...
        </p>
      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="
        rounded-xl
        border
        border-red-200
        bg-red-50
        p-6
      ">

        <p className="
          font-medium
          text-red-700
        ">
          {error}
        </p>

        <button
          type="button"
          onClick={loadParties}
          className="
            mt-4
            rounded-lg
            bg-red-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-red-700
          "
        >
          Try Again
        </button>

      </div>
    );
  }


  return (
    <>
      {/* TABLE */}

      <div className="
        overflow-visible
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
      ">

        <div className="overflow-x-auto">

          <table className="
            w-full
            min-w-[1000px]
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
                  Party Name
                </th>

                <th className="px-6 py-4">
                  Type
                </th>

                <th className="px-6 py-4">
                  Email
                </th>

                <th className="px-6 py-4">
                  Contact
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Date Created
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

              {currentParties.length > 0 ? (

                currentParties.map((party) => (

                  <tr
                    key={party.id}
                    className="
                      border-b
                      last:border-0
                      hover:bg-gray-50
                    "
                  >

                    <td className="
                      px-6
                      py-4
                      font-semibold
                      text-slate-800
                    ">
                      {party.name}
                    </td>


                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-600
                    ">
                      {party.type}
                    </td>


                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-600
                    ">
                      {party.email || "-"}
                    </td>


                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-600
                    ">
                      {party.contact || "-"}
                    </td>


                    <td className="px-6 py-4">

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
                            party.status === "Active"
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
                              party.status === "Active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }
                          `}
                        />

                        {party.status}

                      </span>

                    </td>


                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-600
                    ">
                      {formatDate(
                        party.created_at
                      )}
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
                            openMenuId === party.id
                              ? null
                              : party.id
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


                      {openMenuId === party.id && (

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

                          <button
                            type="button"
                            onClick={() =>
                              handleView(party)
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
                            <BiShow size={18} />
                            View
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(party)
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
                            <BiEdit size={18} />
                            Edit
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                party
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
                                party.status === "Active"
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }
                            `}
                          >
                            <BiPowerOff size={18} />

                            {party.status === "Active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(party)
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
                            <BiTrash size={18} />
                            Delete
                          </button>

                        </div>

                      )}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="7"
                    className="
                      px-6
                      py-14
                      text-center
                      text-gray-500
                    "
                  >
                    No parties found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* PAGINATION */}

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

            <span className="font-medium text-gray-700">
              {filteredParties.length === 0
                ? 0
                : startIndex + 1}
            </span>

            {" "}to{" "}

            <span className="font-medium text-gray-700">
              {Math.min(
                startIndex +
                  currentParties.length,
                filteredParties.length
              )}
            </span>

            {" "}of{" "}

            <span className="font-medium text-gray-700">
              {filteredParties.length}
            </span>

            {" "}parties

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
                disabled:opacity-40
              "
            >
              ‹
            </button>


            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
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
                safePage >= totalPages
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
                disabled:opacity-40
              "
            >
              ›
            </button>

          </div>

        </div>

      </div>


      {/* EDIT MODAL */}

      <PartyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedParty(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedParty}
        mode="edit"
      />


      {/* VIEW MODAL */}

      {selectedViewParty && (

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
              px-6
              py-5
            ">

              <div>
                <h2 className="
                  text-xl
                  font-bold
                  text-slate-800
                ">
                  Party Details
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  View party information
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedViewParty(null)
                }
                className="
                  text-2xl
                  text-gray-400
                  hover:text-gray-700
                "
              >
                ×
              </button>

            </div>


            <div className="space-y-5 p-6">

              <div>
                <p className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-400
                ">
                  Party Name
                </p>

                <p className="
                  mt-1
                  text-lg
                  font-semibold
                  text-slate-800
                ">
                  {selectedViewParty.name}
                </p>
              </div>


              <div className="
                grid
                grid-cols-1
                gap-5
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
                    Type
                  </p>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-700
                  ">
                    {selectedViewParty.type}
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
                      selectedViewParty.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}>
                    {selectedViewParty.status}
                  </span>
                </div>


                <div>
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
                    {selectedViewParty.email || "-"}
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
                    Contact
                  </p>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-700
                  ">
                    {selectedViewParty.contact || "-"}
                  </p>
                </div>

              </div>


              <div>
                <p className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-400
                ">
                  Date Created
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-gray-700
                ">
                  {formatDate(
                    selectedViewParty.created_at
                  )}
                </p>
              </div>

            </div>


            <div className="
              flex
              justify-end
              border-t
              px-6
              py-4
            ">

              <button
                type="button"
                onClick={() =>
                  setSelectedViewParty(null)
                }
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

    </>
  );
}

export default PartiesTable;