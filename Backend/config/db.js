require('dotenv').config();
const mysql = require('mysql2/promise');

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.CLEARDB_DATABASE_URL;

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname?.replace(/^\//, '')
  };
}

/**
 * Railway / Production MySQL config
 */
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DATABASE_HOST,
  port: Number(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DATABASE_PORT || 3306),
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE
};

if (databaseUrl) {
  Object.assign(dbConfig, parseDatabaseUrl(databaseUrl));
}

/**
 * Validate required env vars early
 */
const requiredVars = [
  'MYSQLHOST or MYSQL_HOST or DATABASE_HOST or DATABASE_URL',
  'MYSQLPORT or MYSQL_PORT or DATABASE_PORT or DATABASE_URL',
  'MYSQLUSER or MYSQL_USER or DATABASE_URL',
  'MYSQLPASSWORD or MYSQL_PASSWORD or DATABASE_URL',
  'MYSQLDATABASE or MYSQL_DATABASE or DATABASE_URL'
];

if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error(`❌ Missing required MySQL configuration. Please set one of the supported env vars: ${requiredVars.join(', ')}`);
}

console.log('🛠️  MySQL config loaded:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
});

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