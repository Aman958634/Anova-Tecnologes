const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');

const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@anova.com').toLowerCase().trim();
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';
const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || 'Admin';

async function findUserByEmail(email) {
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return users[0] || null;
  } catch (error) {
    // If DB is down and we're in fallback mode, behave as if user is not found
    if (global.DB_DOWN) return null;
    throw error;
  }
}

async function createDefaultAdmin(email, password) {
  const hashedPassword = await bcrypt.hash(password, 12);
  if (global.DB_DOWN) {
    // Return an in-memory user object for dev fallback (id 0 reserved)
    return {
      id: 0,
      name: defaultAdminName,
      email,
      password: hashedPassword,
      role: 'admin'
    };
  }

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [defaultAdminName, email, hashedPassword, 'admin']
  );
  const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [result.insertId]);
  return users[0] || null;
}

async function updateDefaultAdminPassword(user, password) {
  const hashedPassword = await bcrypt.hash(password, 12);
  if (global.DB_DOWN) {
    return { ...user, password: hashedPassword, role: 'admin' };
  }

  await pool.query('UPDATE users SET password = ?, role = ? WHERE id = ?', [hashedPassword, 'admin', user.id]);
  return { ...user, password: hashedPassword, role: 'admin' };
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(normalizedEmail);
  const isDefaultAdminAttempt = normalizedEmail === defaultAdminEmail && password === defaultAdminPassword;

  let authenticatedUser = null;

  if (!user) {
    if (!isDefaultAdminAttempt) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    authenticatedUser = await createDefaultAdmin(normalizedEmail, defaultAdminPassword);
  } else {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      // If this is the default admin attempting to login with the default
      // password, reset the stored password to the default and allow login.
      if (isDefaultAdminAttempt) {
        authenticatedUser = await updateDefaultAdminPassword(user, defaultAdminPassword);
      } else {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
    }
    authenticatedUser = user;
  }

  const token = jwt.sign(
    { id: authenticatedUser.id, email: authenticatedUser.email, role: authenticatedUser.role, name: authenticatedUser.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.json({
    token,
    user: {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      email: authenticatedUser.email,
      role: authenticatedUser.role
    }
  });
});

const me = asyncHandler(async (req, res) => {
  const [users] = await pool.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1', [req.user.id]);
  res.json(users[0] || null);
});

const seedAdmin = asyncHandler(async (req, res) => {
  const secret = req.headers['x-seed-secret'] || req.body?.seedSecret;
  if (!process.env.SEED_SECRET) {
    return res.status(400).json({ message: 'SEED_SECRET is not configured on the server.' });
  }

  if (!secret || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ message: 'Forbidden.' });
  }

  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@anova.com').toLowerCase().trim();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';

  let user = null;
  try {
    user = await findUserByEmail(email);
  } catch (error) {
    // allow seeding to try even if DB may error; surface error
    return res.status(500).json({ message: 'DB error during seed', detail: error.message });
  }

  if (!user) {
    const created = await createDefaultAdmin(email, password);
    return res.json({ seeded: true, user: { id: created.id, email: created.email, name: created.name, role: created.role } });
  }

  const updated = await updateDefaultAdminPassword(user, password);
  return res.json({ seeded: true, user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role } });
});

module.exports = { login, me, seedAdmin };
