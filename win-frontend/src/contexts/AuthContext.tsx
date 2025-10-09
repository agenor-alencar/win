import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from "../lib/Api";

export interface User {
  id: string;
  nome?: string;
  email: string;
  telefone?: string | null;
  role?: string;
  ativo?: boolean;
  enderecos?: any[];
  dataCriacao?: string;
  ultimoAcesso?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, senha: string, role: string) => Promise<boolean>; // Adicione o argumento role
  register: (userData: { nome: string; email: string; senha: string; }) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const userJson = localStorage.getItem("win-user");
      const token = localStorage.getItem("win-token");

      if (userJson && token) {
        try {
          const userFromStorage: User = JSON.parse(userJson);
          updateState({
            user: userFromStorage,
            isAuthenticated: true,
          });
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          localStorage.clear();
          updateState({ user: null, isAuthenticated: false });
        }
      } else {
        updateState({ user: null, isAuthenticated: false });
      }
      updateState({ isLoading: false });
    };
    initializeAuth();
  }, []);

  const updateState = (newState: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  const handleAuthSuccess = (data: any) => {
    localStorage.setItem("win-token", data.access_token);
    localStorage.setItem("win-user", JSON.stringify(data.usuario));
    updateState({
      user: data.usuario,
      isAuthenticated: true,
      error: null,
    });
  };

  const login = async (email: string, senha: string, role: string): Promise<boolean> => { // Adicione o argumento role
    updateState({ isLoading: true, error: null });
    try {
      const response = await api.post(`/auth/login/${role}`, { email, senha }); // Use o endpoint correto
      handleAuthSuccess(response.data);
      return true;
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Erro ao fazer login. Verifique sua conexão.";
      updateState({ isLoading: false, error: errorMessage });
      return false;
    } finally {
      updateState({ isLoading: false });
    }
  };

  const register = async (userData: { nome: string; email: string; senha: string; }): Promise<boolean> => {
    updateState({ isLoading: true, error: null });
    try {
      const response = await api.post("/auth/register", userData);
      handleAuthSuccess(response.data);
      return true;
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorMessage = error.response?.data?.message || "Erro ao registrar usuário. Verifique sua conexão.";
      updateState({ isLoading: false, error: errorMessage });
      return false;
    } finally {
      updateState({ isLoading: false });
    }
  };

  const logout = () => {
    localStorage.removeItem("win-token");
    localStorage.removeItem("win-user");
    updateState({ user: null, isAuthenticated: false, error: null });
    navigate('/login');
  };

  const updateUser = (updatedUser: User) => {
    const userCopy = JSON.parse(JSON.stringify(updatedUser));
    updateState({ user: userCopy });
    localStorage.setItem("win-user", JSON.stringify(userCopy));
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        error: state.error,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};