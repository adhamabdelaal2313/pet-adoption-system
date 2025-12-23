const db = require('../config/db');

// GET /api/applications - Get all applications (admin) or user's applications
exports.getApplications = async (req, res) => {
    try {
        const { userId, role } = req.user;
        const { status } = req.query;

        let query = `
            SELECT 
                app.AppID,
                app.AdopterID,
                app.AnimalID,
                app.AppDate,
                app.Status,
                app.Notes,
                a.FirstName as AdopterFirstName,
                a.LastName as AdopterLastName,
                a.Email as AdopterEmail,
                a.Phone as AdopterPhone,
                an.Name as AnimalName,
                an.Status as AnimalStatus,
                b.BreedName,
                sp.SpeciesName as PetType,
                s.ShelterName,
                s.City as ShelterCity
            FROM Applications app
            JOIN Adopters a ON app.AdopterID = a.AdopterID
            JOIN Animals an ON app.AnimalID = an.AnimalID
            JOIN Breeds b ON an.BreedID = b.BreedID
            JOIN Species sp ON b.SpeciesID = sp.SpeciesID
            JOIN Shelters s ON an.ShelterID = s.ShelterID
        `;

        const params = [];

        // If user is not admin, only show their applications
        if (role !== 'admin') {
            // Get user's email from Users table
            const [users] = await db.query('SELECT Email FROM Users WHERE UserID = ?', [userId]);
            if (users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userEmail = users[0].Email;

            // Find adopter by email
            const [adopters] = await db.query('SELECT AdopterID FROM Adopters WHERE Email = ?', [userEmail]);
            if (adopters.length === 0) {
                return res.json({ success: true, applications: [] });
            }
            query += ' WHERE app.AdopterID = ?';
            params.push(adopters[0].AdopterID);
        }

        if (status) {
            query += role === 'admin' ? ' WHERE' : ' AND';
            query += ' app.Status = ?';
            params.push(status);
        }

        query += ' ORDER BY app.AppDate DESC';

        const [applications] = await db.query(query, params);

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
    }
};

// GET /api/applications/:id - Get single application
exports.getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.user;

        const query = `
            SELECT 
                app.AppID,
                app.AdopterID,
                app.AnimalID,
                app.AppDate,
                app.Status,
                app.Notes,
                a.FirstName as AdopterFirstName,
                a.LastName as AdopterLastName,
                a.Email as AdopterEmail,
                a.Phone as AdopterPhone,
                an.Name as AnimalName,
                an.Status as AnimalStatus,
                an.DateOfBirth,
                an.Gender,
                an.HealthStatus,
                b.BreedName,
                sp.SpeciesName as PetType,
                s.ShelterName,
                s.City as ShelterCity,
                s.Phone as ShelterPhone
            FROM Applications app
            JOIN Adopters a ON app.AdopterID = a.AdopterID
            JOIN Animals an ON app.AnimalID = an.AnimalID
            JOIN Breeds b ON an.BreedID = b.BreedID
            JOIN Species sp ON b.SpeciesID = sp.SpeciesID
            JOIN Shelters s ON an.ShelterID = s.ShelterID
            WHERE app.AppID = ?
        `;

        const [applications] = await db.query(query, [id]);

        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const application = applications[0];

        // Check if user has permission (admin or owner)
        if (role !== 'admin') {
            const [users] = await db.query('SELECT Email FROM Users WHERE UserID = ?', [userId]);
            if (users.length === 0 || users[0].Email !== application.AdopterEmail) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        res.json({
            success: true,
            application
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({ error: 'Failed to fetch application', details: error.message });
    }
};

// POST /api/applications - Submit new adoption application
exports.submitApplication = async (req, res) => {
    try {
        const { animalId, firstName, lastName, email, phone, notes } = req.body;
        const { userId } = req.user;

        if (!animalId || !firstName || !lastName || !email) {
            return res.status(400).json({ error: 'Animal ID, first name, last name, and email are required' });
        }

        // Verify animal exists and is available
        const [animals] = await db.query(
            'SELECT AnimalID, Status FROM Animals WHERE AnimalID = ?',
            [animalId]
        );

        if (animals.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }

        if (animals[0].Status === 'Adopted') {
            return res.status(400).json({ error: 'This animal has already been adopted' });
        }

        // Get user email to link adopter
        const [users] = await db.query('SELECT Email FROM Users WHERE UserID = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userEmail = users[0].Email;

        // Check if adopter exists, if not create one
        let [adopters] = await db.query('SELECT AdopterID FROM Adopters WHERE Email = ?', [email]);
        let adopterId;

        if (adopters.length === 0) {
            const [adopterResult] = await db.query(
                'INSERT INTO Adopters (FirstName, LastName, Email, Phone) VALUES (?, ?, ?, ?)',
                [firstName, lastName, email, phone || null]
            );
            adopterId = adopterResult.insertId;
        } else {
            adopterId = adopters[0].AdopterID;
            // Update adopter info if provided
            if (phone) {
                await db.query('UPDATE Adopters SET Phone = ? WHERE AdopterID = ?', [phone, adopterId]);
            }
        }

        // Check if user already has a pending application for this animal
        const [existingPendingApps] = await db.query(
            'SELECT AppID FROM Applications WHERE AdopterID = ? AND AnimalID = ? AND Status = ?',
            [adopterId, animalId, 'Pending']
        );

        if (existingPendingApps.length > 0) {
            return res.status(400).json({ error: 'You already have a pending application for this animal' });
        }

        // Check if user was previously rejected for this animal
        const [rejectedApps] = await db.query(
            'SELECT AppID FROM Applications WHERE AdopterID = ? AND AnimalID = ? AND Status = ?',
            [adopterId, animalId, 'Rejected']
        );

        if (rejectedApps.length > 0) {
            return res.status(400).json({ error: 'You cannot apply again for this animal as your previous application was rejected' });
        }

        // Create application (multiple users can apply for the same pet)
        const [result] = await db.query(
            'INSERT INTO Applications (AdopterID, AnimalID, AppDate, Status, Notes) VALUES (?, ?, CURDATE(), ?, ?)',
            [adopterId, animalId, 'Pending', notes || null]
        );

        // Don't change animal status to Pending - allow multiple applications
        // Animal status will only change to 'Adopted' when an application is approved

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: result.insertId
        });

    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({ error: 'Failed to submit application', details: error.message });
    }
};

// PUT /api/applications/:id - Update application status (admin only)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update application status' });
        }

        if (!status || !['Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
            return res.status(400).json({ error: 'Valid status is required (Pending, Approved, Rejected, Completed)' });
        }

        // Get current application
        const [applications] = await db.query(
            'SELECT AnimalID, Status as CurrentStatus FROM Applications WHERE AppID = ?',
            [id]
        );

        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const { AnimalID, CurrentStatus } = applications[0];

        // Update application
        const updateQuery = notes 
            ? 'UPDATE Applications SET Status = ?, Notes = ? WHERE AppID = ?'
            : 'UPDATE Applications SET Status = ? WHERE AppID = ?';
        
        const params = notes ? [status, notes, id] : [status, id];
        await db.query(updateQuery, params);

        // Update animal status based on application status
        if (status === 'Approved') {
            // Set animal to Adopted - it will disappear from available pets
            await db.query('UPDATE Animals SET Status = ? WHERE AnimalID = ?', ['Adopted', AnimalID]);
            
            // Reject all other pending applications for this animal
            await db.query(
                'UPDATE Applications SET Status = ? WHERE AnimalID = ? AND AppID != ? AND Status = ?',
                ['Rejected', AnimalID, id, 'Pending']
            );
        }
        // Note: When rejected, animal stays Available/Pending to allow other applications

        res.json({
            success: true,
            message: 'Application status updated successfully'
        });

    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({ error: 'Failed to update application', details: error.message });
    }
};

