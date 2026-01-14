require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
// ... (importação de todas as suas rotas)
const equipamentosRoutes = require('./routes/equipamentos');
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'https://estoque-ti-nicopel.onrender.com' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão das rotas
app.use('/api/equipamentos', equipamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta https://estoque-ti-nicopel.onrender.com:${PORT}`);
});