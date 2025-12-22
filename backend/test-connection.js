// Quick connection test script
// Run with: node test-connection.js

require('dotenv').config();
const mysql = require('mysql2');

console.log('🔍 Testing database connection...\n');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
}

const url = new URL(process.env.DATABASE_URL);
const config = {
    host: url.hostname,
    port: parseInt(url.port) || 4000,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1) || 'pet_adoption',
    ssl: url.searchParams.get('ssl') === 'true' ? {
        rejectUnauthorized: false
    } : undefined
};

console.log('Connection details:');
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  User: ${config.user}`);
console.log(`  Database: ${config.database}`);
console.log(`  SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
console.log(`  Password: ${config.password ? '***' + config.password.slice(-3) : 'NOT SET'}\n`);

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        console.error(`   Error code: ${err.code}`);
        console.error(`   Error number: ${err.errno}`);
        
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('\n💡 Troubleshooting steps:');
            console.error('   1. Verify your password in TiDB Cloud dashboard');
            console.error('   2. Check if your IP address is whitelisted');
            console.error('   3. Ensure the user has proper permissions');
            console.error('   4. Try resetting the password in TiDB Cloud');
        }
        
        process.exit(1);
    } else {
        console.log('✅ Connection successful!');
        
        // Test query
        connection.query('SELECT DATABASE() as current_db, VERSION() as tidb_version', (err, results) => {
            if (err) {
                console.error('❌ Query failed:', err.message);
            } else {
                console.log('\n📊 Database info:');
                console.log(`   Current database: ${results[0].current_db}`);
                console.log(`   TiDB version: ${results[0].tidb_version}`);
            }
            
            connection.end();
            process.exit(0);
        });
    }
});

