import axios from "axios";

// Environment-aware API URL
// Development: Direct connection to backend on port 4000
// Production: Relative path - Nginx will proxy /api/* to backend
const API_URL =
  process.env.NODE_ENV === "production"
    ? "/api" // Production: relative URL, Nginx handles proxy
    : "http://localhost:4000/api"; // Development: direct connection

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Temporarily disabled for development - no auth yet
    // if (error.response?.status === 401) {
    //   // Clear auth and redirect to login
    //   if (typeof window !== "undefined") {
    //     localStorage.removeItem("accessToken");
    //     localStorage.removeItem("refreshToken");
    //     window.location.href = "/admin/login";
    //   }
    // }
    return Promise.reject(error);
  }
);

export default apiClient;
