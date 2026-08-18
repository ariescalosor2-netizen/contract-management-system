import { useEffect, useMemo, useState } from "react";

import {
  BiDotsVerticalRounded,
  BiShow,
  BiEdit,
  BiTrash,
  BiArchiveIn,
} from "react-icons/bi";

import {
  getContractTypes,
  deleteContractType,
  updateContractType,
} from "../../services/contractTypeService";


const ITEMS_PER_PAGE = 10;


function ContractTypesTable({
  searchTerm = "",
  statusFilter = "All",
  refreshKey = 0,
  onEdit,
}) {

  const [contractTypes, setContractTypes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [selectedType, setSelectedType] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadContractTypes();
  }, [refreshKey]);


  /*
  |--------------------------------------------------------------------------
  | RESET PAGE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
  ]);


  /*
  |--------------------------------------------------------------------------
  | GET DATA
  |--------------------------------------------------------------------------
  */

  const loadContractTypes =
    async () => {

      try {

        setLoading(true);
        setError("");

        const response =
          await getContractTypes();

        if (
          response?.success === false
        ) {
          throw new Error(
            response.message ||
            "Failed to load contract types."
          );
        }

        setContractTypes(
          Array.isArray(
            response?.data
          )
            ? response.data
            : []
        );

      } catch (error) {

        console.error(
          "Failed to load contract types:",
          error
        );

        if (
          error.response?.status === 401
        ) {

          setError(
            "Authentication session expired. Please log in again."
          );

        } else if (
          error.response?.status === 403
        ) {

          setError(
            "You do not have permission to view contract types."
          );

        } else {

          setError(
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "Failed to load contract types."
          );

        }

      } finally {

        setLoading(false);

      }
    };


  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredTypes =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return contractTypes.filter(
        (type) => {

          const matchesSearch =
            !search ||
            String(
              type.name || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              type.description || ""
            )
              .toLowerCase()
              .includes(search);

          const matchesStatus =
            statusFilter === "All" ||
            type.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      contractTypes,
      searchTerm,
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
        filteredTypes.length /
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

  const paginatedTypes =
    filteredTypes.slice(
      startIndex,
      startIndex +
        ITEMS_PER_PAGE
    );


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete =
    async (type) => {

      setOpenMenuId(null);

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${type.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {

        await deleteContractType(
          type.id
        );

        await loadContractTypes();

      } catch (error) {

        console.error(
          "Failed to delete contract type:",
          error
        );

        alert(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to delete contract type."
        );

      }
    };


  /*
  |--------------------------------------------------------------------------
  | TOGGLE STATUS
  |--------------------------------------------------------------------------
  */

  const handleToggleStatus =
    async (type) => {

      setOpenMenuId(null);

      const newStatus =
        type.status === "Active"
          ? "Inactive"
          : "Active";

      try {

        await updateContractType(
          type.id,
          {
            name: type.name,
            description:
              type.description,
            icon: type.icon,
            status: newStatus,
          }
        );

        await loadContractTypes();

      } catch (error) {

        console.error(
          "Failed to update status:",
          error
        );

        alert(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Failed to update contract type status."
        );

      }
    };


  /*
  |--------------------------------------------------------------------------
  | VIEW
  |--------------------------------------------------------------------------
  */

  const handleView =
    (type) => {

      setOpenMenuId(null);

      setSelectedType(type);

      setShowDetails(true);
    };


  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formatDate =
    (date) => {

      if (!date) {
        return "-";
      }

      const parsed =
        new Date(date);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
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
  | ICON
  |--------------------------------------------------------------------------
  */

  const getIcon =
    (type) => {

      if (type.icon) {
        return type.icon;
      }

      return "📄";
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
          Loading contract types...
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
          onClick={
            loadContractTypes
          }
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

      {/* ========================================================
          TABLE
      ======================================================== */}

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
            min-w-[850px]
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
                  Type Name
                </th>

                <th className="px-6 py-4">
                  Description
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

              {paginatedTypes.length >
              0 ? (

                paginatedTypes.map(
                  (type) => (

                    <tr
                      key={type.id}
                      className="
                        border-b
                        last:border-0
                        hover:bg-gray-50
                      "
                    >

                      {/* TYPE */}

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
                            rounded-lg
                            bg-blue-50
                            text-xl
                          ">
                            {getIcon(type)}
                          </div>

                          <div>

                            <div className="
                              font-semibold
                              text-slate-800
                            ">
                              {type.name}
                            </div>

                          </div>

                        </div>

                      </td>


                      {/* DESCRIPTION */}

                      <td className="
                        max-w-[380px]
                        px-6
                        py-4
                        text-sm
                        text-gray-600
                      ">

                        <div className="
                          max-w-[380px]
                          truncate
                        ">
                          {type.description ||
                            "No description"}
                        </div>

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
                              type.status ===
                              "Active"
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
                                type.status ===
                                "Active"
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }
                            `}
                          />

                          {type.status}

                        </span>

                      </td>


                      {/* DATE */}

                      <td className="
                        px-6
                        py-4
                        text-sm
                        text-gray-600
                      ">
                        {formatDate(
                          type.created_at
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
                              openMenuId ===
                                type.id
                                ? null
                                : type.id
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
                          type.id && (

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
                                  type
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
                                size={19}
                              />

                              View

                            </button>


                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(
                                  null
                                );

                                onEdit?.(
                                  type
                                );
                              }}
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
                                size={19}
                              />

                              Edit

                            </button>


                            {/* ACTIVATE / DEACTIVATE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  type
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
                                  type.status ===
                                  "Active"
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }
                              `}
                            >

                              <BiArchiveIn
                                size={19}
                              />

                              {type.status ===
                              "Active"
                                ? "Deactivate"
                                : "Activate"}

                            </button>


                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  type
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
                                size={19}
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
                      text-gray-400
                    ">
                      No contract types found.
                    </p>

                    <p className="
                      mt-1
                      text-sm
                      text-gray-400
                    ">
                      Try changing your search or status filter.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* ========================================================
            FOOTER
        ======================================================== */}

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
              {filteredTypes.length ===
              0
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
                  paginatedTypes.length,
                filteredTypes.length
              )}
            </span>

            {" "}of{" "}

            <span className="
              font-medium
              text-gray-700
            ">
              {filteredTypes.length}
            </span>

            {" "}contract types

          </p>


          <div className="
            flex
            items-center
            gap-2
          ">

            <button
              type="button"
              disabled={
                safePage <= 1
              }
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.max(
                      1,
                      previous - 1
                    )
                )
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
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
                  setCurrentPage(
                    page
                  )
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
                  (previous) =>
                    Math.min(
                      totalPages,
                      previous + 1
                    )
                )
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
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


      {/* ========================================================
          VIEW MODAL
      ======================================================== */}

      {showDetails &&
        selectedType && (

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
            max-w-md
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
                  Contract Type
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-gray-500
                ">
                  Contract type details
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails(false)
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


            <div className="
              space-y-4
              p-6
            ">

              <div className="
                flex
                items-center
                gap-4
              ">

                <div className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-50
                  text-2xl
                ">
                  {getIcon(
                    selectedType
                  )}
                </div>

                <div>

                  <h3 className="
                    text-lg
                    font-bold
                    text-slate-800
                  ">
                    {selectedType.name}
                  </h3>

                  <span className={`
                    inline-flex
                    mt-1
                    rounded-full
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    ${
                      selectedType.status ===
                      "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}>
                    {selectedType.status}
                  </span>

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
                  Description
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-gray-700
                ">
                  {selectedType.description ||
                    "No description."}
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
                  Date Created
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-gray-700
                ">
                  {formatDate(
                    selectedType.created_at
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
                  setShowDetails(false)
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


export default ContractTypesTable;