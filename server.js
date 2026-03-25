require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const history = require('connect-history-api-fallback');
const errorMiddleware = require('./middleware/errorMiddleware');

// Importação das rotas
const equipamentosRoutes = require('./routes/equipamentos');
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://estoque-ti-nicopel.onrender.com',
  'https://estoque-ti-nicopel-1.onrender.com',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.RENDER_EXTERNAL_URL, // URL dinâmica do Render
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(express.json());

// --- CONFIGURAÇÃO DE UPLOADS ---
const uploadDir = fs.existsSync('/data')
  ? '/data/uploads'
  : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

// --- ROTAS DA API ---
app.use('/api/equipamentos', equipamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('Backend está ativo!');
});

// --- SERVINDO O FRONTEND (SPA) ---
const frontendBuildPath = path.resolve(__dirname, 'frontend/build');

// 1. Serve arquivos estáticos do build
app.use(express.static(frontendBuildPath));

// 2. Middleware para suporte a SPA (History API)
app.use(history({
  index: '/index.html',
  rewrites: [
    { from: /^\/api\/.*$/, to: (context) => context.parsedUrl.pathname },
    { from: /^\/uploads\/.*$/, to: (context) => context.parsedUrl.pathname }
  ],
  verbose: false
}));

// 3. Fallback final para garantir que o index.html seja entregue
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Middleware de erro
app.use(errorMiddleware);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor unificado rodando na porta ${PORT}`);
  console.log(`📂 Servindo imagens de: ${uploadDir}`);
  console.log(`🌐 Servindo frontend de: ${frontendBuildPath}`);
});