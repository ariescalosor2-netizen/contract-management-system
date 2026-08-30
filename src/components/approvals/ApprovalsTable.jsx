import { BiDotsVerticalRounded } from 'react-icons/bi';

function ApprovalsTable() {
  const priorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';

      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';

      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const approvalBadge = (type) => {
    switch (type) {
      case 'New Contract':
        return 'bg-blue-100 text-blue-700';

      case 'Renewal':
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-purple-100 text-purple-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-gray-600 text-sm">
            <th className="px-6 py-4">
              <input type="checkbox" />
            </th>

            <th>Contract No.</th>

            <th>Title</th>

            <th>Party</th>

            <th>Approval Type</th>

            <th>Submitted By</th>

            <th>Submitted Date</th>

            <th>Priority</th>

            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {approvals.map((approval) => (
            <tr key={approval.id} className="border-b hover:bg-gray-50 transition">
              <td className="px-6 py-5">
                <input type="checkbox" />
              </td>

              <td className="font-medium text-blue-600">{approval.contractNo}</td>

              <td>{approval.title}</td>

              <td>{approval.party}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${approvalBadge(
                    approval.approvalType
                  )}`}
                >
                  {approval.approvalType}
                </span>
              </td>

              <td>{approval.submittedBy}</td>

              <td>{approval.submittedDate}</td>

              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${priorityBadge(
                    approval.priority
                  )}`}
                >
                  {approval.priority}
                </span>
              </td>

              <td>
                <div className="flex justify-center items-center gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                    Review
                  </button>

                  <button className="text-xl text-gray-500 hover:text-black">
                    <BiDotsVerticalRounded />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing 1 to {approvals.length} of {approvals.length} approvals
        </span>

        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-lg border">&lt;</button>

          <button className="w-9 h-9 rounded-lg bg-blue-600 text-white">1</button>

          <button className="w-9 h-9 rounded-lg border">&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default ApprovalsTable;
