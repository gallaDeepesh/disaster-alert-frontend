// responder-service.js
// All API calls for the Responder Dashboard
// Assumes apiService has .get(), .post(), .put() returning { data }

import apiService from "./api.js"; // adjust path to your existing api service

const responderService = {
  // ── Alerts ──────────────────────────────────────────
  getActiveAlerts: () =>
    apiService.get("/api/responder/alerts"),

  acknowledgeAlert: (alertId) =>
    apiService.post(`/api/responder/acknowledge/${alertId}`, {}),

  // ── Tasks ───────────────────────────────────────────
  getMyTasks: () =>
    apiService.get("/api/responder/tasks"),

  updateTaskStatus: (taskId, status) =>
    apiService.put(`/api/responder/tasks/${taskId}/status`, { status }),

  // ── History ─────────────────────────────────────────
  getCompletedTasks: () =>
    apiService.get("/api/responder/history"),

  // ── Reports ─────────────────────────────────────────
  submitReport: (payload) =>
    // payload: { disasterId, details }
    apiService.post("/api/responder/reports", payload),
};

export default responderService;