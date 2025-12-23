const db = require('../config/db');

exports.getBreeds = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.BreedID,
                b.BreedName,
                s.SpeciesName,
                s.SpeciesID
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

exports.getShelters = async (req, res) => {
    try {
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

exports.getSpecies = async (req, res) => {
    try {
        const query = `
            SELECT 
                SpeciesID,
                SpeciesName
            FROM Species
            ORDER BY SpeciesName
        `;
        
        const [species] = await db.query(query);
        
        res.json({
            success: true,
            species
        });
        
    } catch (error) {
        console.error('Get species error:', error);
        res.status(500).json({ error: 'Failed to fetch species' });
    }
};
