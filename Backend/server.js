require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

const { pool, testConnection } = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');


// =========================
// CORS CONFIG (SAFE)
// =========================
const allowedOrigins = [
  'https://anova-tecnologes.vercel.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
].map(o => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // allow REST tools / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
};


// =========================
// MIDDLEWARE
// =========================
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// =========================
// CREATE UPLOAD FOLDER
// =========================
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));


// =========================
// ROUTES
// =========================
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});


// =========================
// ERROR HANDLING
// =========================
app.use(notFound);
app.use(errorHandler);


// =========================
// DEFAULT ADMIN SEED
// =========================
async function ensureDefaultAdmin() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@anova.com').toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345';
  const name = process.env.DEFAULT_ADMIN_NAME || 'Admin';

  const [rows] = await pool.query(
    'SELECT id, password, role FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const hashedPassword = await bcrypt.hash(password, 12);

  if (rows.length === 0) {
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );

    console.log(`✅ Admin created: ${email}`);
    return;
  }

  const user = rows[0];

  if (user.role !== 'admin') {
    await pool.query('UPDATE users SET role=? WHERE id=?', ['admin', user.id]);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    await pool.query(
      'UPDATE users SET password=? WHERE id=?',
      [hashedPassword, user.id]
    );
    console.log(`🔁 Admin password updated: ${email}`);
  } else {
    console.log(`✅ Admin verified: ${email}`);
  }
}

async function seedDefaultServices() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM services');
  if (rows[0].total > 0) return;

  const services = [
    {
      title: 'Web Development',
      description: 'High-performance digital experiences built with modern frameworks and scalable architecture.',
      icon: 'globe',
      key_features: JSON.stringify([
        'Attractive & Responsive Design',
        'User-Friendly Experience',
        'Best for Services & Businesses'
      ]),
      image_url: null,
      featured: 1
    },
    {
      title: 'Mobile App Development',
      description: 'Native-feeling mobile products with polished UX, secure APIs, and fast iteration cycles.',
      icon: 'smartphone',
      key_features: JSON.stringify([
        'Android & iOS App Development',
        'User-Friendly & High-Performance Apps',
        'Business-Centric Custom Solutions'
      ]),
      image_url: null,
      featured: 1
    },
    {
      title: 'UI/UX Design',
      description: 'Conversion-focused interfaces, design systems, and interaction details that feel premium.',
      icon: 'palette',
      key_features: JSON.stringify([
        'Attractive & Responsive Design',
        'User-Friendly Experience',
        'Best for Services & Businesses'
      ]),
      image_url: null,
      featured: 0
    },
    {
      title: 'Cloud Solutions',
      description: 'Deployment-ready cloud foundations, monitoring, and resilient delivery workflows.',
      icon: 'cloud',
      key_features: JSON.stringify([
        'Cloud Architecture',
        'Managed Hosting',
        'Performance & Reliability'
      ]),
      image_url: null,
      featured: 0
    },
    {
      title: 'AI Solutions',
      description: 'Automation layers, copilots, and intelligent features tailored to your business goals.',
      icon: 'cpu',
      key_features: JSON.stringify([
        'Intelligent Automation',
        'Data-Driven Insights',
        'Custom AI Workflows'
      ]),
      image_url: null,
      featured: 0
    },
    {
      title: 'Digital Marketing',
      description: 'Growth campaigns backed by analytics, audience insights, and measurable conversion strategies.',
      icon: 'megaphone',
      key_features: JSON.stringify([
        'Social Media Marketing',
        'SEO & Website Optimization',
        'Google Ads & PPC Campaigns'
      ]),
      image_url: null,
      featured: 0
    }
  ];

  const values = services.map((service) => [
    service.title,
    service.description,
    service.icon,
    service.key_features,
    service.image_url,
    service.featured
  ]);

  await pool.query(
    'INSERT INTO services (title, description, icon, key_features, image_url, featured) VALUES ?;',
    [values]
  );

  console.log('✅ Default services seeded into services table');
}


// =========================
// BOOTSTRAP SERVER
// =========================
async function bootstrap() {
  try {
    await testConnection();
    console.log('✅ Database connected');

    await ensureDefaultAdmin();
    console.log('✅ Default admin ready');

    await seedDefaultServices();
    console.log('✅ Default services ready');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err.message);

    // DO NOT silently continue in production
    process.exit(1);
  }
}

bootstrap();

module.exports = app;