import api from "./api";

// ============================================================
// GET TASKS BY MILESTONE
// ============================================================

export const getMilestoneTasks = async (milestoneId) => {
  const response = await api.get(
    `/milestone-tasks/milestone/${milestoneId}`
  );

  return response.data;
};


// ============================================================
// CREATE TASK
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
// UPDATE TASK
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
// DELETE TASK
// ============================================================

export const deleteMilestoneTask = async (
  taskId
) => {
  const response = await api.delete(
    `/milestone-tasks/${taskId}`
  );

  return response.data;
};