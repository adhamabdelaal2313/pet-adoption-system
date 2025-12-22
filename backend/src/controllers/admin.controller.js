const db = require('../config/db');

// GET /api/admin/breeds - Get all breeds (for dropdowns)
exports.getBreeds = async (req, res) => {
    try {
        // Using parameterized query with JOIN
        const query = `
            SELECT 
                b.BreedID,
                b.BreedName,
                s.SpeciesName
            FROM Breeds b
            JOIN Species s ON b.SpeciesID = s.SpeciesID
            ORDER BY s.SpeciesName, b.BreedName
        `;
        
        const [breeds] = await db.query(query);
        
        res.json({
            success: true,
            breeds
        });
        
    } catch (error) {
        console.error('Get breeds error:', error);
        res.status(500).json({ error: 'Failed to fetch breeds' });
    }
};

// GET /api/admin/shelters - Get all shelters (for dropdowns)
exports.getShelters = async (req, res) => {
    try {
        // Using parameterized query
        const query = `
            SELECT 
                ShelterID,
                ShelterName,
                City,
                Capacity
            FROM Shelters
            ORDER BY ShelterName
        `;
        
        const [shelters] = await db.query(query);
        
        res.json({
            success: true,
            shelters
        });
        
    } catch (error) {
        console.error('Get shelters error:', error);
        res.status(500).json({ error: 'Failed to fetch shelters' });
    }
};

