require('dotenv').config({ quiet: true });
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

const isRailwayInternalHost = typeof dbConfig.host === 'string' && dbConfig.host.endsWith('.railway.internal');
if (isRailwayInternalHost) {
  const fallbackPublicHost = process.env.MYSQL_PUBLIC_HOST || process.env.RAILWAY_PUBLIC_HOST || process.env.DATABASE_PUBLIC_HOST;
  const fallbackPublicPort = Number(process.env.MYSQL_PUBLIC_PORT || process.env.RAILWAY_PUBLIC_PORT || process.env.DATABASE_PUBLIC_PORT || dbConfig.port);
  if (fallbackPublicHost) {
    dbConfig.host = fallbackPublicHost;
    dbConfig.port = fallbackPublicPort;
    console.log('ℹ️  Using public MySQL host fallback for non-Railway network runtime.');
  }
}

const managedMysqlHostPattern = /(proxy\.rlwy\.net|railway)/i;
const inferredManagedMysql = managedMysqlHostPattern.test(String(dbConfig.host || '')) || Number(dbConfig.port) !== 3306;

// For managed MySQL providers (Railway/Render proxied endpoints), SSL is often required.
const useSsl = toBoolean(process.env.MYSQL_SSL, inferredManagedMysql);
const rejectUnauthorized = toBoolean(process.env.MYSQL_SSL_REJECT_UNAUTHORIZED, !inferredManagedMysql);
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
  connectTimeout: Number(process.env.MYSQL_CONNECT_TIMEOUT_MS || 20000),
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

function isTransientConnectionError(error) {
  const code = String(error?.code || '').toUpperCase();
  const message = String(error?.message || '').toLowerCase();
  return (
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE' ||
    code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' ||
    message.includes('connection lost') ||
    message.includes('server closed the connection')
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test DB connection
 */
async function testConnection({ retries = 5, baseDelayMs = 800 } = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.ping();
      return;
    } catch (error) {
      lastError = error;
      const shouldRetry = isTransientConnectionError(error) && attempt < retries;
      if (!shouldRetry) throw error;

      const delay = baseDelayMs * attempt;
      console.warn(`[db] Connection attempt ${attempt}/${retries} failed (${error?.code || 'UNKNOWN'}). Retrying in ${delay}ms...`);
      await wait(delay);
    } finally {
      if (conn) conn.release();
    }
  }

  throw lastError || new Error('Database connection failed after retries.');
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