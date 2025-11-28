import axios from 'axios';

// Detecta automaticamente a URL base:
// - Em desenvolvimento: usa localhost:8080/api (direto no backend)
// - Em produção (VPS): usa /api (Nginx faz proxy para backend)
const getBaseURL = () => {
  // Se houver variável de ambiente VITE_API_BASE_URL, usa ela
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log("🔧 Usando VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Se estiver rodando em localhost, usa localhost:8080/api (desenvolvimento local)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log("🔧 Ambiente local detectado, usando localhost:8080/api");
    return 'http://localhost:8080/api';
  }
  
  // Caso contrário (VPS/produção com Nginx), usa path relativo /api
  // O Nginx vai fazer proxy para o backend
  console.log("🔧 VPS detectado, usando path relativo /api");
  return '/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("win-token");

    console.log("🔐 Token no localStorage:", token ? "✅ Presente" : "❌ Ausente");
    console.log("🌐 Requisição para:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token adicionado ao header");
    } else {
      console.warn("⚠️ Sem token - requisição não autenticada");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Constrói a URL completa para uma imagem do produto
 * @param url - URL relativa retornada pelo backend (ex: /uploads/produtos/xxx.jpg)
 * @returns URL completa para acessar a imagem
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  
  // Se já é uma URL completa (http:// ou https://), retorna como está
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Remove barra inicial se existir
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  
  // Constrói URL completa
  const baseURL = getBaseURL();
  return `${baseURL}/${cleanUrl}`;
};


