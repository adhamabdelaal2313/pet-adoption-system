import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FloatingNavbar from './components/FloatingNavbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AddPet from './pages/AddPet';
import AdminCRUD from './pages/AdminCRUD';
import Reports from './pages/Reports';
import SubmitApplication from './pages/SubmitApplication';
import MyApplications from './pages/MyApplications';
import ManageApplications from './pages/ManageApplications';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    if (!isAdmin) {
        return <Navigate to="/pets" replace />;
    }
    return children;
};

// Layout Component with Floating Navbar
const Layout = ({ children }) => {
    return (
        <>
            <FloatingNavbar />
            {children}
        </>
    );
};

function App() {
    return (
        <Router
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
            <AuthProvider>
                <Routes>
                    {/* Landing Page (Login/Signup) */}
                    <Route path="/" element={<Landing />} />
                    
                    {/* Protected Routes */}
                    <Route
                        path="/pets"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Home />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/add-pet"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <AddPet />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/crud"
                        element={
                            <AdminRoute>
                                <Layout>
                                    <AdminCRUD />
                                </Layout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <AdminRoute>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/apply/:id"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <SubmitApplication />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-applications"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <MyApplications />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/applications"
                        element={
                            <AdminRoute>
                                <Layout>
                                    <ManageApplications />
                                </Layout>
                            </AdminRoute>
                        }
                    />
                    
                    {/* Redirect any unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
