// src/api/api.js
const API_BASE_URL = "http://localhost:5001/api/v1";

// Helper: Get token
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Core request wrapper
async function request(endpoint, method = "GET", body = null, headers = {}) {
  const token = getAuthToken();

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      // Unauthorized → redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API error:", error.message);
    throw error;
  }
}

// Exported API functions
export const api = {
  get: (endpoint, headers) => request(endpoint, "GET", null, headers),
  post: (endpoint, body, headers) => request(endpoint, "POST", body, headers),
  put: (endpoint, body, headers) => request(endpoint, "PUT", body, headers),
  del: (endpoint, headers) => request(endpoint, "DELETE", null, headers),
};

// ================== Example Usage ==================
// import { api } from "./api";
// const users = await api.get("/admin/users?page=1&limit=10");
// const newUser = await api.post("/admin/users", { name, email, password, role });
