import axios from 'axios';

// Detecta automaticamente a URL base:
// - Em desenvolvimento: usa localhost:8080
// - Em produção (VPS): usa o mesmo host do frontend
const getBaseURL = () => {
  // Se houver variável de ambiente VITE_API_BASE_URL, usa ela
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Se estiver rodando em localhost, usa localhost:8080
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }
  
  // Caso contrário (VPS/produção), usa o mesmo protocolo e host, porta 8080
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8080`;
};

export const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("win-token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


