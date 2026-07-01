require('dotenv').config();
const mysql = require('mysql2/promise');

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.CLEARDB_DATABASE_URL;

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
  ssl: false
};

function parseDatabaseUrl(url) {
  const parsedUrl = new URL(url);
  const config = {
    host: parsedUrl.hostname,
    port: parsedUrl.port || '3306',
    user: decodeURIComponent(parsedUrl.username),
    password: decodeURIComponent(parsedUrl.password),
    database: parsedUrl.pathname?.replace(/^\//, '') || undefined,
    ssl: false
  };

  if (parsedUrl.searchParams.has('ssl')) {
    const sslValue = parsedUrl.searchParams.get('ssl');
    config.ssl = sslValue === 'true' || sslValue === 'require' || sslValue === '1';
  }

  if (parsedUrl.searchParams.has('sslmode')) {
    const sslmode = parsedUrl.searchParams.get('sslmode');
    config.ssl = sslmode === 'require' || sslmode === 'verify-ca' || sslmode === 'verify-full';
  }

  return config;
}

if (databaseUrl) {
  Object.assign(dbConfig, parseDatabaseUrl(databaseUrl));
}

const requiredDbEnv = {
  host: 'MYSQLHOST or MYSQL_HOST or DATABASE_URL',
  port: 'MYSQLPORT or MYSQL_PORT or DATABASE_URL',
  user: 'MYSQLUSER or MYSQL_USER or DATABASE_URL',
  password: 'MYSQLPASSWORD or MYSQL_PASSWORD or DATABASE_URL',
  database: 'MYSQLDATABASE or MYSQL_DATABASE or DATABASE_URL'
};

for (const [key, envName] of Object.entries(requiredDbEnv)) {
  if (!dbConfig[key]) {
    throw new Error(`Missing required database environment variable: ${envName}`);
  }
}

const pool = mysql.createPool({
  host: dbConfig.host,
  port: Number(dbConfig.port),
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Railway permissions issue ko avoid karne ke liye
async function ensureDatabaseExists() {
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: Number(dbConfig.port),
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    console.log('✅ Database connection verified');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('✅ MySQL connected successfully');
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  testConnection,
  ensureDatabaseExists,
  dbConfig
};