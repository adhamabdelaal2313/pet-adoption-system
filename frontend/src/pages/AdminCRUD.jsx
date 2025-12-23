import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useAuth } from '../context/AuthContext';

const AdminCRUD = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingPet, setEditingPet] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        breedId: '',
        breedName: '',
        breedType: '',
        shelterId: '',
        shelterName: '',
        shelterCity: '',
        dateOfBirth: '',
        gender: '',
        healthStatus: 'Healthy',
        image_data: '',
        petType: ''
    });
    const [breeds, setBreeds] = useState([]);
    const [shelters, setShelters] = useState([]);
    const [species, setSpecies] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [viewingPet, setViewingPet] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [useCustomBreed, setUseCustomBreed] = useState(false);
    const [useCustomShelter, setUseCustomShelter] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchPets();
        fetchBreeds();
        fetchShelters();
        fetchSpecies();
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

    const fetchSpecies = async () => {
        try {
            const response = await api.get('/admin/species');
            setSpecies(response.data.species || []);
        } catch (err) {
            console.error('Error fetching species:', err);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        if (years === 0) {
            return `${months} month${months !== 1 ? 's' : ''}`;
        } else if (months === 0) {
            return `${years} year${years !== 1 ? 's' : ''}`;
        } else {
            return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
        }
    };

    const handleView = async (id) => {
        try {
            const response = await api.get(`/pets/${id}`);
            setViewingPet(response.data.pet);
            setShowViewModal(true);
        } catch (err) {
            showMessage('error', 'Failed to fetch pet details');
        }
    };

    const handleAdd = () => {
        setEditingPet(null);
        setFormData({
            name: '',
            breedId: '',
            breedName: '',
            breedType: '',
            shelterId: '',
            shelterName: '',
            shelterCity: '',
            dateOfBirth: '',
            gender: '',
            healthStatus: 'Healthy',
            image_data: '',
            petType: ''
        });
        setUseCustomBreed(false);
        setUseCustomShelter(false);
        setShowForm(true);
    };

    const handleEdit = (pet) => {
        setEditingPet(pet);
        const selectedBreed = breeds.find(b => b.BreedID === pet.BreedID);
        setFormData({
            name: pet.Name,
            breedId: pet.BreedID,
            shelterId: pet.ShelterID,
            dateOfBirth: pet.DateOfBirth || '',
            gender: pet.Gender,
            healthStatus: pet.HealthStatus || 'Healthy',
            image_data: pet.image_data || '',
            petType: pet.PetType || selectedBreed?.SpeciesName || ''
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

        // Validate: either dropdown selection or custom text must be provided
        if (!useCustomBreed && !formData.breedId) {
            showMessage('error', 'Please select a breed or enter a custom breed');
            setLoading(false);
            return;
        }

        if (!useCustomShelter && !formData.shelterId) {
            showMessage('error', 'Please select a shelter or enter a custom shelter');
            setLoading(false);
            return;
        }

        if (useCustomBreed && (!formData.breedName || !formData.breedType)) {
            showMessage('error', 'Please enter both breed name and pet type');
            setLoading(false);
            return;
        }

        if (useCustomShelter && !formData.shelterName) {
            showMessage('error', 'Please enter shelter name');
            setLoading(false);
            return;
        }

        try {
            const submitData = {
                ...formData,
                breedId: useCustomBreed ? '' : formData.breedId,
                shelterId: useCustomShelter ? '' : formData.shelterId
            };

            if (editingPet) {
                await api.put(`/pets/${editingPet.AnimalID}`, submitData);
                showMessage('success', 'Pet updated successfully');
            } else {
                await api.post('/pets', submitData);
                showMessage('success', 'Pet added successfully');
            }
            setShowForm(false);
            setUseCustomBreed(false);
            setUseCustomShelter(false);
            fetchPets();
        } catch (err) {
            showMessage('error', err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">Please log in to access admin features</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
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

    if (!isAdmin) {
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
                                <label className="block text-sm font-medium mb-1">Pet Type</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                    value={formData.petType || (formData.breedId ? breeds.find(b => b.BreedID === parseInt(formData.breedId))?.SpeciesName || '' : '')}
                                    placeholder="Select a breed to see pet type"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Breed *</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={useCustomBreed ? 'other' : formData.breedId}
                                    onChange={(e) => {
                                        if (e.target.value === 'other') {
                                            setUseCustomBreed(true);
                                            setFormData({ ...formData, breedId: '', petType: '' });
                                        } else {
                                            setUseCustomBreed(false);
                                            const selectedBreed = breeds.find(b => b.BreedID === parseInt(e.target.value));
                                            setFormData({ 
                                                ...formData, 
                                                breedId: e.target.value,
                                                breedName: '',
                                                breedType: '',
                                                petType: selectedBreed?.SpeciesName || ''
                                            });
                                        }
                                    }}
                                >
                                    <option value="">Select breed</option>
                                    {breeds.map(b => (
                                        <option key={b.BreedID} value={b.BreedID}>
                                            {b.BreedName} ({b.SpeciesName})
                                        </option>
                                    ))}
                                    <option value="other">Other...</option>
                                </select>
                                {useCustomBreed && (
                                    <div className="mt-2 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Breed Name"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={formData.breedName}
                                            onChange={(e) => setFormData({ ...formData, breedName: e.target.value })}
                                            required={useCustomBreed}
                                        />
                                        <select
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={formData.breedType}
                                            onChange={(e) => setFormData({ ...formData, breedType: e.target.value, petType: e.target.value })}
                                            required={useCustomBreed}
                                        >
                                            <option value="">Select Pet Type</option>
                                            {species.map((s) => (
                                                <option key={s.SpeciesID} value={s.SpeciesName}>
                                                    {s.SpeciesName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Shelter *</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    value={useCustomShelter ? 'other' : formData.shelterId}
                                    onChange={(e) => {
                                        if (e.target.value === 'other') {
                                            setUseCustomShelter(true);
                                            setFormData({ ...formData, shelterId: '' });
                                        } else {
                                            setUseCustomShelter(false);
                                            setFormData({ ...formData, shelterId: e.target.value, shelterName: '', shelterCity: '' });
                                        }
                                    }}
                                >
                                    <option value="">Select shelter</option>
                                    {shelters.map(s => (
                                        <option key={s.ShelterID} value={s.ShelterID}>{s.ShelterName}</option>
                                    ))}
                                    <option value="other">Other...</option>
                                </select>
                                {useCustomShelter && (
                                    <div className="mt-2 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Shelter Name"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={formData.shelterName}
                                            onChange={(e) => setFormData({ ...formData, shelterName: e.target.value })}
                                            required={useCustomShelter}
                                        />
                                        <input
                                            type="text"
                                            placeholder="City (optional)"
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            value={formData.shelterCity}
                                            onChange={(e) => setFormData({ ...formData, shelterCity: e.target.value })}
                                        />
                                    </div>
                                )}
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
                                    <th className="px-4 py-3 text-left">Age</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Health</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center">Loading...</td>
                                    </tr>
                                ) : pets.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-8 text-center">No pets found</td>
                                    </tr>
                                ) : (
                                    pets.map((pet) => (
                                        <tr key={pet.AnimalID} className="border-t hover:bg-slate-50">
                                            <td className="px-4 py-3">{pet.AnimalID}</td>
                                            <td className="px-4 py-3 font-medium">{pet.Name}</td>
                                            <td className="px-4 py-3">{pet.PetType || 'N/A'}</td>
                                            <td className="px-4 py-3">{pet.BreedName}</td>
                                            <td className="px-4 py-3">{calculateAge(pet.DateOfBirth)}</td>
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

            {/* View Pet Modal */}
            {showViewModal && viewingPet && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Pet Details</h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {viewingPet.image_data && (
                                    <div className="md:col-span-2 mb-4">
                                        <img
                                            src={viewingPet.image_data}
                                            alt={viewingPet.Name}
                                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Name</label>
                                    <p className="text-lg text-slate-800 mt-1">{viewingPet.Name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Type</label>
                                    <p className="text-lg text-slate-800 mt-1">{viewingPet.PetType || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Breed</label>
                                    <p className="text-lg text-slate-800 mt-1">{viewingPet.BreedName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Age</label>
                                    <p className="text-lg text-slate-800 mt-1">{calculateAge(viewingPet.DateOfBirth)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Gender</label>
                                    <p className="text-lg text-slate-800 mt-1">{viewingPet.Gender === 'M' ? 'Male' : 'Female'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Status</label>
                                    <p className="text-lg mt-1">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            viewingPet.Status === 'Available' ? 'bg-green-100 text-green-800' :
                                            viewingPet.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {viewingPet.Status}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Health Status</label>
                                    <p className="text-lg mt-1">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            viewingPet.HealthStatus === 'Healthy' ? 'bg-green-100 text-green-800' :
                                            viewingPet.HealthStatus === 'Under Treatment' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {viewingPet.HealthStatus || 'N/A'}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
                                    <p className="text-lg text-slate-800 mt-1">{viewingPet.DateOfBirth ? new Date(viewingPet.DateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                {viewingPet.ShelterName && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Shelter</label>
                                        <p className="text-lg text-slate-800 mt-1">{viewingPet.ShelterName}</p>
                                    </div>
                                )}
                                {viewingPet.City && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Location</label>
                                        <p className="text-lg text-slate-800 mt-1">{viewingPet.City}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCRUD;

