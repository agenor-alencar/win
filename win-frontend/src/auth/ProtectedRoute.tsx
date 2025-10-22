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

  if (!user || !user.role) {
    return <Navigate to="/unauthorized" />;
  }

  // Compare roles case-insensitively and support perfis like ['ADMIN']
  const userRole = String(user.role).toUpperCase();
  const normalizedRequired = requiredRoles.map((r) => String(r).toUpperCase());

  if (!normalizedRequired.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;