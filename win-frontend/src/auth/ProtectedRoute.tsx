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

  console.log('🔒 ProtectedRoute Check:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    requiredRoles,
    perfis: user?.perfis
  });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to /login');
    return <Navigate to="/login" />;
  }

  if (!user) {
    console.log('❌ No user object, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" />;
  }

  // Map roles to backend perfis
  const roleToPerfilMapping: { [key: string]: string } = {
    'admin': 'ADMIN',
    'merchant': 'LOJISTA',
    'driver': 'MOTORISTA',
    'user': 'USER'
  };

  // Check if user has permission:
  // 1. Check if user.role matches any required role
  // 2. Check if user.perfis contains the corresponding backend perfil
  const userRoleUpper = user.role ? String(user.role).toUpperCase() : '';
  const normalizedRequired = requiredRoles.map((r) => String(r).toUpperCase());
  
  // Check role match
  const hasRoleMatch = normalizedRequired.includes(userRoleUpper);
  
  // Check perfis match
  const userPerfis = (user.perfis || []).map(p => String(p).toUpperCase());
  const requiredPerfis = requiredRoles.map(role => roleToPerfilMapping[role.toLowerCase()]).filter(Boolean);
  const hasPerfilMatch = requiredPerfis.some(perfil => userPerfis.includes(perfil));

  console.log('🔍 Authorization check:', {
    userRoleUpper,
    normalizedRequired,
    hasRoleMatch,
    userPerfis,
    requiredPerfis,
    hasPerfilMatch,
    authorized: hasRoleMatch || hasPerfilMatch
  });

  if (!hasRoleMatch && !hasPerfilMatch) {
    console.log('❌ Role/Perfil not authorized, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" />;
  }

  console.log('✅ Access granted!');
  return <>{children}</>;
};

export default ProtectedRoute;