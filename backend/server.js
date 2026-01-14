require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importação das rotas
const equipamentosRoutes = require('./routes/equipamentos');
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// O Render define a porta automaticamente na variável process.env.PORT
const PORT = process.env.PORT || 10000;

// Configuração do CORS: 
// 1. Permite sua URL do Render
// 2. Permite localhost para que você ainda consiga testar no seu PC
const allowedOrigins = [
  'https://estoque-ti-nicopel.onrender.com', // URL do seu frontend no Render
  'http://localhost:3000'                  // Para testes locais
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Servindo arquivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexão das rotas
app.use('/api/equipamentos', equipamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de teste para verificar se o backend está vivo
app.get('/health', (req, res) => {
  res.status(200).send('Backend está ativo!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});