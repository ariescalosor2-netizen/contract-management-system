import { useEffect, useRef, useState } from "react";
import {
  BiArchive,
  BiDotsVerticalRounded,
  BiShow,
  BiEdit,
} from "react-icons/bi";

function MilestonesTable({
  milestones = [],
  onView,
  onEdit,
  onArchive,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      case "Not Started":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const progressColor = (progress) => {
    const value = Number(progress || 0);

    if (value >= 100) return "bg-green-500";
    if (value >= 50) return "bg-blue-500";
    if (value > 0) return "bg-yellow-500";

    return "bg-gray-400";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600 text-sm">
              <th className="px-6 py-4">
                Milestone No.
              </th>
              <th className="px-4 py-4">
                Contract No.
              </th>
              <th className="px-4 py-4">
                Milestone
              </th>
              <th className="px-4 py-4">
                Due Date
              </th>
              <th className="px-4 py-4">
                Progress
              </th>
              <th className="px-4 py-4">
                Status
              </th>
              <th className="px-4 py-4 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {milestones.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No milestones found.
                </td>
              </tr>
            ) : (
              milestones.map((milestone) => {
                const progress = Number(
                  milestone.progress || 0
                );

                const isMenuOpen =
                  openMenuId === milestone.id;

                return (
                  <tr
                    key={milestone.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-5 font-medium text-blue-600">
                      {milestone.milestone_no}
                    </td>

                    <td className="px-4 py-5">
                      {milestone.contract_no || "—"}
                    </td>

                    <td className="px-4 py-5">
                      <p className="font-medium text-gray-800">
                        {milestone.title}
                      </p>

                      {milestone.description && (
                        <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          {milestone.description}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-5">
                      {formatDate(
                        milestone.due_date
                      )}
                    </td>

                    <td className="px-4 py-5 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <div className="w-36 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${progressColor(
                              progress
                            )}`}
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  progress,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-medium">
                          {progress}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(
                          milestone.status
                        )}`}
                      >
                        {milestone.status}
                      </span>
                    </td>

                    <td className="px-4 py-5">
                      <div
                        className="relative flex justify-center"
                        ref={
                          isMenuOpen
                            ? menuRef
                            : null
                        }
                      >
                        <button
                          type="button"
                          title="More actions"
                          aria-label={`More actions for ${
                            milestone.milestone_no
                          }`}
                          aria-haspopup="menu"
                          aria-expanded={isMenuOpen}
                          onClick={() =>
                            setOpenMenuId(
                              isMenuOpen
                                ? null
                                : milestone.id
                            )
                          }
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border transition ${
                            isMenuOpen
                              ? "border-blue-300 bg-blue-50 text-blue-600"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          }`}
                        >
                          <BiDotsVerticalRounded className="text-xl" />
                        </button>

                        {isMenuOpen && (
                          <div
                            role="menu"
                            className="absolute right-0 top-12 z-50 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-1"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                onView(
                                  milestone
                                );
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <BiShow className="text-lg text-blue-600" />
                              View
                            </button>

                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                onEdit(
                                  milestone
                                );
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <BiEdit className="text-lg text-gray-600" />
                              Edit
                            </button>

                            <div className="my-1 border-t border-gray-100" />

                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setOpenMenuId(null);
                                onArchive(
                                  milestone.id
                                );
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50"
                            >
                              <BiArchive className="text-lg" />
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 text-sm text-gray-500 border-t">
        Showing {milestones.length} milestone
        {milestones.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

export default MilestonesTable;