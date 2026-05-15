const { v4: uuidv4 } = require('uuid');

const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createUniqueSlug = (text) => {
  const base = createSlug(text);
  const unique = uuidv4().split('-')[0];
  return `${base}-${unique}`;
};

module.exports = { createSlug, createUniqueSlug };
