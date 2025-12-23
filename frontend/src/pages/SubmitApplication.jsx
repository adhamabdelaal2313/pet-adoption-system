import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const SubmitApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
        notes: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        fetchPet();
    }, [id, isAuthenticated, navigate]);

    const fetchPet = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/pets/${id}`);
            setPet(response.data.pet);
            if (response.data.pet.Status === 'Adopted') {
                setError('This pet has already been adopted');
            }
        } catch (err) {
            setError('Failed to load pet details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            await api.post('/applications', {
                animalId: id,
                ...formData
            });
            setSuccess('Application submitted successfully! You will be notified of the status.');
            setTimeout(() => {
                navigate('/my-applications');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-slate-600 text-lg">Loading pet details...</div>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">Pet not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Adoption Application</h1>
                    <p className="text-slate-600">Apply to adopt {pet.Name}</p>
                </div>

                {/* Pet Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {pet.image_data && (
                            <img 
                                src={pet.image_data} 
                                alt={pet.Name} 
                                className="w-full md:w-48 h-48 object-cover rounded-lg"
                            />
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-800 mb-3">{pet.Name}</h2>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="font-semibold">Type:</span> {pet.PetType}</p>
                                <p><span className="font-semibold">Breed:</span> {pet.BreedName}</p>
                                <p><span className="font-semibold">Gender:</span> {pet.Gender === 'M' ? 'Male' : 'Female'}</p>
                                <p><span className="font-semibold">Health:</span> {pet.HealthStatus}</p>
                                <p><span className="font-semibold">Shelter:</span> {pet.ShelterName}</p>
                                <p><span className="font-semibold">Location:</span> {pet.City}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Additional Notes</label>
                            <textarea
                                rows="4"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Tell us about yourself and why you'd like to adopt this pet..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting || pet.Status === 'Adopted'}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/pets')}
                                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubmitApplication;

