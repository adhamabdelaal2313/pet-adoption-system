import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FloatingNavbar from './components/FloatingNavbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import AddPet from './pages/AddPet';
import AdminCRUD from './pages/AdminCRUD';
import Reports from './pages/Reports';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" replace />;
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
                            <ProtectedRoute>
                                <Layout>
                                    <AdminCRUD />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </ProtectedRoute>
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
