import axios from "axios";
import { mockAdapter } from "./mock";

// Com VITE_USE_MOCK=true o axios não vai à rede: responde pelo simulador em mock.js.
export const usandoMock = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000",
  timeout: 10000,
  ...(usandoMock ? { adapter: mockAdapter } : {}),
});

export default api;
