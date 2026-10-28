import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token if saved
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("fraudguard_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Health & System
  getHealth: () => axios.get(`${API_BASE}/health`),
  getSystemStatus: () => client.get("/system/status"),

  // Authentication
  login: (username_or_email, password) => client.post("/auth/login", { username_or_email, password }),
  register: (data) => client.post("/auth/register", data),
  getMe: () => client.get("/auth/me"),

  // Scoring & Inference
  predictSingle: (transactionData) => client.post("/predict", transactionData),
  uploadBatch: (formData) => client.post("/batch/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  getSampleCsvUrl: () => `${API_BASE}/api/v1/batch/sample-csv`,

  // Transaction Ledger & Triage
  getTransactions: (params) => client.get("/transactions", { params }),
  getTransaction: (id) => client.get(`/transactions/${id}`),
  updateTriage: (id, status, notes) => client.patch(`/transactions/${id}/triage`, { status, notes }),

  // Model Lab & Research Benchmarks
  getBenchmarks: () => client.get("/models/benchmarks"),
  getPerformanceCurves: () => client.get("/models/curves"),
  getActiveModel: () => client.get("/models/active"),
  setActiveModel: (model_name) => client.post("/models/active", { model_name }),
  triggerTrain: (method) => client.post(`/models/train?method=${method}`),

  // Rules & Thresholds
  getRules: () => client.get("/rules"),
  createRule: (ruleData) => client.post("/rules", ruleData),
  toggleRule: (id) => client.patch(`/rules/${id}/toggle`),
  deleteRule: (id) => client.delete(`/rules/${id}`),
  getThresholds: () => client.get("/rules/thresholds"),
  updateThresholds: (allow_threshold, review_threshold) => client.post("/rules/thresholds", { allow_threshold, review_threshold }),

  // Analytics & KPIs
  getKPIs: () => client.get("/analytics/kpis"),
  getTimeline: () => client.get("/analytics/timeline")
};

export default api;
