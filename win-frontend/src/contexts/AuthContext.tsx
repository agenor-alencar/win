import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from "../lib/Api";

// Interface para o objeto de usuário recebido do backend
export interface User {
  id: string;
  nome?: string;
  email: string;
  telefone?: string | null;
  role?: string;
  perfis?: string[]; // Array de perfis (USER, LOJISTA, MOTORISTA, ADMIN)
  ativo?: boolean;
  enderecos?: any[];
  dataCriacao?: string;
  ultimoAcesso?: string;
}

// Interface para os dados enviados no registro
export interface RegisterData {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  senha: string;
  telefone?: string;
  dataNascimento?: string;
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
  login: (email: string, senha: string, role?: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
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
    // Backend may return either:
    // 1) { access_token, usuario }
    // 2) usuario (the user object directly)
    // Normalize both shapes into the frontend User shape.
    let token: string | undefined;
    let usuarioObj: any = undefined;

    if (data) {
      if (data.access_token && data.usuario) {
        token = data.access_token;
        usuarioObj = data.usuario;
      } else if (data.id || data.email) {
        // backend returned the UsuarioResponseDTO directly
        usuarioObj = data;
      } else if (data.usuario) {
        usuarioObj = data.usuario;
      }
    }

    if (token) {
      localStorage.setItem("win-token", token);
    }

    if (usuarioObj) {
      // Map perfis (string[]) to a single role field for frontend consumption
      // Prioriza perfis na ordem hierárquica: ADMIN > LOJISTA > MOTORISTA > USER
      const perfisArray = Array.isArray(usuarioObj.perfis) ? usuarioObj.perfis : [];
      
      let backendRole: string | undefined;
      if (perfisArray.includes('ADMIN')) {
        backendRole = 'ADMIN';
      } else if (perfisArray.includes('LOJISTA')) {
        backendRole = 'LOJISTA';
      } else if (perfisArray.includes('MOTORISTA')) {
        backendRole = 'MOTORISTA';
      } else if (perfisArray.includes('USER')) {
        backendRole = 'USER';
      }

      // Map backend roles to frontend role names
      // Backend: ADMIN, LOJISTA, MOTORISTA, USER
      // Frontend: admin, merchant, driver, user
      const roleMapping: { [key: string]: string } = {
        'ADMIN': 'admin',
        'LOJISTA': 'merchant',
        'MOTORISTA': 'driver',
        'USER': 'user'
      };

      const role = backendRole ? (roleMapping[backendRole.toUpperCase()] || backendRole.toLowerCase()) : undefined;

      console.log('🔐 Auth Success - Backend Response:', usuarioObj);
      console.log('👤 Backend role:', backendRole);
      console.log('🔄 Mapped to frontend role:', role);
      console.log('📋 All perfis:', usuarioObj.perfis);

      const frontendUser: User = {
        id: usuarioObj.id,
        nome: usuarioObj.nome,
        email: usuarioObj.email,
        telefone: usuarioObj.telefone,
        role,
        perfis: perfisArray, // Armazenar todos os perfis
        ativo: usuarioObj.ativo,
        enderecos: usuarioObj.enderecos || [],
        dataCriacao: usuarioObj.dataCriacao,
        ultimoAcesso: usuarioObj.ultimoAcesso,
      };

      console.log('✅ Frontend User Created:', frontendUser);

      localStorage.setItem("win-user", JSON.stringify(frontendUser));
      updateState({
        user: frontendUser,
        isAuthenticated: true,
        error: null,
      });
    }
  };

  const login = async (email: string, senha: string, role?: string): Promise<boolean> => {
    updateState({ isLoading: true, error: null });
    try {
      // Backend login endpoint is POST /api/v1/auth/login and currently returns the user object.
      // The frontend previously attempted to call /auth/login/${role} and expected a token.
      // Call the canonical endpoint and normalize the response in handleAuthSuccess.
      const response = await api.post(`/api/v1/auth/login`, { email, senha });
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

  const register = async (userData: RegisterData): Promise<boolean> => {
    updateState({ isLoading: true, error: null });
    try {
      // Preparar dados para o backend
      const registrationData = {
        nome: `${userData.nome} ${userData.sobrenome}`.trim(), // Concatenar nome e sobrenome
        email: userData.email,
        cpf: userData.cpf,
        senha: userData.senha,
        telefone: userData.telefone || undefined,
        dataNascimento: userData.dataNascimento || undefined
      };

      console.log("📤 Enviando dados de registro:", registrationData);
      const response = await api.post("/api/v1/auth/register", registrationData);
      console.log("✅ Registro bem-sucedido:", response.data);
      handleAuthSuccess(response.data);
      return true;
    } catch (error: any) {
      console.error("❌ Registration failed:", error);
      console.error("❌ Response data:", error.response?.data);
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

// **ESTA É A FUNÇÃO QUE ESTAVA FALTANDO SER EXPORTADA**
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};