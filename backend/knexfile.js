require('dotenv').config();

const config = {
  client: process.env.DB_CLIENT || 'sqlite3',
  connection: {
    // Tenta ler o caminho do Disk (/data/dev.sqlite3), senão o local
    filename: process.env.DB_CONNECTION_FILENAME || './dev.sqlite3'
  },
  useNullAsDefault: true,
  migrations: {
    directory: './database/migrations'
  }
};

module.exports = {
  development: config,
  production: config // Adicione esta linha para o Render
};