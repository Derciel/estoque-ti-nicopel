require('dotenv').config(); // Adiciona no topo aqui também

module.exports = {
  development: {
    client: process.env.DB_CLIENT, // Lê a variável do .env
    connection: {
      filename: process.env.DB_CONNECTION_FILENAME // Lê a variável do .env
    },
    useNullAsDefault: true,
    migrations: {
      directory: './database/migrations'
    }
  }
};