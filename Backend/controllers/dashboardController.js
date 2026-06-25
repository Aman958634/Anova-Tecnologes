const asyncHandler = require('../utils/asyncHandler');
const { countRows } = require('../models/baseModel');

const getStats = asyncHandler(async (req, res) => {
  const [services, projects, team, blogs, testimonials, contacts] = await Promise.all([
    countRows('services'),
    countRows('projects'),
    countRows('team_members'),
    countRows('blogs'),
    countRows('testimonials'),
    countRows('contacts')
  ]);

  res.json({ services, projects, team, blogs, testimonials, contacts });
});

module.exports = { getStats };
