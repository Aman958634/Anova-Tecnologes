const asyncHandler = require('../utils/asyncHandler');
const { pool } = require('../config/db');
const { getCache, setCache, invalidateCache } = require('../utils/simpleCache');

const setShortCacheHeaders = (res) => {
  res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=30');
};

const DEFAULT_STATS = {
  projects_completed: '156+',
  happy_clients: '200+',
  years_experience: '8+',
  team_members: '14'
};

async function ensureStatsRow() {
  const [rows] = await pool.query('SELECT * FROM site_stats WHERE id = 1 LIMIT 1');
  if (rows.length > 0) return rows[0];

  await pool.query(
    'INSERT INTO site_stats (id, projects_completed, happy_clients, years_experience, team_members) VALUES (1, ?, ?, ?, ?)',
    [
      DEFAULT_STATS.projects_completed,
      DEFAULT_STATS.happy_clients,
      DEFAULT_STATS.years_experience,
      DEFAULT_STATS.team_members
    ]
  );

  const [createdRows] = await pool.query('SELECT * FROM site_stats WHERE id = 1 LIMIT 1');
  return createdRows[0];
}

const getSiteStats = asyncHandler(async (req, res) => {
  const cacheKey = 'site_stats:latest';
  const cached = getCache(cacheKey);
  if (cached) {
    setShortCacheHeaders(res);
    return res.json(cached);
  }

  const stats = await ensureStatsRow();
  setCache(cacheKey, stats, 120000);
  setShortCacheHeaders(res);
  res.json(stats);
});

const updateSiteStats = asyncHandler(async (req, res) => {
  await ensureStatsRow();

  const projectsCompleted = req.body.projects_completed || DEFAULT_STATS.projects_completed;
  const happyClients = req.body.happy_clients || DEFAULT_STATS.happy_clients;
  const yearsExperience = req.body.years_experience || DEFAULT_STATS.years_experience;
  const teamMembers = req.body.team_members || DEFAULT_STATS.team_members;

  await pool.query(
    'UPDATE site_stats SET projects_completed = ?, happy_clients = ?, years_experience = ?, team_members = ? WHERE id = 1',
    [projectsCompleted, happyClients, yearsExperience, teamMembers]
  );
  invalidateCache('site_stats:');

  const [rows] = await pool.query('SELECT * FROM site_stats WHERE id = 1 LIMIT 1');
  res.json(rows[0]);
});

module.exports = { getSiteStats, updateSiteStats };
