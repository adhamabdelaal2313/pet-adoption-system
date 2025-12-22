import { useState, useEffect } from 'react';
import api from '../utils/axios';

// Helper function to format image URL
const formatImageUrl = (imageData) => {
    if (!imageData || imageData.trim() === '' || imageData === 'null') {
        return null;
    }
    
    // If it already starts with data:, return as is
    if (imageData.startsWith('data:')) {
        return imageData;
    }
    
    // If it's base64 without data: prefix, add it
    if (imageData.length > 100) { // Likely base64 string
        return `data:image/png;base64,${imageData}`;
    }
    
    return null;
};

const Home = () => {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPets();
    }, []);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/pets');
            const petsData = response.data.pets || [];
            
            // Format image URLs and debug
            const formattedPets = petsData.map(pet => ({
                ...pet,
                image_data: formatImageUrl(pet.image_data)
            }));
            
            // Debug: Log first pet to check image data
            if (formattedPets.length > 0) {
                console.log('Sample pet data:', {
                    name: formattedPets[0].Name,
                    hasImage: !!formattedPets[0].image_data,
                    imageLength: formattedPets[0].image_data?.length,
                    imagePreview: formattedPets[0].image_data?.substring(0, 50)
                });
            }
            
            setPets(formattedPets);
            setError('');
        } catch (err) {
            console.error('Error fetching pets:', err);
            setError('Failed to load pets. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'adopted':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600 text-lg">Loading pets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-slate-800 mb-3">Available Pets for Adoption</h1>
                    <p className="text-slate-600 text-lg">Find your perfect companion</p>
                </div>

                {pets.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-600 text-lg">No pets available at the moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pets.map((pet) => (
                            <div
                                key={pet.AnimalID}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Pet Image */}
                                <div className="w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
                                    {pet.image_data ? (
                                        <>
                                            <img
                                                src={pet.image_data}
                                                alt={pet.Name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error('Image load error for pet:', pet.Name);
                                                    e.target.style.display = 'none';
                                                    const fallback = e.target.parentElement.querySelector('.image-fallback');
                                                    if (fallback) fallback.classList.remove('hidden');
                                                }}
                                            />
                                            <div className="image-fallback hidden text-slate-400 flex flex-col items-center">
                                                <span className="text-5xl mb-2">🐾</span>
                                                <span className="text-sm font-medium">Image Failed to Load</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-slate-400 flex flex-col items-center">
                                            <span className="text-5xl mb-2">🐾</span>
                                            <span className="text-sm font-medium">No Image Available</span>
                                        </div>
                                    )}
                                </div>

                                {/* Pet Details */}
                                <div className="p-5">
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                        {pet.Name}
                                    </h3>
                                    <div className="space-y-1 text-sm text-slate-600 mb-4">
                                        {pet.PetType && (
                                            <p>
                                                <span className="font-medium">Type:</span> {pet.PetType}
                                            </p>
                                        )}
                                        <p>
                                            <span className="font-medium">Breed:</span> {pet.BreedName}
                                        </p>
                                        <p>
                                            <span className="font-medium">Gender:</span>{' '}
                                            {pet.Gender === 'M' ? 'Male' : 'Female'}
                                        </p>
                                        {pet.HealthStatus && (
                                            <p>
                                                <span className="font-medium">Health:</span> {pet.HealthStatus}
                                            </p>
                                        )}
                                        {pet.ShelterName && (
                                            <p>
                                                <span className="font-medium">Shelter:</span> {pet.ShelterName}
                                            </p>
                                        )}
                                        {pet.City && (
                                            <p>
                                                <span className="font-medium">Location:</span> {pet.City}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                pet.Status
                                            )}`}
                                        >
                                            {pet.Status || 'Available'}
                                        </span>
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

export default Home;

