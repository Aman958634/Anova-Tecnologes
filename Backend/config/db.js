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
 * Primary DB config for TiDB Cloud / MySQL-compatible providers.
 * Keeps backward-compatible fallbacks for existing deployments.
 */
const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQL_HOST || process.env.DATABASE_HOST || process.env.MYSQLHOST,
  port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || process.env.DATABASE_PORT || process.env.MYSQLPORT || 3306),
  user: process.env.DB_USER || process.env.MYSQL_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE
};

const useSsl = toBoolean(process.env.DB_SSL ?? process.env.MYSQL_SSL, true);
const rejectUnauthorized = toBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED ?? process.env.MYSQL_SSL_REJECT_UNAUTHORIZED, false);
const sslConfig = useSsl
  ? {
      minVersion: 'TLSv1.2',
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
  'DB_HOST (or MYSQLHOST / MYSQL_HOST / DATABASE_HOST / DATABASE_URL)',
  'DB_PORT (or MYSQLPORT / MYSQL_PORT / DATABASE_PORT / DATABASE_URL)',
  'DB_USER (or MYSQLUSER / MYSQL_USER / DATABASE_URL)',
  'DB_PASSWORD (or MYSQLPASSWORD / MYSQL_PASSWORD / DATABASE_URL)',
  'DB_NAME (or MYSQLDATABASE / MYSQL_DATABASE / DATABASE_URL)'
];

if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  throw new Error(`❌ Missing required MySQL configuration. Please set one of the supported env vars: ${requiredVars.join(', ')}`);
}

console.log('🛠️  MySQL config loaded:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: useSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized } : false,
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
  const connection = await mysql.createConnection({
    ...baseConfig,
    ssl: sslConfig,
  });
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