const { pool } = require('../config/db');

async function tryParseJSON(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return value;
  value = value.trim();
  if (!value) return null;
  if (value.startsWith('[') || value.startsWith('{')) {
    try {
      return JSON.parse(value);
    } catch (err) {
      // fallthrough to split
    }
  }
  // fallback: comma separated
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

async function normalizeProjects() {
  const [rows] = await pool.query('SELECT id, tags FROM projects');
  for (const row of rows) {
    const parsed = await tryParseJSON(row.tags);
    if (parsed === null) continue;
    if (!Array.isArray(parsed)) continue; // already normalized or unexpected
    const tagsJson = JSON.stringify(parsed);
    await pool.query('UPDATE projects SET tags = ? WHERE id = ?', [tagsJson, row.id]);
    console.log(`Updated project ${row.id}`);
  }
}

async function normalizeServices() {
  const [rows] = await pool.query('SELECT id, key_features FROM services');
  for (const row of rows) {
    const parsed = await tryParseJSON(row.key_features);
    if (parsed === null) continue;
    if (!Array.isArray(parsed)) continue;
    const json = JSON.stringify(parsed);
    await pool.query('UPDATE services SET key_features = ? WHERE id = ?', [json, row.id]);
    console.log(`Updated service ${row.id}`);
  }
}

async function run() {
  try {
    console.log('Normalizing projects...');
    await normalizeProjects();
    console.log('Normalizing services...');
    await normalizeServices();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
}

run();
