require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // <--- ADICIONADO: Necessário para verificar pastas

// Importação das rotas
const equipamentosRoutes = require('./routes/equipamentos');
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const PORT = process.env.PORT || 10000;

const allowedOrigins = [
  'https://estoque-ti-nicopel.onrender.com',
  'http://localhost:3000', // Frontend local (React geralmente roda na 3000, não 3001)
  'http://localhost:3001', // Caso você use outra porta
  'https://estoque-ti-nicopel-1.onrender.com'
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

// --- CORREÇÃO DAS IMAGENS (PERSISTÊNCIA) ---

// 1. Define onde as imagens ficam. 
// Se existir a pasta '/data' (Render com Disk), usa ela. Se não, usa local.
const uploadDir = fs.existsSync('/data')
  ? '/data/uploads'
  : path.join(__dirname, 'uploads');

// 2. Garante que a pasta existe (cria se não existir)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Pasta de uploads criada em: ${uploadDir}`);
}

// 3. Serve os arquivos estáticos dessa pasta persistente
app.use('/uploads', express.static(uploadDir));

// ---------------------------------------------

// Conexão das rotas
app.use('/api/equipamentos', equipamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('Backend está ativo!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📂 Servindo imagens de: ${uploadDir}`);
});