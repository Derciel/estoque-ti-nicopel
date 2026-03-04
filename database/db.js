const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        // Se existir a variável do Render, usa ela. Senão, usa o caminho local.
        filename: process.env.DB_CONNECTION_FILENAME || path.resolve(__dirname, '../dev.sqlite3'),
    },
    useNullAsDefault: true,
});

module.exports = db;