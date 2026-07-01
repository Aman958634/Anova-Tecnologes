const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');

const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@anova.com').toLowerCase().trim();
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';
const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || 'Admin';

async function findUserByEmail(email) {
  const [users] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return users[0] || null;
}

async function createDefaultAdmin(email, password) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [defaultAdminName, email, hashedPassword, 'admin']
  );
  const [users] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [result.insertId]);
  return users[0] || null;
}

async function updateDefaultAdminPassword(user, password) {
  const hashedPassword = await bcrypt.hash(password, 12);
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
      return res.status(401).json({ message: 'Invalid credentials.' });
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

module.exports = { login, me };
