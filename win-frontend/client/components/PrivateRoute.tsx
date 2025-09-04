import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles, children }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />; // Rota para acesso não autorizado
    }

    return <Outlet />;
};

export default PrivateRoute;
