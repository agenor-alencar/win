import axios from 'axios';

// Removido: declaração manual de ImportMetaEnv e ImportMeta para evitar conflito de tipos

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    console.error("VITE_API_URL is not defined. Please check your .env file.");
    throw new Error("API URL is not defined.");
}

// Criamos uma instância do Axios para pré-configurar a URL base e outros headers
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Adicionamos um interceptor para incluir o token JWT em cada requisição
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('jwtToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error getting token from localStorage:", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado ou inválido
            console.error("Authentication error:", error);
            // Deslogar o usuário ou redirecionar para a página de login
            // Ex: localStorage.removeItem('jwtToken');
            //     window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
