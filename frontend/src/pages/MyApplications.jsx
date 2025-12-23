import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const MyApplications = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        fetchApplications();
    }, [isAuthenticated, navigate, statusFilter]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = statusFilter ? { status: statusFilter } : {};
            const response = await api.get('/applications', { params });
            setApplications(response.data.applications || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Completed': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">My Applications</h1>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-slate-600">Loading applications...</div>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Applications Yet</h2>
                        <p className="text-slate-600 mb-6">Start by browsing pets and submitting an adoption application!</p>
                        <button
                            onClick={() => navigate('/pets')}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            Browse Pets
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <div key={app.AppID} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                                {app.AnimalName && (
                                    <div className="p-6 border-b">
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{app.AnimalName}</h3>
                                        <p className="text-sm text-slate-600">{app.PetType} • {app.BreedName}</p>
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm">
                                            <span className="font-semibold">Applied:</span> {new Date(app.AppDate).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-semibold">Shelter:</span> {app.ShelterName}
                                        </p>
                                        {app.Notes && (
                                            <p className="text-sm text-slate-600 italic">"{app.Notes.substring(0, 100)}..."</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.Status)}`}>
                                            {app.Status}
                                        </span>
                                        {app.Status === 'Approved' && (
                                            <span className="text-xs text-green-600">🎉 Congratulations!</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyApplications;

