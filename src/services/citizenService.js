// citizen-service.js
// All API calls for the Citizen Dashboard
// Assumes apiService has .get(), .post(), .put(), .delete() returning { data }

import apiService from "./api.js"; // adjust path to your existing api service

const citizenService = {
  // ── Alerts ──────────────────────────────────────────
  getAlerts: () =>
    apiService.get("/api/citizen/alerts"),

  // ── Disasters ───────────────────────────────────────
  getNearbyDisasters: () =>
    apiService.get("/api/citizen/disasters"),

  // ── Rescue Requests ─────────────────────────────────
  requestHelp: (payload) =>
    // payload: { location, description, type, latitude, longitude }
    apiService.post("/api/citizen/request-help", payload),

  cancelRequest: (id) =>
    apiService.delete(`/api/citizen/request/${id}`),

  // ── Location ────────────────────────────────────────
  updateLocation: (latitude, longitude) =>
    apiService.put("/api/citizen/location", { latitude, longitude }),

  // ── Test ────────────────────────────────────────────
  test: () =>
    apiService.get("/api/citizen/test"),
};

export default citizenService;