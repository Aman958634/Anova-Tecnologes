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
const { ensureChatbotTables } = require('./controllers/chatbotController');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8080;

const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
const projectUploadsDir = path.join(uploadsDir, 'projects');
const teamUploadsDir = path.join(uploadsDir, 'team');


// =========================
// CORS CONFIG (SAFE)
// =========================
const allowedOrigins = [
  'https://anova-tecnologes.vercel.app',
  'http://localhost:5173',
  'http://localhost:5175',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
].map(o => o.trim());

const corsOptions = {
  origin: function (origin, callback) {
    // allow REST tools / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    if (origin.endsWith('.vercel.app') || origin.endsWith('.railway.app') || origin.endsWith('.onrender.com')) {
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
// Handle preflight requests without using wildcard route registration that can
// crash on newer path-to-regexp versions.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// =========================
// CREATE UPLOAD FOLDER
// =========================
for (const dir of [uploadsDir, projectUploadsDir, teamUploadsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

app.use('/uploads', express.static(uploadsDir, { index: false, maxAge: '30d' }));

// Extra safety: ensure other responses include CORS header if middleware missed it
app.use((req, res, next) => {
  if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  next();
});


// =========================
// ROUTES
// =========================
app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    version: '2.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    service: 'backend'
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

async function seedDefaultProjects() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM projects');
  if (rows[0].total > 0) return;

  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Scalable e-commerce with payments, inventory, and analytics.',
      image_url: null,
      live_demo_url: null,
      tags: JSON.stringify(['ecommerce', 'react', 'node']),
      featured: 1
    },
    {
      title: 'SaaS Dashboard',
      description: 'Multi-tenant SaaS dashboard with role-based access and reporting.',
      image_url: null,
      live_demo_url: null,
      tags: JSON.stringify(['saas', 'dashboard', 'analytics']),
      featured: 0
    }
  ];

  const values = projects.map((p) => [p.title, p.description, p.image_url, p.live_demo_url, p.tags, p.featured]);
  await pool.query('INSERT INTO projects (title, description, image_url, live_demo_url, tags, featured) VALUES ?;', [values]);
  console.log('✅ Default projects seeded into projects table');
}

async function seedDefaultTeam() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM team_members');
  if (rows[0].total > 0) return;

  const members = [
    { name: 'Aarav Shah', designation: 'Founder & CTO', image_url: null, featured: 1 },
    { name: 'Maya Patel', designation: 'Lead UI Designer', image_url: null, featured: 0 },
    { name: 'Noah Bennett', designation: 'Full Stack Engineer', image_url: null, featured: 0 }
  ];

  const values = members.map((m) => [m.name, m.designation, m.image_url, m.featured]);
  await pool.query('INSERT INTO team_members (name, designation, image_url, featured) VALUES ?;', [values]);
  console.log('✅ Default team members seeded into team_members table');
}

async function seedDefaultTestimonials() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM testimonials');
  if (rows[0].total > 0) return;

  const testimonials = [
    { name: 'Sophia Miller', designation: 'Product Director, NovaOps', review: 'The team delivered a launch-ready platform with speed, polish, and a clear technical vision.', rating: 5, photo_url: null },
    { name: 'Daniel Carter', designation: 'Founder, GridFlow', review: 'The UI, motion, and responsiveness all feel deeply considered. It elevated our brand immediately.', rating: 5, photo_url: null },
    { name: 'Ava Thompson', designation: 'Marketing Lead, BluePeak', review: 'A clean process, strong communication, and a product that looks premium on every screen size.', rating: 5, photo_url: null }
  ];

  const values = testimonials.map((t) => [t.name, t.designation, t.review, t.photo_url, t.rating]);
  await pool.query('INSERT INTO testimonials (name, designation, review, photo_url, rating) VALUES ?;', [values]);
  console.log('✅ Default testimonials seeded into testimonials table');
}

async function seedDefaultBlogs() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM blogs');
  if (rows[0].total > 0) return;

  const blogs = [
    { title: 'Building Scalable Web Apps', excerpt: 'Best practices for scalable web architecture.', content: null, category: 'Engineering', image_url: null, published_at: null },
    { title: 'Design Systems 101', excerpt: 'How to create a consistent design system.', content: null, category: 'Design', image_url: null, published_at: null }
  ];

  const values = blogs.map((b) => [b.title, b.excerpt, b.content, b.category, b.image_url, b.published_at]);
  await pool.query('INSERT INTO blogs (title, excerpt, content, category, image_url, published_at) VALUES ?;', [values]);
  console.log('✅ Default blogs seeded into blogs table');
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

    await seedDefaultProjects();
    console.log('✅ Default projects ready');

    await seedDefaultTeam();
    console.log('✅ Default team ready');

    await seedDefaultTestimonials();
    console.log('✅ Default testimonials ready');

    await seedDefaultBlogs();
    console.log('✅ Default blogs ready');

    await ensureChatbotTables();
    console.log('✅ Chatbot tables ready');

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