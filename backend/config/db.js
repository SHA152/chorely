const mysql = require('mysql');
require('dotenv').config();

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10 // Adjust based on expected load
});

// Promisify pool queries to use async/await
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
};

// Test database connection
const testConnection = () => {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error("❌ Database connection failed:", err);
            return;
        }
        console.log("✅ Connected to MySQL Database!");
        connection.release();
    });
};

module.exports = { query, testConnection };