import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const AdminCRUD = () => {
    const { isAuthenticated } = useAuth();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPet, setEditingPet] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        breedId: '',
        shelterId: '',
        dateOfBirth: '',
        gender: '',
        healthStatus: 'Healthy',
        image_data: ''
    });
    const [breeds, setBreeds] = useState([]);
    const [shelters, setShelters] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchPets();
        fetchBreeds();
        fetchShelters();
    }, [isAuthenticated]);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pets');
            setPets(response.data.pets || []);
        } catch (err) {
            showMessage('error', 'Failed to load pets');
        } finally {
            setLoading(false);
        }
    };

    const fetchBreeds = async () => {
        try {
            const response = await api.get('/admin/breeds');
            setBreeds(response.data.breeds || []);
        } catch (err) {
            console.error('Error fetching breeds:', err);
        }
    };

    const fetchShelters = async () => {
        try {
            const response = await api.get('/admin/shelters');
            setShelters(response.data.shelters || []);
        } catch (err) {
            console.error('Error fetching shelters:', err);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleView = async (id) => {
        try {
            const response = await api.get(`/pets/${id}`);
            alert(`Pet Details:\nName: ${response.data.pet.Name}\nType: ${response.data.pet.PetType || 'N/A'}\nBreed: ${response.data.pet.BreedName}\nStatus: ${response.data.pet.Status}\nHealth: ${response.data.pet.HealthStatus}`);
        } catch (err) {
            showMessage('error', 'Failed to fetch pet details');
        }
    };

    const handleAdd = () => {
        setEditingPet(null);
        setFormData({
            name: '',
            breedId: '',
            shelterId: '',
            dateOfBirth: '',
            gender: '',
            healthStatus: 'Healthy',
            image_data: ''
        });
        setShowForm(true);
    };

    const handleEdit = (pet) => {
        setEditingPet(pet);
        setFormData({
            name: pet.Name,
            breedId: pet.BreedID,
            shelterId: pet.ShelterID,
            dateOfBirth: pet.DateOfBirth || '',
            gender: pet.Gender,
            healthStatus: pet.HealthStatus || 'Healthy',
            image_data: pet.image_data || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) {
            return;
        }

        try {
            await api.delete(`/pets/${id}`);
            showMessage('success', 'Pet deleted successfully');
            fetchPets();
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Failed to delete pet');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'Image size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, image_data: reader.result });
        };
        reader.onerror = () => {
            showMessage('error', 'Failed to read image file');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
                                if (editingPet) {
                                await api.put(`/pets/${editingPet.AnimalID}`, formData);
                                showMessage('success', 'Pet updated successfully');
                            } else {
                                await api.post('/pets', formData);
                                showMessage('success', 'Pet added successfully');
                            }
            setShowForm(false);
            fetchPets();
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <div className="text-center py-12">Please log in to access admin features</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800">Pet Management</h1>
                    <button
                        onClick={handleAdd}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        + Add New Pet
                    </button>
                </div>

                {message.text && (
                    <div className={`mb-4 p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold mb-4">{editingPet ? 'Update Pet' : 'Add New Pet'}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Breed *</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.breedId}
                                    onChange={(e) => setFormData({ ...formData, breedId: e.target.value })}
                                >
                                    <option value="">Select breed</option>
                                    {breeds.map(b => (
                                        <option key={b.BreedID} value={b.BreedID}>{b.BreedName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shelter *</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.shelterId}
                                    onChange={(e) => setFormData({ ...formData, shelterId: e.target.value })}
                                >
                                    <option value="">Select shelter</option>
                                    {shelters.map(s => (
                                        <option key={s.ShelterID} value={s.ShelterID}>{s.ShelterName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Gender *</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select gender</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Health Status</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={formData.healthStatus}
                                    onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                                >
                                    <option value="Healthy">Healthy</option>
                                    <option value="Under Treatment">Under Treatment</option>
                                    <option value="Special Needs">Special Needs</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                {formData.image_data && (
                                    <img src={formData.image_data} alt="Preview" className="mt-2 max-w-xs rounded-lg" />
                                )}
                            </div>
                            <div className="md:col-span-2 flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : editingPet ? 'Update' : 'Add'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-2xl font-bold">All Pets</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-left">Breed</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Health</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center">Loading...</td>
                                    </tr>
                                ) : pets.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center">No pets found</td>
                                    </tr>
                                ) : (
                                    pets.map((pet) => (
                                        <tr key={pet.AnimalID} className="border-t hover:bg-slate-50">
                                            <td className="px-4 py-3">{pet.AnimalID}</td>
                                            <td className="px-4 py-3 font-medium">{pet.Name}</td>
                                            <td className="px-4 py-3">{pet.PetType || 'N/A'}</td>
                                            <td className="px-4 py-3">{pet.BreedName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    pet.Status === 'Available' ? 'bg-green-100 text-green-800' :
                                                    pet.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {pet.Status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    pet.HealthStatus === 'Healthy' ? 'bg-green-100 text-green-800' :
                                                    pet.HealthStatus === 'Under Treatment' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {pet.HealthStatus || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleView(pet.AnimalID)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(pet)}
                                                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pet.AnimalID)}
                                                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCRUD;

