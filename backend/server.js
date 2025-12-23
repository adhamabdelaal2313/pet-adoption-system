const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import DB connection
const db = require('./src/config/db');

const app = express();

// Middleware - CRITICAL: Set limit to 50mb for Base64 image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import Routes
const authRoutes = require('./src/routes/auth.routes');
const petRoutes = require('./src/routes/pet.routes');
const reportRoutes = require('./src/routes/report.routes');
const adminRoutes = require('./src/routes/admin.routes');
const applicationRoutes = require('./src/routes/application.routes');
const medicalRoutes = require('./src/routes/medical.routes');

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Pet Adoption API v2 is running...' });
});

// API Info Route (must be before route mounting)
app.get('/api', (req, res) => {
    res.json({
        message: 'Pet Adoption API',
        version: '2.0',
        endpoints: {
            auth: {
                signup: 'POST /api/auth/signup',
                login: 'POST /api/auth/login'
            },
            pets: {
                getAll: 'GET /api/pets',
                getById: 'GET /api/pets/:id',
                create: 'POST /api/pets',
                update: 'PUT /api/pets/:id',
                delete: 'DELETE /api/pets/:id'
            },
            reports: {
                adoptionRates: 'GET /api/reports/adoption-rates',
                popularBreeds: 'GET /api/reports/popular-breeds',
                waitingTimes: 'GET /api/reports/waiting-times',
                healthStatus: 'GET /api/reports/health-status',
                shelterPerformance: 'GET /api/reports/shelter-performance',
                followUps: 'GET /api/reports/follow-ups'
            },
            admin: {
                breeds: 'GET /api/admin/breeds',
                shelters: 'GET /api/admin/shelters',
                species: 'GET /api/admin/species'
            },
            applications: {
                getAll: 'GET /api/applications',
                getById: 'GET /api/applications/:id',
                submit: 'POST /api/applications',
                updateStatus: 'PUT /api/applications/:id',
                getFollowUps: 'GET /api/applications/:id/follow-ups',
                addFollowUp: 'POST /api/applications/:id/follow-ups'
            },
            medical: {
                getRecords: 'GET /api/medical/:animalId',
                addRecord: 'POST /api/medical',
                updateRecord: 'PUT /api/medical/:id',
                deleteRecord: 'DELETE /api/medical/:id'
            },
            test: {
                database: 'GET /api/test-db'
            }
        }
    });
});

// Mount Routes (after /api info route)
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/medical', medicalRoutes);

// Database Test Route
app.get('/api/test-db', async (req, res) => {
    try {
        const [result] = await db.query('SELECT 1 as test');
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            test: result 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Database connection failed',
            details: error.message,
            code: error.code
        });
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;

