const { pool } = require('../config/db');

async function findById(table, id) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function deleteById(table, id) {
  const [result] = await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

async function countRows(table) {
  const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM ${table}`);
  return rows[0]?.total || 0;
}

module.exports = { findById, deleteById, countRows };
