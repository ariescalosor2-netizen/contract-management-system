import amendments from '../../data/amendments';
import { BiDotsVerticalRounded } from 'react-icons/bi';

function AmendmentsTable() {
  const statusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';

      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';

      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-gray-600 text-sm">
            <th className="px-6 py-4">Amendment No.</th>
            <th>Contract No.</th>
            <th>Amendment Title</th>
            <th>Requested By</th>
            <th>Amendment Date</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {amendments.map((amendment) => (
            <tr
              key={amendment.id}
              className="border-b last:border-none hover:bg-gray-50 transition"
            >
              <td className="px-6 py-5 font-medium text-blue-600">{amendment.amendmentNo}</td>

              <td>{amendment.contractNo}</td>

              <td>{amendment.title}</td>

              <td>{amendment.requestedBy}</td>

              <td>{amendment.amendmentDate}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                    amendment.status
                  )}`}
                >
                  {amendment.status}
                </span>
              </td>

              <td>
                <div className="flex justify-center">
                  <button className="text-xl text-gray-500 hover:text-gray-800">
                    <BiDotsVerticalRounded />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing 1 to {amendments.length} of {amendments.length} amendments
        </span>

        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-lg border hover:bg-gray-100">&lt;</button>

          <button className="w-9 h-9 rounded-lg bg-blue-600 text-white">1</button>

          <button className="w-9 h-9 rounded-lg border hover:bg-gray-100">&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default AmendmentsTable;