import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Usuário não está autenticado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  if (!user || !user.role || !requiredRoles.includes(user.role)) {
    // Usuário não tem a função necessária, redireciona para uma página de não autorizado
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;