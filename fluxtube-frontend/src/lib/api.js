import axios from "axios";

// Create axios instance pointing to the backend
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach the auth token to every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem("fluxtubeUser");
    if (stored) {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch {}
  return config;
});

export default api;