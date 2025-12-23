const db = require('../config/db');

// GET /api/medical/:animalId - Get medical records for an animal
exports.getMedicalRecords = async (req, res) => {
    try {
        const { animalId } = req.params;

        const query = `
            SELECT 
                m.RecordID,
                m.AnimalID,
                m.RecordDate,
                m.RecordType,
                m.Description,
                m.Veterinarian,
                m.Notes,
                a.Name as AnimalName
            FROM Medical_Records m
            JOIN Animals a ON m.AnimalID = a.AnimalID
            WHERE m.AnimalID = ?
            ORDER BY m.RecordDate DESC
        `;

        const [records] = await db.query(query, [animalId]);

        res.json({
            success: true,
            records
        });

    } catch (error) {
        console.error('Get medical records error:', error);
        res.status(500).json({ error: 'Failed to fetch medical records', details: error.message });
    }
};

// POST /api/medical - Add medical record (admin only)
exports.addMedicalRecord = async (req, res) => {
    try {
        const { animalId, recordDate, recordType, description, veterinarian, notes } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add medical records' });
        }

        if (!animalId || !recordDate || !recordType) {
            return res.status(400).json({ error: 'Animal ID, record date, and record type are required' });
        }

        // Verify animal exists
        const [animals] = await db.query('SELECT AnimalID FROM Animals WHERE AnimalID = ?', [animalId]);
        if (animals.length === 0) {
            return res.status(404).json({ error: 'Animal not found' });
        }

        const [result] = await db.query(
            'INSERT INTO Medical_Records (AnimalID, RecordDate, RecordType, Description, Veterinarian, Notes) VALUES (?, ?, ?, ?, ?, ?)',
            [animalId, recordDate, recordType, description || null, veterinarian || null, notes || null]
        );

        res.status(201).json({
            success: true,
            message: 'Medical record added successfully',
            recordId: result.insertId
        });

    } catch (error) {
        console.error('Add medical record error:', error);
        res.status(500).json({ error: 'Failed to add medical record', details: error.message });
    }
};

// PUT /api/medical/:id - Update medical record (admin only)
exports.updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { recordDate, recordType, description, veterinarian, notes } = req.body;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can update medical records' });
        }

        const updates = [];
        const params = [];

        if (recordDate) {
            updates.push('RecordDate = ?');
            params.push(recordDate);
        }
        if (recordType) {
            updates.push('RecordType = ?');
            params.push(recordType);
        }
        if (description !== undefined) {
            updates.push('Description = ?');
            params.push(description);
        }
        if (veterinarian !== undefined) {
            updates.push('Veterinarian = ?');
            params.push(veterinarian);
        }
        if (notes !== undefined) {
            updates.push('Notes = ?');
            params.push(notes);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        params.push(id);

        await db.query(`UPDATE Medical_Records SET ${updates.join(', ')} WHERE RecordID = ?`, params);

        res.json({
            success: true,
            message: 'Medical record updated successfully'
        });

    } catch (error) {
        console.error('Update medical record error:', error);
        res.status(500).json({ error: 'Failed to update medical record', details: error.message });
    }
};

// DELETE /api/medical/:id - Delete medical record (admin only)
exports.deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete medical records' });
        }

        await db.query('DELETE FROM Medical_Records WHERE RecordID = ?', [id]);

        res.json({
            success: true,
            message: 'Medical record deleted successfully'
        });

    } catch (error) {
        console.error('Delete medical record error:', error);
        res.status(500).json({ error: 'Failed to delete medical record', details: error.message });
    }
};

