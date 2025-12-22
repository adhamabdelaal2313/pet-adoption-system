require('dotenv').config();
const mysql = require('mysql2');

if (!process.env.DATABASE_URL) {
    throw new Error('❌ DATABASE_URL is missing from .env file');
}

// 1. Parse the URL
const dbUrl = new URL(process.env.DATABASE_URL);

// 2. Create the Pool with FORCED SSL
const pool = mysql.createPool({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    port: Number(dbUrl.port) || 4000,
    
    // CRITICAL: TiDB Cloud requires SSL but with rejectUnauthorized: false
    ssl: {
        rejectUnauthorized: false 
    },
    
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// 3. Test Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database Connection Failed:', err.message);
    } else {
        console.log('✅ Connected to TiDB successfully!');
        connection.release();
    }
});

module.exports = pool.promise();