// GET /api/applications/:id/follow-ups - Get follow-ups for an application
exports.getFollowUps = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                f.FollowUpID,
                f.ApplicationID,
                f.FollowUpDate,
                f.FollowUpType,
                f.Notes,
                f.Status
            FROM Follow_Ups f
            WHERE f.ApplicationID = ?
            ORDER BY f.FollowUpDate DESC
        `;

        const [followUps] = await db.query(query, [id]);

        res.json({
            success: true,
            followUps
        });

    } catch (error) {
        console.error('Get follow-ups error:', error);
        res.status(500).json({ error: 'Failed to fetch follow-ups', details: error.message });
    }
};

// POST /api/applications/:id/follow-ups - Add follow-up (admin only)
exports.addFollowUp = async (req, res) => {
    try {
        const { id } = req.params;
        const { followUpDate, followUpType, notes, status } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add follow-ups' });
        }

        if (!followUpDate || !followUpType) {
            return res.status(400).json({ error: 'Follow-up date and type are required' });
        }

        // Verify application exists
        const [applications] = await db.query('SELECT AppID FROM Applications WHERE AppID = ?', [id]);
        if (applications.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const [result] = await db.query(
            'INSERT INTO Follow_Ups (ApplicationID, FollowUpDate, FollowUpType, Notes, Status) VALUES (?, ?, ?, ?, ?)',
            [id, followUpDate, followUpType, notes || null, status || 'Scheduled']
        );

        res.status(201).json({
            success: true,
            message: 'Follow-up added successfully',
            followUpId: result.insertId
        });

    } catch (error) {
        console.error('Add follow-up error:', error);
        res.status(500).json({ error: 'Failed to add follow-up', details: error.message });
    }
};

