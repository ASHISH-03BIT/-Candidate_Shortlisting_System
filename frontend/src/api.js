import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ""
});

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

const storedToken = localStorage.getItem("authToken");
if (storedToken) setAuthToken(storedToken);

export default api;
