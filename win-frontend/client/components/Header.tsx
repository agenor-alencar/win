import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();

    const renderNavLinks = () => {
        if (isAuthenticated && user) {
            return (
                <>
                    <li className="text-slate-600">
                        Bem-vindo, {user.email}!
                    </li>
                    {user.role === 'CUSTOMER' && (
                        <>
                            <li>
                                <Link to="/orders" className="text-slate-600 hover:text-indigo-600">
                                    Meus Pedidos
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-slate-600 hover:text-indigo-600">
                                    Perfil
                                </Link>
                            </li>
                        </>
                    )}
                    {user.role === 'MERCHANT' && (
                        <li>
                            <Link to="/merchant/dashboard" className="text-slate-600 hover:text-indigo-600">
                                Dashboard Loja
                            </Link>
                        </li>
                    )}
                    {user.role === 'DRIVER' && (
                        <li>
                            <Link to="/driver/dashboard" className="text-slate-600 hover:text-indigo-600">
                                Dashboard Motorista
                            </Link>
                        </li>
                    )}
                    <li>
                        <button onClick={logout} className="text-red-500 hover:text-red-700">
                            Logout
                        </button>
                    </li>
                </>
            );
        } else {
            return (
                <>
                    <li>
                        <Link to="/login" className="text-slate-600 hover:text-indigo-600">
                            Login
                        </Link>
                    </li>
                    <li>
                        <Link to="/register" className="text-slate-600 hover:text-indigo-600">
                            Cadastro
                        </Link>
                    </li>
                </>
            );
        }
    };

    return (
        <header className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600">
                    WIN
                </Link>
                <nav>
                    <ul className="flex space-x-4">
                        {renderNavLinks()}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
