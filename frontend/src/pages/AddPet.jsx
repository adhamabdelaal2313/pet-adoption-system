import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddPet = () => {
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchBreeds();
        fetchShelters();
    }, [isAuthenticated, navigate]);

    const fetchBreeds = async () => {
        try {
            // Note: You may need to create these endpoints or use existing ones
            // For now, using a placeholder - adjust based on your actual API
            const response = await api.get('/admin/breeds');
            setBreeds(response.data);
        } catch (err) {
            console.error('Error fetching breeds:', err);
            // Fallback: You can hardcode some breeds or handle gracefully
        }
    };

    const fetchShelters = async () => {
        try {
            // Note: You may need to create these endpoints or use existing ones
            const response = await api.get('/admin/shelters');
            setShelters(response.data);
        } catch (err) {
            console.error('Error fetching shelters:', err);
            // Fallback: You can hardcode some shelters or handle gracefully
        }
    };

    /**
     * Handle file input change and convert image to Base64
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setFormData({ ...formData, image_data: '' });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        // Use FileReader to convert image to Base64
        const reader = new FileReader();

        reader.onloadend = () => {
            const base64String = reader.result;
            setFormData({ ...formData, image_data: base64String });
            setError('');
        };

        reader.onerror = () => {
            setError('Failed to read image file');
        };

        reader.readAsDataURL(file);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/pets', formData);

            setSuccess('Pet added successfully!');
            
            // Reset form
            setFormData({
                name: '',
                breedId: '',
                shelterId: '',
                dateOfBirth: '',
                gender: '',
                image_data: '',
                description: ''
            });

            // Reset file input
            const fileInput = document.getElementById('imageInput');
            if (fileInput) fileInput.value = '';

            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add pet. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Add New Pet</h1>
                    <p className="text-slate-600">Share a pet that needs a loving home</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8">
                    {/* Name */}
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="name">
                            Pet Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Breed */}
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="breedId">
                            Breed <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="breedId"
                            name="breedId"
                            required
                            value={formData.breedId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a breed</option>
                            {breeds.map((breed) => (
                                <option key={breed.BreedID} value={breed.BreedID}>
                                    {breed.BreedName} ({breed.SpeciesName})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Shelter */}
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="shelterId">
                            Shelter <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="shelterId"
                            name="shelterId"
                            required
                            value={formData.shelterId}
                            onChange={handleInputChange}
                        >
                            <option value="">Select a shelter</option>
                            {shelters.map((shelter) => (
                                <option key={shelter.ShelterID} value={shelter.ShelterID}>
                                    {shelter.ShelterName} - {shelter.City}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Gender */}
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="gender">
                            Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="gender"
                            name="gender"
                            required
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <option value="">Select gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>

                    {/* Date of Birth */}
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="dateOfBirth">
                            Date of Birth
                        </label>
                        <input
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Health Status */}
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="healthStatus">
                            Health Status
                        </label>
                        <select
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="healthStatus"
                            name="healthStatus"
                            value={formData.healthStatus}
                            onChange={handleInputChange}
                        >
                            <option value="Healthy">Healthy</option>
                            <option value="Under Treatment">Under Treatment</option>
                            <option value="Special Needs">Special Needs</option>
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-6">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="imageInput">
                            Pet Image
                        </label>
                        <input
                            className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            id="imageInput"
                            name="imageInput"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {formData.image_data && (
                            <div className="mt-2">
                                <img
                                    src={formData.image_data}
                                    alt="Preview"
                                    className="max-w-xs max-h-48 rounded-lg border border-slate-300"
                                />
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                            <button
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Pet'}
                            </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPet;

