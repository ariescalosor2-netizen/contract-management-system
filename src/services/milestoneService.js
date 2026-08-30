import api from "./api";


// ============================================================
// GET ALL ACTIVE MILESTONES
// ============================================================

export const getMilestones = async () => {
  const response = await api.get(
    "/milestones/"
  );

  return response.data;
};


// ============================================================
// GET MILESTONES BY CONTRACT
// ============================================================

export const getMilestonesByContract = async (
  contractId
) => {
  const response = await api.get(
    `/milestones/contract/${contractId}`
  );

  return response.data;
};


// ============================================================
// GET ARCHIVED MILESTONES
// ============================================================

export const getArchivedMilestones = async () => {
  const response = await api.get(
    "/milestones/archived"
  );

  return response.data;
};


// ============================================================
// GET SINGLE MILESTONE
// ============================================================

export const getMilestone = async (
  milestoneId
) => {
  const response = await api.get(
    `/milestones/${milestoneId}`
  );

  return response.data;
};


// ============================================================
// CREATE MILESTONE
// ============================================================

export const createMilestone = async (
  milestoneData
) => {
  const response = await api.post(
    "/milestones/",
    milestoneData
  );

  return response.data;
};


// ============================================================
// UPDATE MILESTONE
// ============================================================

export const updateMilestone = async (
  milestoneId,
  milestoneData
) => {
  const response = await api.put(
    `/milestones/${milestoneId}`,
    milestoneData
  );

  return response.data;
};


// ============================================================
// ARCHIVE MILESTONE
// ============================================================

export const archiveMilestone = async (
  milestoneId
) => {
  const response = await api.patch(
    `/milestones/${milestoneId}/archive`
  );

  return response.data;
};


// ============================================================
// RESTORE MILESTONE
// ============================================================

export const restoreMilestone = async (
  milestoneId
) => {
  const response = await api.patch(
    `/milestones/${milestoneId}/restore`
  );

  return response.data;
};


// ============================================================
// GET MILESTONE TASKS
// ============================================================

export const getMilestoneTasks = async (
  milestoneId
) => {
  const response = await api.get(
    `/milestone-tasks/milestone/${milestoneId}`
  );

  return response.data;
};


// ============================================================
// CREATE MILESTONE TASK
// ============================================================

export const createMilestoneTask = async (
  milestoneId,
  taskData
) => {
  const response = await api.post(
    `/milestone-tasks/milestone/${milestoneId}`,
    taskData
  );

  return response.data;
};


// ============================================================
// UPDATE MILESTONE TASK
// ============================================================

export const updateMilestoneTask = async (
  taskId,
  taskData
) => {
  const response = await api.put(
    `/milestone-tasks/${taskId}`,
    taskData
  );

  return response.data;
};


// ============================================================
// TOGGLE TASK COMPLETION
// ============================================================

export const toggleMilestoneTask = async (
  taskId
) => {
  const response = await api.patch(
    `/milestone-tasks/${taskId}/toggle`
  );

  return response.data;
};


// ============================================================
// DELETE MILESTONE TASK
// ============================================================

export const deleteMilestoneTask = async (
  taskId
) => {
  const response = await api.delete(
    `/milestone-tasks/${taskId}`
  );

  return response.data;
};