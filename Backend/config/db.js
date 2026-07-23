require('dotenv').config();
const mysql = require('mysql2/promise');

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.CLEARDB_DATABASE_URL;

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

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
  host: process.env.MYSQL_HOST || process.env.DATABASE_HOST || process.env.MYSQLHOST,
  port: Number(process.env.MYSQL_PORT || process.env.DATABASE_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.MYSQL_USER || process.env.MYSQLUSER,
  password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE
};

const useSsl = toBoolean(process.env.MYSQL_SSL, false);
const rejectUnauthorized = toBoolean(process.env.MYSQL_SSL_REJECT_UNAUTHORIZED, true);
const sslConfig = useSsl
  ? {
      rejectUnauthorized,
    }
  : undefined;

const hasExplicitMysqlConfig = Boolean(
  dbConfig.host && dbConfig.port && dbConfig.user && dbConfig.password && dbConfig.database
);

if (databaseUrl && !hasExplicitMysqlConfig) {
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
  ssl: sslConfig,
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