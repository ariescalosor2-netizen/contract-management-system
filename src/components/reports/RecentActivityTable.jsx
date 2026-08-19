import { recentActivities } from '../../data/reports';
import { BiDotsVerticalRounded } from 'react-icons/bi';

function RecentActivityTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b">
        <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>

        <p className="text-sm text-gray-500 mt-1">Latest contract-related activities.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px]">
        <thead className="bg-gray-50 border-b">
          <tr className="text-left text-gray-600 text-sm">
            <th className="px-6 py-4">Activity</th>
            <th>User</th>
            <th>Date</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {recentActivities.map((activity) => (
            <tr key={activity.id} className="border-b last:border-none hover:bg-gray-50 transition">
              <td className="px-6 py-5 font-medium">{activity.activity}</td>

              <td>{activity.user}</td>

              <td>{activity.date}</td>

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

      <div className="flex flex-col gap-3 px-6 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing 1 to {recentActivities.length} of {recentActivities.length} activities
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

export default RecentActivityTable;
