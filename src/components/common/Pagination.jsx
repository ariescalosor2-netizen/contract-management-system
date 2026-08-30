function Pagination({
  currentPage,
  totalItems,
  itemsPerPage = 15,
  onPageChange,
}) {
  const totalPages = Math.ceil(
    totalItems / itemsPerPage
  );

  if (totalPages <= 1) {
    return null;
  }

  const startItem =
    (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 text-sm text-gray-500">

      {/* Showing */}
      <span>
        Showing {startItem} to {endItem} of{" "}
        {totalItems} records
      </span>

      {/* Pagination */}
      <div className="flex items-center gap-2">

        {/* Previous */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &lt;
        </button>

        {/* Pages */}
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() =>
              onPageChange(page)
            }
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          type="button"
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &gt;
        </button>

      </div>
    </div>
  );
}

export default Pagination;