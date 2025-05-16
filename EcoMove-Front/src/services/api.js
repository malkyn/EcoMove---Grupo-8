import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  withCredentials: true, // importante para CORS com sessão/cookies
});

export default api;
