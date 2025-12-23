import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingNavbar = () => {
    const { isAuthenticated, logout, user, isAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
            <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200/50">
                <div className="flex items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link to="/pets" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-shadow">
                            <span className="text-xl">🐾</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Tails of Hope
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/pets"
                                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                >
                                    Browse Pets
                                </Link>
                                <Link
                                    to="/add-pet"
                                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                >
                                    Add Pet
                                </Link>
                                <Link
                                    to="/my-applications"
                                    className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                >
                                    My Applications
                                </Link>
                                {isAdmin && (
                                    <>
                                        <Link
                                            to="/admin/crud"
                                            className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                        >
                                            Manage Pets
                                        </Link>
                                        <Link
                                            to="/admin/applications"
                                            className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                        >
                                            Manage Applications
                                        </Link>
                                        <Link
                                            to="/reports"
                                            className="text-slate-700 hover:text-blue-600 font-medium transition-colors px-3 py-1 rounded-full hover:bg-blue-50"
                                        >
                                            Reports
                                        </Link>
                                    </>
                                )}
                                <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                                    <span className="text-sm text-slate-600">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm hover:shadow-md"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/"
                                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm hover:shadow-md"
                            >
                                Get Started
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default FloatingNavbar;

