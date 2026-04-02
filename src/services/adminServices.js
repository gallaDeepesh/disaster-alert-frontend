import api from "./api";

export const getDashboardStats = () => {
  return api.get("/admin/dashboard");
};

export const getDisasters = () => {
  return api.get("/admin/disasters");
};

export const getResponders = () => {
  return api.get("/admin/responders");
};

export const getAlerts = () => {
  return api.get("/admin/alerts");
};

export const getRescueTasks = () => {
  return api.get("/admin/rescue-tasks");
};

export const getRescueRequests = () => {
  return api.get("/admin/rescue-request");
};

export const createAlert = (data) => {
  return api.post("/admin/create-alert", data);
};