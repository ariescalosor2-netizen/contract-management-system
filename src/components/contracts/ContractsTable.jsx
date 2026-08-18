import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  BiDotsVerticalRounded,
  BiShow,
  BiEdit,
  BiTrash,
  BiChevronLeft,
  BiChevronRight,
} from "react-icons/bi";

import {
  getContracts,
  deleteContract,
} from "../../services/contractService";


const ITEMS_PER_PAGE = 10;


function ContractsTable({
  searchTerm = "",
  statusFilter = "All Status",
  typeFilter = "All Types",
  partyFilter = "All Parties",
  expiringFilter = false,
  onEdit,
  refreshTrigger = 0,
}) {

  const navigate = useNavigate();


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    contracts,
    setContracts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    openMenuId,
    setOpenMenuId,
  ] = useState(null);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  /*
  |--------------------------------------------------------------------------
  | LOAD CONTRACTS
  |--------------------------------------------------------------------------
  */

  const loadContracts = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getContracts();

      const data =
        response?.data ??
        response?.items ??
        response ??
        [];

      setContracts(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Failed to load contracts:",
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
          "You do not have permission to view contracts."
        );

      } else {

        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to load contracts."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadContracts();

  }, [refreshTrigger]);


  /*
  |--------------------------------------------------------------------------
  | RESET PAGINATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    setCurrentPage(1);

  }, [
    searchTerm,
    statusFilter,
    typeFilter,
    partyFilter,
    expiringFilter,
  ]);


  /*
  |--------------------------------------------------------------------------
  | VIEW CONTRACT
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  | This now opens ContractDetails.jsx
  | instead of the old ContractDetailsModal.
  |
  */

  const handleView = (contract) => {

    setOpenMenuId(null);

    if (!contract?.id) {

      console.error(
        "Cannot open contract: missing contract ID.",
        contract
      );

      alert(
        "Unable to open this contract because its ID is missing."
      );

      return;
    }

    navigate(
      `/contracts/${contract.id}`
    );

  };


  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const handleEdit = (
    contract
  ) => {

    setOpenMenuId(null);

    if (
      contract.status !== "Draft"
    ) {

      alert(
        "Only Draft contracts can be edited."
      );

      return;
    }

    if (onEdit) {

      onEdit(contract);

    }

  };


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = async (
    contract
  ) => {

    setOpenMenuId(null);


    if (
      contract.status !== "Draft"
    ) {

      alert(
        "Only Draft contracts can be deleted."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${contract.contract_no}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      await deleteContract(
        contract.id
      );

      await loadContracts();

      setCurrentPage(1);

    } catch (err) {

      console.error(
        "Failed to delete contract:",
        err
      );

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Failed to delete contract."
      );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | FILTER CONTRACTS
  |--------------------------------------------------------------------------
  */

  const filteredContracts =
    useMemo(() => {

      const search =
        String(
          searchTerm || ""
        )
          .trim()
          .toLowerCase();


      return contracts.filter(
        (contract) => {

          /*
          |--------------------------------------------------------------------------
          | SEARCH
          |--------------------------------------------------------------------------
          */

          const contractNo =
            String(
              contract.contract_no || ""
            ).toLowerCase();

          const title =
            String(
              contract.title || ""
            ).toLowerCase();


          const matchesSearch =
            !search ||
            contractNo.includes(search) ||
            title.includes(search);


          /*
          |--------------------------------------------------------------------------
          | STATUS
          |--------------------------------------------------------------------------
          */

          const matchesStatus =
            statusFilter ===
              "All Status" ||
            contract.status ===
              statusFilter;


          /*
          |--------------------------------------------------------------------------
          | CONTRACT TYPE
          |--------------------------------------------------------------------------
          */

          const matchesType =
            typeFilter ===
              "All Types" ||
            contract.contract_type_id ===
              typeFilter;


          /*
          |--------------------------------------------------------------------------
          | PARTY
          |--------------------------------------------------------------------------
          */

          const matchesParty =
            partyFilter ===
              "All Parties" ||
            contract.party_id ===
              partyFilter;


          /*
          |--------------------------------------------------------------------------
          | EXPIRING
          |--------------------------------------------------------------------------
          */

          let matchesExpiring =
            true;


          if (expiringFilter) {

            if (
              !contract.end_date
            ) {

              matchesExpiring =
                false;

            } else {

              const today =
                new Date();

              today.setHours(
                0,
                0,
                0,
                0
              );


              const endDate =
                new Date(
                  contract.end_date
                );

              endDate.setHours(
                0,
                0,
                0,
                0
              );


              const thirtyDays =
                new Date(
                  today
                );

              thirtyDays.setDate(
                thirtyDays.getDate() +
                30
              );


              matchesExpiring =
                endDate >= today &&
                endDate <= thirtyDays;

            }

          }


          return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesParty &&
            matchesExpiring
          );

        }
      );

    }, [
      contracts,
      searchTerm,
      statusFilter,
      typeFilter,
      partyFilter,
      expiringFilter,
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
        filteredContracts.length /
        ITEMS_PER_PAGE
      )
    );


  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );


  const startIndex =
    (
      safeCurrentPage -
      1
    ) *
    ITEMS_PER_PAGE;


  const paginatedContracts =
    filteredContracts.slice(
      startIndex,
      startIndex +
      ITEMS_PER_PAGE
    );


  /*
  |--------------------------------------------------------------------------
  | PAGINATION HANDLERS
  |--------------------------------------------------------------------------
  */

  const goToPreviousPage = () => {

    setCurrentPage(
      (page) =>
        Math.max(
          1,
          page - 1
        )
    );

  };


  const goToNextPage = () => {

    setCurrentPage(
      (page) =>
        Math.min(
          totalPages,
          page + 1
        )
    );

  };


  /*
  |--------------------------------------------------------------------------
  | STATUS BADGE
  |--------------------------------------------------------------------------
  */

  const badge = (
    status
  ) => {

    switch (status) {

      case "Active":

        return (
          "bg-green-100 text-green-700"
        );


      case "Approved":

        return (
          "bg-emerald-100 text-emerald-700"
        );


      case "Pending Approval":

        return (
          "bg-yellow-100 text-yellow-700"
        );


      case "Pending":

        return (
          "bg-yellow-100 text-yellow-700"
        );


      case "Draft":

        return (
          "bg-blue-100 text-blue-700"
        );


      case "Rejected":

        return (
          "bg-red-100 text-red-700"
        );


      case "Expired":

        return (
          "bg-gray-100 text-gray-600"
        );


      default:

        return (
          "bg-gray-100 text-gray-600"
        );

    }

  };


  /*
  |--------------------------------------------------------------------------
  | FORMAT DATE
  |--------------------------------------------------------------------------
  */

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "-";

    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "-";

    }


    return parsedDate.toLocaleDateString(
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
  | FORMAT VALUE
  |--------------------------------------------------------------------------
  */

  const formatValue = (
    value
  ) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "-";

    }


    const numericValue =
      Number(value);


    if (
      Number.isNaN(
        numericValue
      )
    ) {

      return "-";

    }


    return `₱${numericValue.toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

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
        p-10
        text-center
        shadow-sm
      ">

        <div className="
          text-gray-500
        ">

          Loading contracts...

        </div>

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
          onClick={loadContracts}
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


  /*
  |--------------------------------------------------------------------------
  | TABLE
  |--------------------------------------------------------------------------
  */

  return (

    <div className="
      rounded-xl
      border
      border-gray-200
      bg-white
      shadow-sm
    ">


      {/* =========================================================
          TABLE
      ========================================================== */}

      <div className="
        overflow-x-auto
      ">

        <table className="
          w-full
          min-w-[1050px]
        ">


          {/* =====================================================
              HEADER
          ====================================================== */}

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

              <th className="
                px-6
                py-4
              ">

                Contract

              </th>


              <th className="
                px-6
                py-4
              ">

                Type

              </th>


              <th className="
                px-6
                py-4
              ">

                Party

              </th>


              <th className="
                px-6
                py-4
              ">

                Start Date

              </th>


              <th className="
                px-6
                py-4
              ">

                End Date

              </th>


              <th className="
                px-6
                py-4
              ">

                Value

              </th>


              <th className="
                px-6
                py-4
              ">

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


          {/* =====================================================
              BODY
          ====================================================== */}

          <tbody>

            {paginatedContracts.length > 0 ? (

              paginatedContracts.map(
                (contract) => (

                  <tr
                    key={
                      contract.id
                    }
                    className="
                      border-b
                      last:border-0
                      hover:bg-gray-50
                    "
                  >


                    {/* =================================================
                        CONTRACT
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                    ">

                      <button
                        type="button"
                        onClick={() =>
                          handleView(
                            contract
                          )
                        }
                        className="
                          text-left
                        "
                        title="Open Contract Details"
                      >

                        <div className="
                          font-semibold
                          text-blue-600
                          hover:text-blue-800
                        ">

                          {
                            contract.contract_no
                          }

                        </div>


                        <div className="
                          mt-1
                          max-w-[260px]
                          truncate
                          text-sm
                          text-gray-600
                        ">

                          {
                            contract.title ||
                            "-"
                          }

                        </div>

                      </button>

                    </td>


                    {/* =================================================
                        TYPE
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-700
                    ">

                      {
                        contract.contract_type_name ||
                        "-"
                      }

                    </td>


                    {/* =================================================
                        PARTY
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-700
                    ">

                      {
                        contract.party_name ||
                        "-"
                      }

                    </td>


                    {/* =================================================
                        START DATE
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-600
                    ">

                      {
                        formatDate(
                          contract.start_date
                        )
                      }

                    </td>


                    {/* =================================================
                        END DATE
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                      text-sm
                      text-gray-600
                    ">

                      {
                        formatDate(
                          contract.end_date
                        )
                      }

                    </td>


                    {/* =================================================
                        VALUE
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                      text-sm
                      font-medium
                      text-gray-700
                    ">

                      {
                        formatValue(
                          contract.value
                        )
                      }

                    </td>


                    {/* =================================================
                        STATUS
                    ================================================= */}

                    <td className="
                      px-6
                      py-4
                    ">

                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          ${badge(
                            contract.status
                          )}
                        `}
                      >

                        {
                          contract.status
                        }

                      </span>

                    </td>


                    {/* =================================================
                        ACTIONS
                    ================================================= */}

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
                              contract.id
                              ? null
                              : contract.id
                          )
                        }
                        className="
                          rounded-lg
                          p-2
                          text-gray-500
                          hover:bg-gray-100
                          hover:text-gray-800
                        "
                        title="Actions"
                      >

                        <BiDotsVerticalRounded
                          size={22}
                        />

                      </button>


                      {/* =================================================
                          ACTION MENU
                      ================================================= */}

                      {openMenuId ===
                        contract.id && (

                        <div className="
                          absolute
                          right-6
                          top-12
                          z-30
                          w-52
                          overflow-hidden
                          rounded-xl
                          border
                          border-gray-200
                          bg-white
                          text-left
                          shadow-xl
                        ">


                          {/* =============================================
                              VIEW
                          ============================================== */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(
                                contract
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

                            View Details

                          </button>


                          {/* =============================================
                              EDIT
                          ============================================== */}

                          {contract.status ===
                            "Draft" && (

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  contract
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
                                size={19}
                              />

                              Edit

                            </button>

                          )}


                          {/* =============================================
                              DELETE
                          ============================================== */}

                          {contract.status ===
                            "Draft" && (

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  contract
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

                          )}

                        </div>

                      )}

                    </td>

                  </tr>

                )

              )

            ) : (

              <tr>

                <td
                  colSpan="8"
                  className="
                    px-6
                    py-14
                    text-center
                  "
                >

                  <div className="
                    text-gray-400
                  ">

                    No contracts found.

                  </div>


                  <p className="
                    mt-1
                    text-sm
                    text-gray-400
                  ">

                    Try changing your
                    search or filters.

                  </p>

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>


      {/* =========================================================
          PAGINATION
      ========================================================== */}

      {filteredContracts.length >
        0 && (

        <div className="
          flex
          items-center
          justify-between
          border-t
          border-gray-200
          px-6
          py-4
        ">


          <div className="
            text-sm
            text-gray-500
          ">

            Showing{" "}

            <span className="
              font-medium
              text-gray-700
            ">

              {
                startIndex + 1
              }

            </span>

            {" "}to{" "}

            <span className="
              font-medium
              text-gray-700
            ">

              {
                Math.min(
                  startIndex +
                    ITEMS_PER_PAGE,
                  filteredContracts.length
                )
              }

            </span>

            {" "}of{" "}

            <span className="
              font-medium
              text-gray-700
            ">

              {
                filteredContracts.length
              }

            </span>

            {" "}contracts

          </div>


          <div className="
            flex
            items-center
            gap-2
          ">

            <button
              type="button"
              onClick={
                goToPreviousPage
              }
              disabled={
                safeCurrentPage === 1
              }
              className="
                rounded-lg
                border
                border-gray-300
                p-2
                text-gray-600
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              title="Previous page"
            >

              <BiChevronLeft
                size={20}
              />

            </button>


            <span className="
              px-3
              text-sm
              font-medium
              text-gray-700
            ">

              Page{" "}

              {
                safeCurrentPage
              }

              {" "}of{" "}

              {
                totalPages
              }

            </span>


            <button
              type="button"
              onClick={
                goToNextPage
              }
              disabled={
                safeCurrentPage ===
                totalPages
              }
              className="
                rounded-lg
                border
                border-gray-300
                p-2
                text-gray-600
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              title="Next page"
            >

              <BiChevronRight
                size={20}
              />

            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default ContractsTable;