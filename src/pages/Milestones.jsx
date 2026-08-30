import { useEffect, useMemo, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import MilestoneCards from "../components/milestones/MilestoneCards";
import MilestoneSearchFilters from "../components/milestones/MilestoneSearchFilters";
import MilestonesTable from "../components/milestones/MilestonesTable";

import {
  getMilestones,
  getArchivedMilestones,
  createMilestone,
  updateMilestone,
  archiveMilestone,
  restoreMilestone,
} from "../services/milestoneService";

import { getContracts } from "../services/contractService";

import {
  getMilestoneTasks,
  createMilestoneTask,
  updateMilestoneTask,
  toggleMilestoneTask,
  deleteMilestoneTask,
} from "../services/milestoneTaskService";



function Milestones() {
  // ============================================================
  // DATA
  // ============================================================

  const [milestones, setMilestones] = useState([]);
  const [archivedMilestones, setArchivedMilestones] = useState([]);
  const [contracts, setContracts] = useState([]);

  const [activeTab, setActiveTab] = useState("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");


  // ============================================================
  // MODALS
  // ============================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);


  // ============================================================
  // SELECTED MILESTONE
  // ============================================================

  const [selectedMilestone, setSelectedMilestone] =
    useState(null);


  // ============================================================
  // MILESTONE TASKS
  // ============================================================

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const emptyTaskForm = {
    title: "",
    description: "",
  };

  const [taskForm, setTaskForm] = useState(emptyTaskForm);


  // ============================================================
  // FILTERS
  // ============================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [contractFilter, setContractFilter] =
    useState("All Contracts");

  const [progressFilter, setProgressFilter] =
    useState("All Progress");


  // ============================================================
  // PAGINATION
  // ============================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 10;


  // ============================================================
  // CREATE FORM
  // ============================================================

  const emptyCreateForm = {
    contract_id: "",
    title: "",
    description: "",
    due_date: "",
  };

  const [createForm, setCreateForm] =
    useState(emptyCreateForm);


  // ============================================================
  // EDIT FORM
  // ============================================================

  const emptyEditForm = {
    title: "",
    description: "",
    due_date: "",
  };

  const [editForm, setEditForm] =
    useState(emptyEditForm);


  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        milestonesResponse,
        archivedResponse,
        contractsResponse,
      ] = await Promise.all([
        getMilestones(),
        getArchivedMilestones(),
        getContracts(),
      ]);

      const freshMilestones =
        milestonesResponse?.data || [];

      const freshArchivedMilestones =
        archivedResponse?.data || [];

      const freshContracts =
        contractsResponse?.data || [];

      setMilestones(freshMilestones);
      setArchivedMilestones(freshArchivedMilestones);
      setContracts(freshContracts);

      return {
        active: freshMilestones,
        archived: freshArchivedMilestones,
      };
    } catch (err) {
      console.error(
        "Failed to load milestones:",
        err
      );

      if (err?.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load milestones."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  // ============================================================
  // CONTRACT OPTIONS
  // ============================================================

  const contractOptions = useMemo(() => {
    return [
      ...new Set(
        milestones
          .map(
            (milestone) =>
              milestone.contract_no
          )
          .filter(Boolean)
      ),
    ];
  }, [milestones]);


  // ============================================================
  // FILTER
  // ============================================================

  const visibleMilestones =
    activeTab === "active"
      ? milestones
      : archivedMilestones;

  const filteredMilestones = useMemo(() => {
    return visibleMilestones.filter((milestone) => {
      const searchText =
        search.toLowerCase().trim();

      const milestoneNo =
        String(
          milestone.milestone_no || ""
        ).toLowerCase();

      const title =
        String(
          milestone.title || ""
        ).toLowerCase();

      const contractNo =
        String(
          milestone.contract_no || ""
        ).toLowerCase();

      const matchesSearch =
        !searchText ||
        milestoneNo.includes(searchText) ||
        title.includes(searchText) ||
        contractNo.includes(searchText);

      const matchesStatus =
        statusFilter === "All Status" ||
        milestone.status === statusFilter;

      const matchesContract =
        contractFilter === "All Contracts" ||
        milestone.contract_no === contractFilter;

      const progress =
        Number(milestone.progress || 0);

      let matchesProgress = true;

      if (progressFilter === "0–25%") {
        matchesProgress =
          progress >= 0 && progress <= 25;
      }

      if (progressFilter === "26–50%") {
        matchesProgress =
          progress >= 26 && progress <= 50;
      }

      if (progressFilter === "51–75%") {
        matchesProgress =
          progress >= 51 && progress <= 75;
      }

      if (progressFilter === "76–100%") {
        matchesProgress =
          progress >= 76 && progress <= 100;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesContract &&
        matchesProgress
      );
    });
  }, [
    visibleMilestones,
    search,
    statusFilter,
    contractFilter,
    progressFilter,
  ]);


  // ============================================================
  // PAGINATED DATA
  // ============================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredMilestones.length /
          itemsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedMilestones =
    filteredMilestones.slice(
      (safeCurrentPage - 1) *
        itemsPerPage,
      safeCurrentPage *
        itemsPerPage
    );


  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
    search,
    statusFilter,
    contractFilter,
    progressFilter,
  ]);


  // ============================================================
  // CREATE FORM CHANGE
  // ============================================================

  const handleCreateChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setCreateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ============================================================
  // EDIT FORM CHANGE
  // ============================================================

  const handleEditChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!createForm.contract_id) {
        setError(
          "Please select a contract."
        );
        return;
      }

      if (!createForm.title.trim()) {
        setError(
          "Please enter a milestone title."
        );
        return;
      }

      if (!createForm.due_date) {
        setError(
          "Please select a due date."
        );
        return;
      }

      await createMilestone({
        contract_id:
          createForm.contract_id,

        title:
          createForm.title.trim(),

        description:
          createForm.description.trim() ||
          null,

        due_date:
          createForm.due_date,

        // Progress and status are calculated from milestone tasks.
      });

      setCreateForm(
        emptyCreateForm
      );

      setShowCreateModal(false);

      await loadData();
    } catch (err) {
      console.error(
        "Failed to create milestone:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create milestone."
      );
    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // OPEN EDIT
  // ============================================================

  const openEdit = async (milestone) => {
    setSelectedMilestone(milestone);

    setEditForm({
      title:
        milestone.title || "",

      description:
        milestone.description || "",

      due_date:
        milestone.due_date
          ? String(
              milestone.due_date
            ).slice(0, 10)
          : "",
    });

    setTasks([]);
    setError("");
    setShowEditModal(true);

    // Tasks are managed from Edit Milestone.
    await loadTasks(milestone.id);
  };


  // ============================================================
  // UPDATE
  // ============================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedMilestone) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (!editForm.title.trim()) {
        setError(
          "Please enter a milestone title."
        );
        return;
      }

      await updateMilestone(
        selectedMilestone.id,
        {
          title:
            editForm.title.trim(),

          description:
            editForm.description.trim() ||
            null,

          due_date:
            editForm.due_date || null,

          // Progress and status are calculated from milestone tasks.
        }
      );

      setShowEditModal(false);
      setSelectedMilestone(null);

      await loadData();
    } catch (err) {
      console.error(
        "Failed to update milestone:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update milestone."
      );
    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // VIEW
  // ============================================================

  const loadTasks = async (milestoneId) => {
    if (!milestoneId) {
      setTasks([]);
      return [];
    }

    try {
      setTasksLoading(true);

      const response =
        await getMilestoneTasks(milestoneId);

      // The API may return either { data: [...] } or
      // an Axios response containing { data: { data: [...] } }.
      // Normalize both shapes so the checklist always receives an array.
      const loadedTasks =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : [];

      setTasks(loadedTasks);

      return loadedTasks;
    } catch (err) {
      console.error(
        "Failed to load milestone tasks:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load milestone tasks."
      );

      return [];
    } finally {
      setTasksLoading(false);
    }
  };


  const openView = (milestone) => {
    setSelectedMilestone(milestone);
    setTasks([]);
    setError("");
    setShowViewModal(true);
  };


  const handleTaskChange = (e) => {
    const { name, value } = e.target;

    setTaskForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const openAddTask = () => {
    if (selectedMilestone?.is_archived) return;

    setEditingTask(null);
    setTaskForm(emptyTaskForm);
    setError("");
    setShowTaskForm(true);
  };


  const openEditTask = (task) => {
    if (selectedMilestone?.is_archived) return;

    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
    });

    setError("");
    setShowTaskForm(true);
  };


  const handleSaveTask = async (e) => {
    e.preventDefault();

    if (!selectedMilestone) return;

    if (selectedMilestone.is_archived) {
      setError("Archived milestones are read-only. Restore the milestone to manage its tasks.");
      return;
    }

    if (!taskForm.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setTaskSaving(true);
      setError("");

      if (editingTask) {
        await updateMilestoneTask(
          editingTask.id,
          {
            title: taskForm.title.trim(),
            description:
              taskForm.description.trim() || null,
          }
        );
      } else {
        await createMilestoneTask(
          selectedMilestone.id,
          {
            title: taskForm.title.trim(),
            description:
              taskForm.description.trim() || null,
          }
        );
      }

      setTaskForm(emptyTaskForm);
      setEditingTask(null);
      setShowTaskForm(false);

      const refreshedData =
        await loadData();

      await loadTasks(selectedMilestone.id);

      // loadData() returns { active, archived }, not an array.
      // Use the active milestone list when refreshing the selected milestone.
      const refreshed =
        refreshedData?.active?.find(
          (item) =>
            item.id === selectedMilestone.id
        );

      if (refreshed) {
        setSelectedMilestone(refreshed);
      }
    } catch (err) {
      console.error(
        "Failed to save milestone task:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save milestone task."
      );
    } finally {
      setTaskSaving(false);
    }
  };


  const handleToggleTask = async (taskId) => {
    if (!selectedMilestone) return;

    if (selectedMilestone.is_archived) {
      setError("Archived milestones are read-only. Restore the milestone to manage its tasks.");
      return;
    }

    try {
      setTaskSaving(true);
      setError("");

      await toggleMilestoneTask(taskId);

      const refreshedData =
        await loadData();

      await loadTasks(selectedMilestone.id);

      // loadData() returns { active, archived }, not an array.
      // Use the active milestone list when refreshing the selected milestone.
      const refreshed =
        refreshedData?.active?.find(
          (item) =>
            item.id === selectedMilestone.id
        );

      if (refreshed) {
        setSelectedMilestone(refreshed);
      }
    } catch (err) {
      console.error(
        "Failed to toggle milestone task:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update task."
      );
    } finally {
      setTaskSaving(false);
    }
  };


  const handleDeleteTask = async (taskId) => {
    if (!selectedMilestone) return;

    if (selectedMilestone.is_archived) {
      setError("Archived milestones are read-only. Restore the milestone to manage its tasks.");
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this task?"
      );

    if (!confirmed) return;

    try {
      setTaskSaving(true);
      setError("");

      await deleteMilestoneTask(taskId);

      const refreshedData =
        await loadData();

      await loadTasks(selectedMilestone.id);

      // loadData() returns { active, archived }, not an array.
      // Use the active milestone list when refreshing the selected milestone.
      const refreshed =
        refreshedData?.active?.find(
          (item) =>
            item.id === selectedMilestone.id
        );

      if (refreshed) {
        setSelectedMilestone(refreshed);
      }
    } catch (err) {
      console.error(
        "Failed to delete milestone task:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete task."
      );
    } finally {
      setTaskSaving(false);
    }
  };


  // ============================================================
  // ARCHIVE
  // ============================================================

  const handleArchive = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to archive this milestone? It will be removed from the active milestone list but kept in the database."
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await archiveMilestone(id);
      await loadData();
    } catch (err) {
      console.error(
        "Failed to archive milestone:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to archive milestone."
      );
    }
  };

  // ============================================================
  // RESTORE ARCHIVED MILESTONE
  // ============================================================

  const handleRestore = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to restore this milestone?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await restoreMilestone(id);

      // Refresh both Active and Archived lists.
      await loadData();

      setActiveTab("active");
    } catch (err) {
      console.error(
        "Failed to restore milestone:",
        err
      );

      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to restore milestone."
      );
    }
  };


  // ============================================================
  // KPI CARD FILTER
  // ============================================================

  const handleKpiClick = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };


  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setContractFilter("All Contracts");
    setProgressFilter("All Progress");
    setCurrentPage(1);
  };


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  };


  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-yellow-100 text-yellow-700";

      case "Overdue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <MainLayout>

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Milestones
          </h1>

          <p className="text-gray-500 mt-1">
            Track project milestones and contract progress.
          </p>
        </div>

        {activeTab === "active" && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setCreateForm(
                emptyCreateForm
              );
              setShowCreateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition"
          >
            + New Milestone
          </button>
        )}
      </div>


      {/* ========================================================
          ACTIVE / ARCHIVED TABS
      ========================================================= */}

      <div className="mb-6">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab("active");
              setCurrentPage(1);
              clearFilters();
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "active"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Active
            <span className="ml-2 text-xs opacity-80">
              {milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("archived");
              setCurrentPage(1);
              clearFilters();
            }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "archived"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Archived
            <span className="ml-2 text-xs opacity-80">
              {archivedMilestones.length}
            </span>
          </button>
        </div>
      </div>


      {/* CARDS */}

      {activeTab === "active" && (
          <MilestoneCards
          milestones={milestones}
          activeStatus={statusFilter}
          onStatusSelect={handleKpiClick}
        />
      )}


      {/* FILTERS */}

      {activeTab === "active" && (
        <MilestoneSearchFilters
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        contractFilter={contractFilter}
        setContractFilter={
          setContractFilter
        }
        progressFilter={progressFilter}
        setProgressFilter={
          setProgressFilter
        }
        contractOptions={
          contractOptions
        }
          onClear={clearFilters}
        />
      )}


      {/* ERROR */}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          <p className="font-semibold">
            Unable to complete request
          </p>

          <p className="text-sm mt-1">
            {error}
          </p>

          <button
            type="button"
            onClick={loadData}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}


      {/* TABLE */}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500">
            Loading milestones...
          </p>
        </div>
      ) : (
        <>
          {activeTab === "active" ? (
            <>
              <MilestonesTable
                milestones={
                  paginatedMilestones
                }
                onView={openView}
                onEdit={openEdit}
                onArchive={handleArchive}
              />
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Archived Milestones
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Archived milestones are kept in the database and can be restored.
                  </p>
                </div>

                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                  {archivedMilestones.length} Archived
                </span>
              </div>

              {filteredMilestones.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xl">
                    ✓
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-4">
                    No archived milestones
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Archived milestones will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {paginatedMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="px-6 py-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {milestone.milestone_no}
                            </span>

                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                              Archived
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-slate-800 mt-2">
                            {milestone.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {milestone.contract_no || "No contract"}
                            {milestone.contract_title
                              ? ` — ${milestone.contract_title}`
                              : ""}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            Due {formatDate(milestone.due_date)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openView(milestone)}
                            className="px-3.5 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRestore(milestone.id)}
                            className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PAGINATION */}

          {filteredMilestones.length >
            itemsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Showing{" "}
                {(safeCurrentPage - 1) *
                  itemsPerPage +
                  1}{" "}
                to{" "}
                {Math.min(
                  safeCurrentPage *
                    itemsPerPage,
                  filteredMilestones.length
                )}{" "}
                of{" "}
                {filteredMilestones.length}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {safeCurrentPage}
                </span>

                <button
                  type="button"
                  disabled={
                    safeCurrentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                  className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}


      {/* ========================================================
          CREATE MODAL
      ========================================================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">

            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  New Milestone
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create a new milestone for a contract.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
                disabled={saving}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>


            <form
              onSubmit={handleCreate}
              className="p-6 space-y-5"
            >

              {/* AUTO NUMBER */}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase">
                  Milestone Number
                </p>

                <p className="text-lg font-bold text-slate-800 mt-1">
                  Automatically Generated
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  The system will automatically assign the next milestone number.
                </p>
              </div>


              {/* CONTRACT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract
                </label>

                <select
                  name="contract_id"
                  value={
                    createForm.contract_id
                  }
                  onChange={
                    handleCreateChange
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">
                    Select contract
                  </option>

                  {contracts.map(
                    (contract) => (
                      <option
                        key={contract.id}
                        value={contract.id}
                      >
                        {contract.contract_no}
                        {contract.title
                          ? ` — ${contract.title}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              </div>


              {/* TITLE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    createForm.title
                  }
                  onChange={
                    handleCreateChange
                  }
                  placeholder="e.g. Initial Payment"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>


              {/* DESCRIPTION */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    createForm.description
                  }
                  onChange={
                    handleCreateChange
                  }
                  rows="3"
                  placeholder="Describe this milestone..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>


              {/* DUE DATE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>

                <input
                  type="date"
                  name="due_date"
                  value={createForm.due_date}
                  onChange={handleCreateChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>


              {/* TASK NOTE */}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-700">
                  Progress and status are task-based
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Add tasks after creating the milestone. The system will calculate milestone progress and status from the tasks.
                </p>
              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  disabled={saving}
                  className="px-5 py-2.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Creating..."
                    : "Create Milestone"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ========================================================
          EDIT MODAL
      ========================================================= */}

      {showEditModal &&
        selectedMilestone && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">

              <div className="flex items-center justify-between px-6 py-5 border-b">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Edit Milestone
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedMilestone.milestone_no}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                  disabled={saving}
                  className="text-2xl text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>


              <form
                onSubmit={handleUpdate}
                className="p-6 space-y-5"
              >

                <div className="bg-gray-50 border rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Milestone Number
                  </p>

                  <p className="font-bold text-slate-800 mt-1">
                    {selectedMilestone.milestone_no}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Milestone numbers cannot be changed.
                  </p>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Milestone Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      editForm.title
                    }
                    onChange={
                      handleEditChange
                    }
                    required
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      editForm.description
                    }
                    onChange={
                      handleEditChange
                    }
                    rows="3"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date
                    </label>

                    <input
                      type="date"
                      name="due_date"
                      value={
                        editForm.due_date
                      }
                      onChange={
                        handleEditChange
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>


                {/* ========================================================
                    TASKS / CHECKLIST - MANAGED FROM EDIT
                ========================================================= */}

                <section className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-3 pt-5 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Tasks / Checklist
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Add, edit, complete, or delete tasks for this milestone.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={openAddTask}
                      disabled={taskSaving}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      <span className="text-base leading-none">+</span>
                      Add Task
                    </button>
                  </div>

                  {tasksLoading ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 py-8 text-center">
                      <p className="text-sm text-gray-500">
                        Loading tasks...
                      </p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-7 text-center">
                      <div className="mx-auto h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                        ✓
                      </div>

                      <p className="text-sm font-medium text-slate-700 mt-3">
                        No tasks yet
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Add checklist items to track this milestone.
                      </p>

                      <button
                        type="button"
                        onClick={openAddTask}
                        disabled={taskSaving}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
                      >
                        + Add your first task
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {tasks.map((task, index) => (
                        <div
                          key={task.id}
                          className={`group rounded-xl border p-4 transition ${
                            task.is_completed
                              ? "border-green-200 bg-green-50/40"
                              : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <label className="pt-0.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(task.is_completed)}
                                onChange={() =>
                                  handleToggleTask(task.id)
                                }
                                disabled={taskSaving}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                              />
                            </label>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-gray-400 mt-0.5">
                                  {String(index + 1).padStart(2, "0")}
                                </span>

                                <div className="min-w-0">
                                  <p
                                    className={`text-sm font-semibold ${
                                      task.is_completed
                                        ? "text-gray-400 line-through"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {task.title}
                                  </p>

                                  {task.description && (
                                    <p className="text-xs text-gray-500 mt-1 leading-5">
                                      {task.description}
                                    </p>
                                  )}

                                  {task.is_completed && (
                                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => openEditTask(task)}
                                disabled={taskSaving}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={taskSaving}
                                className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>


                <div className="flex justify-end gap-3 pt-4 border-t">

                  <button
                    type="button"
                    onClick={() =>
                      setShowEditModal(false)
                    }
                    disabled={saving}
                    className="px-5 py-2.5 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}


      {/* ========================================================
          VIEW DETAILS MODAL
      ========================================================= */}

      {showViewModal &&
        selectedMilestone && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-3xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-100">

              {/* HEADER */}
              <div className="px-6 py-5 border-b bg-white sticky top-0 z-10">
                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-slate-800">
                        Milestone Details
                      </h2>

                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {selectedMilestone.milestone_no}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="h-9 w-9 shrink-0 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-xl transition"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
              </div>


              {/* BODY */}
              <div className="overflow-y-auto max-h-[calc(92vh-80px)]">

                <div className="p-6 space-y-6">

                  {/* BASIC INFORMATION */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Milestone Information
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Contract and milestone details
                        </p>
                      </div>

                      {selectedMilestone.is_archived ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                          Archived
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                            selectedMilestone.status
                          )}`}
                        >
                          {selectedMilestone.status}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <p className="text-xs font-medium text-gray-500">
                          Milestone No.
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {selectedMilestone.milestone_no}
                        </p>
                      </div>

                      <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                        <p className="text-xs font-medium text-gray-500">
                          Contract No.
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {selectedMilestone.contract_no || "—"}
                        </p>
                        {selectedMilestone.contract_title && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {selectedMilestone.contract_title}
                          </p>
                        )}
                      </div>

                    </div>
                  </section>


                  {/* TITLE + DESCRIPTION */}
                  <section className="rounded-xl border border-gray-200 p-5">

                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Milestone
                    </p>

                    <h3 className="text-lg font-bold text-slate-800 mt-1">
                      {selectedMilestone.title}
                    </h3>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Description
                      </p>

                      <p className="text-sm text-gray-600 mt-1.5 leading-6">
                        {selectedMilestone.description ||
                          "No description provided."}
                      </p>
                    </div>

                  </section>


                  {/* PROGRESS SUMMARY */}
                  <section>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Due Date
                            </p>
                            <p className="text-sm font-semibold text-slate-800 mt-1">
                              {formatDate(selectedMilestone.due_date)}
                            </p>
                          </div>

                          <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                            <svg
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-gray-500">
                              Progress
                            </p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">
                              {Number(selectedMilestone.progress || 0)}%
                            </p>
                          </div>

                          <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            %
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    Number(selectedMilestone.progress || 0)
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </section>


                  {/* TASKS ARE MANAGED IN EDIT */}
                  <section className="pt-1">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 shrink-0 rounded-lg bg-white border border-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          ✓
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            Tasks / Checklist
                          </h3>

                          <p className="text-xs text-gray-600 mt-1 leading-5">
                            Tasks and checklist items are managed from the Edit Milestone button.
                          </p>

                          {!selectedMilestone.is_archived && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowViewModal(false);
                                openEdit(selectedMilestone);
                              }}
                              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                            >
                              Go to Edit Milestone
                            </button>
                          )}

                          {selectedMilestone.is_archived && (
                            <p className="text-xs text-gray-500 mt-3">
                              Restore this milestone first if you need to manage its tasks.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                </div>


                {/* FOOTER */}
                <div className="px-6 py-4 border-t bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">

                  <button
                    type="button"
                    onClick={() => setShowViewModal(false)}
                    className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                  >
                    Close
                  </button>

                  {!selectedMilestone.is_archived && (
                    <button
                      type="button"
                      onClick={async () => {
                        setShowViewModal(false);
                        await handleArchive(selectedMilestone.id);
                      }}
                      className="px-5 py-2.5 border border-red-200 bg-white text-red-600 rounded-lg hover:bg-red-50 font-medium transition"
                    >
                      Archive
                    </button>
                  )}

                  {selectedMilestone.is_archived && (
                    <button
                      type="button"
                      onClick={async () => {
                        setShowViewModal(false);
                        await handleRestore(selectedMilestone.id);
                      }}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                    >
                      Restore
                    </button>
                  )}

                  {!selectedMilestone.is_archived && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowViewModal(false);
                        openEdit(selectedMilestone);
                      }}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                    >
                      Edit Milestone
                    </button>
                  )}

                </div>

              </div>
            </div>
          </div>
        )}

      {/* ========================================================
          TASK FORM MODAL
      ========================================================= */}

      {showTaskForm &&
        selectedMilestone && (
          <div className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

              <div className="px-6 py-5 border-b bg-white">
                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      ✓
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-800">
                        {editingTask ? "Edit Task" : "Add Task"}
                      </h2>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedMilestone.milestone_no}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    disabled={taskSaving}
                    className="h-9 w-9 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-xl transition disabled:opacity-50"
                    aria-label="Close"
                  >
                    ×
                  </button>

                </div>
              </div>


              <form
                onSubmit={handleSaveTask}
                className="p-6"
              >

                <div className="space-y-5">

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Task Title
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={taskForm.title}
                      onChange={handleTaskChange}
                      placeholder="e.g. Submit final documents"
                      required
                      autoFocus
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                      <span className="text-gray-400 font-normal ml-1">
                        (Optional)
                      </span>
                    </label>

                    <textarea
                      name="description"
                      value={taskForm.description}
                      onChange={handleTaskChange}
                      rows="4"
                      placeholder="Add a short description or instructions..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none transition"
                    />
                  </div>


                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                    <p className="text-xs font-semibold text-blue-800">
                      Task-based progress
                    </p>

                    <p className="text-xs text-blue-700/80 mt-1 leading-5">
                      Marking this task as completed will automatically update
                      the milestone's progress and status.
                    </p>
                  </div>

                </div>


                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-6 mt-6 border-t">

                  <button
                    type="button"
                    onClick={() => setShowTaskForm(false)}
                    disabled={taskSaving}
                    className="px-5 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={taskSaving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
                  >
                    {taskSaving
                      ? "Saving..."
                      : editingTask
                        ? "Save Changes"
                        : "Add Task"}
                  </button>

                </div>

              </form>
            </div>
          </div>
        )}

    </MainLayout>
  );
}

export default Milestones;