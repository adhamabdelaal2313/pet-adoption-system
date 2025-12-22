const db = require('../config/db');

exports.getAdoptionRates = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(DISTINCT a.AnimalID) as total_animals,
                SUM(CASE WHEN a.Status = 'Adopted' THEN 1 ELSE 0 END) as adopted_count,
                SUM(CASE WHEN a.Status = 'Available' THEN 1 ELSE 0 END) as available_count,
                SUM(CASE WHEN a.Status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
                ROUND(SUM(CASE WHEN a.Status = 'Adopted' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT a.AnimalID), 2) as adoption_rate_percent
            FROM Animals a
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            report: 'Adoption Rates Report',
            data: results[0]
        });
        
    } catch (error) {
        console.error('Adoption rates error:', error);
        res.status(500).json({ error: 'Failed to generate adoption rates report' });
    }
};

exports.getPopularBreeds = async (req, res) => {
    try {
        const query = `
            SELECT 
                b.BreedName,
                s.SpeciesName,
                COUNT(a.AnimalID) as total_animals,
                SUM(CASE WHEN a.Status = 'Adopted' THEN 1 ELSE 0 END) as adopted_count,
                SUM(CASE WHEN a.Status = 'Available' THEN 1 ELSE 0 END) as available_count
            FROM Breeds b
            JOIN Species s ON b.SpeciesID = s.SpeciesID
            LEFT JOIN Animals a ON b.BreedID = a.BreedID
            GROUP BY b.BreedID, b.BreedName, s.SpeciesName
            ORDER BY total_animals DESC
            LIMIT 10
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            report: 'Popular Breeds Report',
            data: results
        });
        
    } catch (error) {
        console.error('Popular breeds error:', error);
        res.status(500).json({ error: 'Failed to generate popular breeds report' });
    }
};

exports.getAverageWaitingTimes = async (req, res) => {
    try {
        const query = `
            SELECT 
                AVG(DATEDIFF(app.AppDate, a.IntakeDate)) as avg_days_to_application,
                AVG(CASE 
                    WHEN app.Status = 'Approved' THEN DATEDIFF(app.AppDate, a.IntakeDate)
                    ELSE NULL 
                END) as avg_days_to_approval,
                MIN(DATEDIFF(app.AppDate, a.IntakeDate)) as min_days,
                MAX(DATEDIFF(app.AppDate, a.IntakeDate)) as max_days
            FROM Animals a
            JOIN Applications app ON a.AnimalID = app.AnimalID
            WHERE a.Status = 'Adopted' OR app.Status IN ('Approved', 'Completed')
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            report: 'Average Waiting Times Report',
            data: results[0]
        });
        
    } catch (error) {
        console.error('Waiting times error:', error);
        res.status(500).json({ error: 'Failed to generate waiting times report' });
    }
};

exports.getHealthStatusReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                a.HealthStatus,
                COUNT(DISTINCT a.AnimalID) as animal_count,
                COUNT(mr.RecordID) as total_medical_records,
                COUNT(DISTINCT CASE WHEN mr.RecordType = 'Vaccination' THEN mr.RecordID END) as vaccination_count,
                COUNT(DISTINCT CASE WHEN mr.RecordType = 'Treatment' THEN mr.RecordID END) as treatment_count
            FROM Animals a
            LEFT JOIN Medical_Records mr ON a.AnimalID = mr.AnimalID
            GROUP BY a.HealthStatus
            ORDER BY animal_count DESC
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            report: 'Health Status Report',
            data: results
        });
        
    } catch (error) {
        console.error('Health status error:', error);
        res.status(500).json({ error: 'Failed to generate health status report' });
    }
};

exports.getShelterPerformance = async (req, res) => {
    try {
        const query = `
            SELECT 
                s.ShelterName,
                s.City,
                s.Capacity,
                COUNT(DISTINCT a.AnimalID) as total_animals,
                SUM(CASE WHEN a.Status = 'Adopted' THEN 1 ELSE 0 END) as adopted_count,
                SUM(CASE WHEN a.Status = 'Available' THEN 1 ELSE 0 END) as available_count,
                ROUND(SUM(CASE WHEN a.Status = 'Adopted' THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT a.AnimalID), 2) as adoption_rate_percent,
                ROUND(COUNT(DISTINCT a.AnimalID) * 100.0 / s.Capacity, 2) as capacity_utilization_percent
            FROM Shelters s
            LEFT JOIN Animals a ON s.ShelterID = a.ShelterID
            GROUP BY s.ShelterID, s.ShelterName, s.City, s.Capacity
            ORDER BY adoption_rate_percent DESC
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            report: 'Shelter Performance Report',
            data: results
        });
        
    } catch (error) {
        console.error('Shelter performance error:', error);
        res.status(500).json({ error: 'Failed to generate shelter performance report' });
    }
};

exports.getFollowUpReport = async (req, res) => {
    try {
        const query = `
            SELECT 
                app.AppID,
                a.Name as PetName,
                b.BreedName,
                ad.FirstName as AdopterFirstName,
                ad.LastName as AdopterLastName,
                app.AppDate,
                app.Status as ApplicationStatus,
                COUNT(fu.FollowUpID) as total_followups,
                SUM(CASE WHEN fu.Status = 'Completed' THEN 1 ELSE 0 END) as completed_followups,
                MAX(fu.FollowUpDate) as last_followup_date
            FROM Applications app
            JOIN Animals a ON app.AnimalID = a.AnimalID
            JOIN Breeds b ON a.BreedID = b.BreedID
            JOIN Adopters ad ON app.AdopterID = ad.AdopterID
            LEFT JOIN Follow_Ups fu ON app.AppID = fu.ApplicationID
            WHERE app.Status IN ('Approved', 'Completed')
            GROUP BY app.AppID, a.Name, b.BreedName, ad.FirstName, ad.LastName, app.AppDate, app.Status
            ORDER BY app.AppDate DESC
        `;
        
        const [results] = await db.query(query);
        
        res.json({
            success: true,
            report: 'Follow-Up Report',
            data: results
        });
        
    } catch (error) {
        console.error('Follow-up report error:', error);
        res.status(500).json({ error: 'Failed to generate follow-up report' });
    }
};

