const knex = require('knex');
const knexConfig = require('../knexfile');

// Define o ambiente (default = development)
const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);

module.exports = db;