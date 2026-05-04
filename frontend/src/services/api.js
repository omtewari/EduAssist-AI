import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!path.startsWith("/login") && !path.startsWith("/signup")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default API;
