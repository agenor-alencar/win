import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

// Interface para o DTO de resposta do backend
interface AuthResponse {
    token: string;
    email: string;
    role: string;
}

// Interface para os dados do usuário a serem armazenados no contexto
interface User {
    email: string;
    role: string;
    // Adicione outros campos do usuário se necessário, extraídos do JWT ou de um endpoint de perfil
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const navigate = useNavigate();

    // Carrega o token do localStorage ao iniciar a aplicação
    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            // Opcional: decodificar o JWT para obter dados do usuário
            // const decodedUser = decodeJwt(storedToken);
            // if (decodedUser) {
            //   setUser(decodedUser);
            // }
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
            const { token, role } = response.data;

            if (token) {
                localStorage.setItem('jwtToken', token);
                setToken(token);
                setIsAuthenticated(true);
                setUser({ email, role });

                navigate('/');
                return true;
            }
        } catch (err) {
            console.error('Login failed:', err);
            // Aqui você pode adicionar lógica para tratar erros específicos da API
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
        navigate('/login');
    };

    const value = {
        isAuthenticated,
        user,
        token,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
