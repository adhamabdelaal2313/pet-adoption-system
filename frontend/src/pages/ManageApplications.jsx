import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const ManageApplications = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });
    const [followUps, setFollowUps] = useState([]);
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [newFollowUp, setNewFollowUp] = useState({ followUpDate: '', followUpType: '', notes: '', status: 'Scheduled' });

    useEffect(() => {
        if (!isAuthenticated || !isAdmin) return;
        fetchApplications();
    }, [isAuthenticated, isAdmin, statusFilter]);

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

    const handleViewDetails = async (appId) => {
        try {
            const [appResponse, followUpsResponse] = await Promise.all([
                api.get(`/applications/${appId}`),
                api.get(`/applications/${appId}/follow-ups`)
            ]);
            setSelectedApp(appResponse.data.application);
            setFollowUps(followUpsResponse.data.followUps || []);
            setStatusUpdate({ status: appResponse.data.application.Status, notes: appResponse.data.application.Notes || '' });
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching application details:', err);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await api.put(`/applications/${selectedApp.AppID}`, statusUpdate);
            setShowModal(false);
            fetchApplications();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update status');
        }
    };

    const handleAddFollowUp = async () => {
        try {
            await api.post(`/applications/${selectedApp.AppID}/follow-ups`, newFollowUp);
            const response = await api.get(`/applications/${selectedApp.AppID}/follow-ups`);
            setFollowUps(response.data.followUps || []);
            setNewFollowUp({ followUpDate: '', followUpType: '', notes: '', status: 'Scheduled' });
            setShowFollowUpForm(false);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add follow-up');
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

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                    <p className="text-slate-600">This page is only available for administrators.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">Manage Applications</h1>
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
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Applications</h2>
                        <p className="text-slate-600">No applications found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Pet</th>
                                    <th className="px-4 py-3 text-left">Adopter</th>
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.AppID} className="border-t hover:bg-slate-50">
                                        <td className="px-4 py-3">{app.AppID}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">{app.AnimalName}</div>
                                            <div className="text-sm text-slate-600">{app.PetType} • {app.BreedName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{app.AdopterFirstName} {app.AdopterLastName}</div>
                                            <div className="text-sm text-slate-600">{app.AdopterEmail}</div>
                                        </td>
                                        <td className="px-4 py-3">{new Date(app.AppDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.Status)}`}>
                                                {app.Status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleViewDetails(app.AppID)}
                                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                                            >
                                                View & Process
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Application Details Modal */}
                {showModal && selectedApp && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="font-semibold mb-2">Pet Information</h3>
                                    <p><span className="font-medium">Name:</span> {selectedApp.AnimalName}</p>
                                    <p><span className="font-medium">Type:</span> {selectedApp.PetType}</p>
                                    <p><span className="font-medium">Breed:</span> {selectedApp.BreedName}</p>
                                    <p><span className="font-medium">Shelter:</span> {selectedApp.ShelterName}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Adopter Information</h3>
                                    <p><span className="font-medium">Name:</span> {selectedApp.AdopterFirstName} {selectedApp.AdopterLastName}</p>
                                    <p><span className="font-medium">Email:</span> {selectedApp.AdopterEmail}</p>
                                    <p><span className="font-medium">Phone:</span> {selectedApp.AdopterPhone || 'N/A'}</p>
                                    <p><span className="font-medium">Applied:</span> {new Date(selectedApp.AppDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedApp.Notes && (
                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Notes</h3>
                                    <p className="text-slate-600">{selectedApp.Notes}</p>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Update Status</h3>
                                <select
                                    value={statusUpdate.status}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg mb-2"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <textarea
                                    rows="3"
                                    placeholder="Admin notes..."
                                    value={statusUpdate.notes}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                <button
                                    onClick={handleStatusUpdate}
                                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                                >
                                    Update Status
                                </button>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold">Follow-Ups</h3>
                                    <button
                                        onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                                    >
                                        + Add Follow-Up
                                    </button>
                                </div>
                                {showFollowUpForm && (
                                    <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <input
                                                type="date"
                                                value={newFollowUp.followUpDate}
                                                onChange={(e) => setNewFollowUp({ ...newFollowUp, followUpDate: e.target.value })}
                                                className="px-2 py-1 border rounded"
                                                required
                                            />
                                            <select
                                                value={newFollowUp.followUpType}
                                                onChange={(e) => setNewFollowUp({ ...newFollowUp, followUpType: e.target.value })}
                                                className="px-2 py-1 border rounded"
                                                required
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Phone Call">Phone Call</option>
                                                <option value="Home Visit">Home Visit</option>
                                                <option value="Email Check-in">Email Check-in</option>
                                            </select>
                                        </div>
                                        <textarea
                                            rows="2"
                                            placeholder="Notes..."
                                            value={newFollowUp.notes}
                                            onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                                            className="w-full px-2 py-1 border rounded mb-2"
                                        />
                                        <button
                                            onClick={handleAddFollowUp}
                                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                                        >
                                            Save Follow-Up
                                        </button>
                                    </div>
                                )}
                                {followUps.length === 0 ? (
                                    <p className="text-slate-600 text-sm">No follow-ups yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {followUps.map((fu) => (
                                            <div key={fu.FollowUpID} className="bg-slate-50 p-3 rounded">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{fu.FollowUpType}</span>
                                                    <span className="text-sm text-slate-600">{new Date(fu.FollowUpDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-sm text-slate-600">{fu.Status}</div>
                                                {fu.Notes && <div className="text-sm mt-1">{fu.Notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg w-full"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageApplications;

