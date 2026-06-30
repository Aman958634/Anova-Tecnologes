require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST,
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER,
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE
};

const requiredDbEnv = {
  host: 'MYSQLHOST or MYSQL_HOST',
  port: 'MYSQLPORT or MYSQL_PORT',
  user: 'MYSQLUSER or MYSQL_USER',
  password: 'MYSQLPASSWORD or MYSQL_PASSWORD',
  database: 'MYSQLDATABASE or MYSQL_DATABASE'
};

for (const [key, envName] of Object.entries(requiredDbEnv)) {
  if (!dbConfig[key]) {
    throw new Error(`Missing required database environment variable: ${envName}`);
  }
}

const connectionConfig = {
  host: dbConfig.host,
  port: Number(dbConfig.port),
  user: dbConfig.user,
  password: dbConfig.password
};

const pool = mysql.createPool({
  ...connectionConfig,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

async function ensureDatabaseExists() {
  const connection = await mysql.createConnection(connectionConfig);
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  } finally {
    await connection.end();
  }
}

async function testConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

module.exports = { pool, testConnection, ensureDatabaseExists, dbConfig };
