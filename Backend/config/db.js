require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Railway / Production MySQL config
 */
const dbConfig = {
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT || 3306),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
};

/**
 * Validate required env vars early
 */
const requiredVars = [
  'MYSQLHOST',
  'MYSQLPORT',
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQLDATABASE'
];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
}

/**
 * Create connection config (without database)
 */
const baseConfig = {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password
};

/**
 * Connection pool (main DB connection)
 */
const pool = mysql.createPool({
  ...baseConfig,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

/**
 * Test DB connection
 */
async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}

/**
 * OPTIONAL: create database if not exists
 * (use only in setup scripts, not production runtime)
 */
async function ensureDatabaseExists() {
  const connection = await mysql.createConnection(baseConfig);
  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
    );
  } finally {
    await connection.end();
  }
}

module.exports = {
  pool,
  testConnection,
  ensureDatabaseExists,
  dbConfig
};