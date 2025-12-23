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
        breedName: '',
        breedType: '',
        shelterId: '',
        shelterName: '',
        shelterCity: '',
        dateOfBirth: '',
        gender: '',
        healthStatus: 'Healthy',
        image_data: ''
    });
    const [breeds, setBreeds] = useState([]);
    const [shelters, setShelters] = useState([]);
    const [species, setSpecies] = useState([]);
    const [useCustomBreed, setUseCustomBreed] = useState(false);
    const [useCustomShelter, setUseCustomShelter] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        setInitialLoading(true);
        const loadData = async () => {
            await Promise.all([fetchBreeds(), fetchShelters(), fetchSpecies()]);
            setInitialLoading(false);
        };
        loadData();
    }, [isAuthenticated, navigate]);

    const fetchBreeds = async () => {
        try {
            const response = await api.get('/admin/breeds');
            setBreeds(response.data.breeds || []);
        } catch (err) {
            console.error('Error fetching breeds:', err);
            setError('Failed to load breeds. Please refresh the page.');
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchShelters = async () => {
        try {
            const response = await api.get('/admin/shelters');
            setShelters(response.data.shelters || []);
        } catch (err) {
            console.error('Error fetching shelters:', err);
            setError('Failed to load shelters. Please refresh the page.');
        }
    };

    const fetchSpecies = async () => {
        try {
            const response = await api.get('/admin/species');
            setSpecies(response.data.species || []);
        } catch (err) {
            console.error('Error fetching species:', err);
            // Don't set error here to avoid blocking the form
            // Just log and continue with empty species array
            setSpecies([]);
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

        // Validate: either dropdown selection or custom text must be provided
        if (!useCustomBreed && !formData.breedId) {
            setError('Please select a breed or enter a custom breed');
            setLoading(false);
            return;
        }

        if (!useCustomShelter && !formData.shelterId) {
            setError('Please select a shelter or enter a custom shelter');
            setLoading(false);
            return;
        }

        if (useCustomBreed && (!formData.breedName || !formData.breedType)) {
            setError('Please enter both breed name and pet type');
            setLoading(false);
            return;
        }

        if (useCustomShelter && !formData.shelterName) {
            setError('Please enter shelter name');
            setLoading(false);
            return;
        }

        try {
            const submitData = {
                ...formData,
                breedId: useCustomBreed ? '' : formData.breedId,
                shelterId: useCustomShelter ? '' : formData.shelterId
            };
            const response = await api.post('/pets', submitData);

            setSuccess('Pet added successfully!');
            
            // Reset form
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
                image_data: ''
            });
            setUseCustomBreed(false);
            setUseCustomShelter(false);

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

    if (!isAuthenticated) {
        return null;
    }

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8 flex items-center justify-center">
                <div className="text-slate-600 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Add New Pet</h1>
                    <p className="text-slate-600">Share a pet that needs a loving home</p>
                </div>

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
                            value={useCustomBreed ? 'other' : formData.breedId}
                            onChange={(e) => {
                                if (e.target.value === 'other') {
                                    setUseCustomBreed(true);
                                    setFormData({ ...formData, breedId: '' });
                                } else {
                                    setUseCustomBreed(false);
                                    setFormData({ ...formData, breedId: e.target.value, breedName: '', breedType: '' });
                                }
                            }}
                        >
                            <option value="">Select a breed</option>
                            {breeds.map((breed) => (
                                <option key={breed.BreedID} value={breed.BreedID}>
                                    {breed.BreedName} ({breed.SpeciesName})
                                </option>
                            ))}
                            <option value="other">Other...</option>
                        </select>
                        {useCustomBreed && (
                            <div className="mt-2 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Breed Name"
                                    className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.breedName}
                                    onChange={(e) => setFormData({ ...formData, breedName: e.target.value })}
                                    required={useCustomBreed}
                                />
                                <select
                                    className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.breedType}
                                    onChange={(e) => setFormData({ ...formData, breedType: e.target.value })}
                                    required={useCustomBreed}
                                >
                                    <option value="">Select Pet Type</option>
                                    {species && species.length > 0 ? (
                                        species.map((s) => (
                                            <option key={s.SpeciesID} value={s.SpeciesName}>
                                                {s.SpeciesName}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>Loading species...</option>
                                    )}
                                </select>
                            </div>
                        )}
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
                            <option value="">Select a shelter</option>
                            {shelters.map((shelter) => (
                                <option key={shelter.ShelterID} value={shelter.ShelterID}>
                                    {shelter.ShelterName} - {shelter.City}
                                </option>
                            ))}
                            <option value="other">Other...</option>
                        </select>
                        {useCustomShelter && (
                            <div className="mt-2 space-y-2">
                                <input
                                    type="text"
                                    placeholder="Shelter Name"
                                    className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.shelterName}
                                    onChange={(e) => setFormData({ ...formData, shelterName: e.target.value })}
                                    required={useCustomShelter}
                                />
                                <input
                                    type="text"
                                    placeholder="City (optional)"
                                    className="shadow appearance-none border border-slate-300 rounded-lg w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData.shelterCity}
                                    onChange={(e) => setFormData({ ...formData, shelterCity: e.target.value })}
                                />
                            </div>
                        )}
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

