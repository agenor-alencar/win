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

  // Se não tem role mas tem perfis, extrair o role dos perfis
  let userRole = user.role;
  if (!userRole && user.perfis && user.perfis.length > 0) {
    // Map perfis to role
    const roleMapping: { [key: string]: string } = {
      'ADMIN': 'admin',
      'LOJISTA': 'merchant',
      'MOTORISTA': 'driver',
      'USER': 'user'
    };
    
    for (const perfil of user.perfis) {
      const mappedRole = roleMapping[perfil.toUpperCase()];
      if (mappedRole) {
        userRole = mappedRole;
        break;
      }
    }
  }

  if (!userRole) {
    console.log('❌ No role found, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" />;
  }

  // Compare roles case-insensitively
  const userRoleUpper = String(userRole).toUpperCase();
  const normalizedRequired = requiredRoles.map((r) => String(r).toUpperCase());

  console.log('🔍 Role comparison:', {
    userRoleUpper,
    normalizedRequired,
    match: normalizedRequired.includes(userRoleUpper)
  });

  if (!normalizedRequired.includes(userRoleUpper)) {
    console.log('❌ Role not authorized, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" />;
  }

  console.log('✅ Access granted!');
  return <>{children}</>;
};

export default ProtectedRoute;