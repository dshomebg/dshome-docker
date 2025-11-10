import axios from "axios";

// Use relative URL for production compatibility
// In browser: /api → proxied by Nginx to backend
// In development: can be overridden with NEXT_PUBLIC_API_URL
const API_URL = typeof window !== "undefined"
  ? "/api"  // Browser: use relative URL (works with Nginx proxy)
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";  // Server-side

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
