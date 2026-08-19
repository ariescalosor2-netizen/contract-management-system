import { BiEdit, BiTrash } from "react-icons/bi";

function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">

        <thead className="bg-slate-50">

          <tr>

            <th className="text-left px-6 py-4 font-semibold">
              Name
            </th>

            <th className="text-left px-6 py-4 font-semibold">
              Email
            </th>

            <th className="text-left px-6 py-4 font-semibold">
              Role
            </th>

            <th className="text-left px-6 py-4 font-semibold">
              Status
            </th>

            <th className="text-right px-6 py-4 font-semibold">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {loading ? (

            <tr>
              <td
                colSpan="5"
                className="px-6 py-10 text-center text-slate-500"
              >
                Loading users...
              </td>
            </tr>

          ) : users.length === 0 ? (

            <tr>
              <td
                colSpan="5"
                className="px-6 py-10 text-center text-slate-500"
              >
                No users found.
              </td>
            </tr>

          ) : (

            users.map((user) => (

              <tr
                key={user.id}
                className="border-t hover:bg-slate-50 transition"
              >

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-11
                        h-11
                        rounded-full
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        font-semibold
                      "
                    >
                      {user.first_name?.charAt(0)}
                      {user.last_name?.charAt(0)}
                    </div>

                    <div>

                      <p className="font-semibold">
                        {user.first_name} {user.last_name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {user.email}
                      </p>

                    </div>

                  </div>

                </td>

                <td className="px-6 py-4">
                  {user.email}
                </td>

                <td className="px-6 py-4">

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">

                    {user.role}

                  </span>

                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>

                </td>

                <td className="px-6 py-4">

                  <div className="flex justify-end gap-2">

                    <button
                      onClick={() => onEdit(user)}
                      className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center"
                    >
                      <BiEdit />
                    </button>

                    <button
                      onClick={() => onDelete(user)}
                      className="w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                    >
                      <BiTrash />
                    </button>

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

        </table>
      </div>

    </div>
  );
}

export default UserTable;