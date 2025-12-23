const db = require('../config/db');

exports.getAllPets = async (req, res) => {
    try {
        console.log('GET /api/pets - Request received');
        const statusFilter = req.query.status || null;
        
        // Check if user is admin (optional auth - req.user may not exist)
        const isAdmin = req.user && req.user.role === 'admin';
        
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
        
        // Admins see all pets, regular users see only non-adopted pets
        if (statusFilter) {
            query += ' WHERE a.Status = ?';
            params.push(statusFilter);
        } else if (!isAdmin) {
            // Non-admin users: exclude adopted pets
            query += ' WHERE a.Status != ?';
            params.push('Adopted');
        }
        // If admin and no status filter, show all pets (no WHERE clause)
        
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
        const { name, breedId, breedName, breedType, shelterId, shelterName, shelterCity, dateOfBirth, gender, image_data, healthStatus } = req.body;

        if (!name || !gender) {
            return res.status(400).json({ error: 'Name and gender are required' });
        }

        if (gender !== 'M' && gender !== 'F') {
            return res.status(400).json({ error: 'Gender must be M or F' });
        }

        let finalBreedId = breedId;
        let finalShelterId = shelterId;

        // Handle breed: use breedId if provided, otherwise create new breed
        if (!breedId && breedName && breedType) {
            // Check if species exists
            const [speciesCheck] = await db.query(
                'SELECT SpeciesID FROM Species WHERE SpeciesName = ?',
                [breedType]
            );

            let speciesId;
            if (speciesCheck.length === 0) {
                // Create new species
                const [speciesResult] = await db.query(
                    'INSERT INTO Species (SpeciesName) VALUES (?)',
                    [breedType]
                );
                speciesId = speciesResult.insertId;
            } else {
                speciesId = speciesCheck[0].SpeciesID;
            }

            // Create new breed
            const [breedResult] = await db.query(
                'INSERT INTO Breeds (SpeciesID, BreedName) VALUES (?, ?)',
                [speciesId, breedName]
            );
            finalBreedId = breedResult.insertId;
        } else if (!breedId) {
            return res.status(400).json({ error: 'Either breedId or breedName with breedType is required' });
        }

        // Handle shelter: use shelterId if provided, otherwise create new shelter
        if (!shelterId && shelterName) {
            const [shelterResult] = await db.query(
                'INSERT INTO Shelters (ShelterName, City, Capacity) VALUES (?, ?, ?)',
                [shelterName, shelterCity || 'Unknown', 50]
            );
            finalShelterId = shelterResult.insertId;
        } else if (!shelterId) {
            return res.status(400).json({ error: 'Either shelterId or shelterName is required' });
        }

        // Validate breed exists
        const [breedCheck] = await db.query(
            'SELECT BreedID FROM Breeds WHERE BreedID = ?',
            [finalBreedId]
        );

        if (breedCheck.length === 0) {
            return res.status(404).json({ error: 'Breed not found' });
        }

        // Validate shelter exists
        const [shelterCheck] = await db.query(
            'SELECT ShelterID FROM Shelters WHERE ShelterID = ?',
            [finalShelterId]
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
            finalBreedId,
            finalShelterId,
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
        const { name, breedId, breedName, breedType, shelterId, shelterName, shelterCity, dateOfBirth, gender, status, healthStatus, image_data } = req.body;

        const [existingPet] = await db.query(
            'SELECT AnimalID FROM Animals WHERE AnimalID = ?',
            [id]
        );

        if (existingPet.length === 0) {
            return res.status(404).json({ error: 'Pet not found' });
        }

        let finalBreedId = breedId;
        let finalShelterId = shelterId;

        // Handle breed: use breedId if provided, otherwise create new breed
        if (!breedId && breedName && breedType) {
            // Check if species exists
            const [speciesCheck] = await db.query(
                'SELECT SpeciesID FROM Species WHERE SpeciesName = ?',
                [breedType]
            );

            let speciesId;
            if (speciesCheck.length === 0) {
                // Create new species
                const [speciesResult] = await db.query(
                    'INSERT INTO Species (SpeciesName) VALUES (?)',
                    [breedType]
                );
                speciesId = speciesResult.insertId;
            } else {
                speciesId = speciesCheck[0].SpeciesID;
            }

            // Create new breed
            const [breedResult] = await db.query(
                'INSERT INTO Breeds (SpeciesID, BreedName) VALUES (?, ?)',
                [speciesId, breedName]
            );
            finalBreedId = breedResult.insertId;
        }

        // Handle shelter: use shelterId if provided, otherwise create new shelter
        if (!shelterId && shelterName) {
            const [shelterResult] = await db.query(
                'INSERT INTO Shelters (ShelterName, City, Capacity) VALUES (?, ?, ?)',
                [shelterName, shelterCity || 'Unknown', 50]
            );
            finalShelterId = shelterResult.insertId;
        }

        const updates = [];
        const values = [];

        if (name) {
            updates.push('Name = ?');
            values.push(name);
        }
        if (finalBreedId) {
            updates.push('BreedID = ?');
            values.push(finalBreedId);
        }
        if (finalShelterId) {
            updates.push('ShelterID = ?');
            values.push(finalShelterId);
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
