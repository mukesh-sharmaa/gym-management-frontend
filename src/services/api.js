// src/services/api.js
import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        toast.error("Session expired — please login again");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else if (err.response.data) {
        // optional: show backend message
        toast.error(err.response.data.toString());
      }
    } else {
      toast.error("Network error — check backend");
    }
    return Promise.reject(err);
  }
);

export default api;
