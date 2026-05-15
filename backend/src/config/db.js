require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

// Required for Neon serverless on Node.js
neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err.message);
});

// Helper: run a query and return rows
const query = async (text, params) => {
  const result = await pool.query(text, params);
  return result;
};

// Helper: get first row or null
const queryOne = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
};

// Helper: get all rows
const queryAll = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};

// Helper: get count
const queryCount = async (text, params) => {
  const result = await pool.query(text, params);
  return parseInt(result.rows[0]?.count || 0);
};

module.exports = { pool, query, queryOne, queryAll, queryCount };
