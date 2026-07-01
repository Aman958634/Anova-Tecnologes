require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { pool, testConnection, ensureDatabaseExists, dbConfig } = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
function normalizeOrigin(origin = '') {
  return origin.trim().replace(/\/+$|\s+/g, '');
}

const defaultAllowedOrigins = [
  'https://anova-tecnologes.vercel.app'
].map(normalizeOrigin);
const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...(process.env.CORS_ORIGIN || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)
].filter((origin, index, origins) => origins.indexOf(origin) === index);

const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
const allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];
const exposedHeaders = ['Authorization'];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) return true;
  return process.env.NODE_ENV !== 'production' && isLocalDevOrigin(origin);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: allowedMethods,
  allowedHeaders,
  exposedHeaders,
  optionsSuccessStatus: 204
};

const corsOriginsForLog = allowedOrigins.join(', ');
process.env.CORS_ORIGIN = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .join(',');

function isLocalDevOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(uploadsDir));
app.use('/api', routes);
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use(notFound);
app.use(errorHandler);

async function ensureSchema() {
  const schemaPath = path.join(__dirname, 'config', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const statements = schemaSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function ensureServiceColumns() {
  const [rows] = await pool.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'services' AND COLUMN_NAME = 'key_features'`,
    [dbConfig.database]
  );

  if (!rows.length) {
    await pool.query('ALTER TABLE services ADD COLUMN key_features JSON NULL AFTER icon');
  }
}

async function ensureDefaultAdmin() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@anova.com').toLowerCase().trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.DEFAULT_ADMIN_NAME || 'Admin';

  const [rows] = await pool.query('SELECT id, password, role FROM users WHERE email = ? LIMIT 1', [email]);
  const hashedPassword = await bcrypt.hash(password, 12);

  if (rows.length === 0) {
    await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
      name,
      email,
      hashedPassword,
      'admin'
    ]);
    return;
  }

  const existing = rows[0];
  if (existing.role !== 'admin') {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', ['admin', existing.id]);
  }

  const passwordMatches = await bcrypt.compare(password, existing.password);
  if (!passwordMatches) {
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, existing.id]);
  }
}

async function bootstrap() {
  await ensureDatabaseExists();
  await testConnection();
  await ensureSchema();
  await ensureServiceColumns();
  await ensureDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
