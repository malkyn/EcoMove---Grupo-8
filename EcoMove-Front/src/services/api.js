import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // Ajuste se seu Flask rodar em outra porta
});

export default api;