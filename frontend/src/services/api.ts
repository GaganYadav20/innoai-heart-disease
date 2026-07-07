import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cv_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("cv_refresh_token");
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`,
            { refreshToken }
          );
          const { accessToken } = res.data.data;
          localStorage.setItem("cv_access_token", accessToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem("cv_access_token");
          localStorage.removeItem("cv_refresh_token");
          localStorage.removeItem("cv_user");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("cv_access_token");
        localStorage.removeItem("cv_refresh_token");
        localStorage.removeItem("cv_user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// AI Service client
export const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_URL || "/ai",
  headers: { "Content-Type": "application/json" },
});
