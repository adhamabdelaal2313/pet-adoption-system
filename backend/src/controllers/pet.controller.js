const db = require('../config/db');

exports.getAllPets = async (req, res) => {
    try {
        console.log('GET /api/pets - Request received');
        const statusFilter = req.query.status || null;
        
        let query = `
            SELECT 
                a.AnimalID,
                a.Name,
                a.Gender,
                a.Status,
                a.HealthStatus,
                a.DateOfBirth,
                a.BreedID,
                a.ShelterID,
                a.ImageURL as image_data,
                b.BreedName,
                sp.SpeciesName as PetType,
                s.ShelterName,
                s.City
            FROM Animals a
            JOIN Breeds b ON a.BreedID = b.BreedID
            JOIN Species sp ON b.SpeciesID = sp.SpeciesID
            JOIN Shelters s ON a.ShelterID = s.ShelterID
        `;
        
        const params = [];
        if (statusFilter) {
            query += ' WHERE a.Status = ?';
            params.push(statusFilter);
        }
        
        query += ' ORDER BY a.AnimalID DESC';
        
        console.log('Executing query...');
        const [pets] = await db.query(query, params);
        console.log(`Query successful, found ${pets.length} pets`);
        
        res.json({
            success: true,
            count: pets.length,
            pets
        });

    } catch (error) {
        console.error('Get pets error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to fetch pets',
            details: error.message,
            code: error.code,
            sqlState: error.sqlState
        });
    }
};

exports.getPetById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                a.AnimalID,
                a.Name,
                a.Gender,
                a.Status,
                a.HealthStatus,
                a.DateOfBirth,
                a.IntakeDate,
                a.BreedID,
                a.ShelterID,
                a.ImageURL as image_data,
                b.BreedName,
                sp.SpeciesName as PetType,
                s.ShelterName,
                s.City,
                s.Phone as ShelterPhone
            FROM Animals a
            JOIN Breeds b ON a.BreedID = b.BreedID
            JOIN Species sp ON b.SpeciesID = sp.SpeciesID
            JOIN Shelters s ON a.ShelterID = s.ShelterID
            WHERE a.AnimalID = ?
        `;
        
        const [pets] = await db.query(query, [id]);
        
        if (pets.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }
        
        res.json({
            success: true,
            pet: pets[0]
        });
        
    } catch (error) {
        console.error('Get pet by ID error:', error);
        res.status(500).json({ error: 'Failed to fetch pet' });
    }
};

exports.addPet = async (req, res) => {
    try {
        const { name, breedId, shelterId, dateOfBirth, gender, image_data, healthStatus } = req.body;

        if (!name || !breedId || !shelterId || !gender) {
            return res.status(400).json({ error: 'Name, breedId, shelterId, and gender are required' });
        }

        if (gender !== 'M' && gender !== 'F') {
            return res.status(400).json({ error: 'Gender must be M or F' });
        }

        const [breedCheck] = await db.query(
            'SELECT BreedID FROM Breeds WHERE BreedID = ?',
            [breedId]
        );

        if (breedCheck.length === 0) {
            return res.status(404).json({ error: 'Breed not found' });
        }

        const [shelterCheck] = await db.query(
            'SELECT ShelterID FROM Shelters WHERE ShelterID = ?',
            [shelterId]
        );

        if (shelterCheck.length === 0) {
            return res.status(404).json({ error: 'Shelter not found' });
        }

        const query = `
            INSERT INTO Animals 
            (Name, BreedID, ShelterID, DateOfBirth, IntakeDate, Gender, Status, HealthStatus, ImageURL) 
            VALUES (?, ?, ?, ?, NOW(), ?, 'Available', ?, ?)
        `;

        const [result] = await db.query(query, [
            name,
            breedId,
            shelterId,
            dateOfBirth || null,
            gender,
            healthStatus || 'Healthy',
            image_data || null // Store Base64 string in LONGTEXT column
        ]);

        res.status(201).json({
            success: true,
            message: 'Pet added successfully',
            petId: result.insertId
        });

    } catch (error) {
        console.error('Add pet error:', error);
        res.status(500).json({ error: 'Failed to add pet', details: error.message });
    }
};

exports.updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, breedId, shelterId, dateOfBirth, gender, status, healthStatus, image_data } = req.body;

        const [existingPet] = await db.query(
            'SELECT AnimalID FROM Animals WHERE AnimalID = ?',
            [id]
        );

        if (existingPet.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push('Name = ?');
            values.push(name);
        }
        if (breedId) {
            updates.push('BreedID = ?');
            values.push(breedId);
        }
        if (shelterId) {
            updates.push('ShelterID = ?');
            values.push(shelterId);
        }
        if (dateOfBirth) {
            updates.push('DateOfBirth = ?');
            values.push(dateOfBirth);
        }
        if (gender) {
            updates.push('Gender = ?');
            values.push(gender);
        }
        if (status) {
            updates.push('Status = ?');
            values.push(status);
        }
        if (healthStatus) {
            updates.push('HealthStatus = ?');
            values.push(healthStatus);
        }
        if (image_data !== undefined) {
            updates.push('ImageURL = ?');
            values.push(image_data);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);

        const query = `UPDATE Animals SET ${updates.join(', ')} WHERE AnimalID = ?`;
        
        await db.query(query, values);

        res.json({
            success: true,
            message: 'Pet updated successfully'
        });

    } catch (error) {
        console.error('Update pet error:', error);
        res.status(500).json({ error: 'Failed to update pet', details: error.message });
    }
};

exports.deletePet = async (req, res) => {
    try {
        const { id } = req.params;

        const [existingPet] = await db.query(
            'SELECT AnimalID FROM Animals WHERE AnimalID = ?',
            [id]
        );

        if (existingPet.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        const [applications] = await db.query(
            'SELECT AppID FROM Applications WHERE AnimalID = ? AND Status = ?',
            [id, 'Pending']
        );

        if (applications.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete pet with pending applications',
                pendingApplications: applications.length
            });
        }

        await db.query('DELETE FROM Animals WHERE AnimalID = ?', [id]);

        res.json({
            success: true,
            message: 'Pet deleted successfully'
        });

    } catch (error) {
        console.error('Delete pet error:', error);
        res.status(500).json({ error: 'Failed to delete pet', details: error.message });
    }
};
