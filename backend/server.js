// Carrega as variáveis de ambiente do ficheiro .env
require('dotenv').config();

// Importação dos módulos essenciais
const express = require('express');
const https = require('https');   // Módulo para criar um servidor HTTPS
const fs = require('fs');       // Módulo para ler os ficheiros do certificado
const path = require('path');     // Módulo para trabalhar com caminhos de ficheiros
const cors = require('cors');     // Módulo para permitir pedidos de outros domínios (o nosso front-end)

// Importação de todas as nossas rotas da API
const equipamentosRoutes = require('./routes/equipamentos');
const usuariosRoutes = require('./routes/usuarios');
const produtosRoutes = require('./routes/produtos');
const estoqueRoutes = require('./routes/estoque');
const dashboardRoutes = require('./routes/dashboard');

// Inicialização da aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Opções de configuração para o servidor HTTPS
// Lê os ficheiros de certificado de segurança que criámos
const options = {
  key: fs.readFileSync(path.join(__dirname, 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
};

// Middlewares (funções que são executadas em todos os pedidos)
app.use(cors()); // Habilita o CORS para permitir a comunicação com o front-end
app.use(express.json()); // Permite que o servidor entenda JSON no corpo dos pedidos

// Middleware para servir ficheiros estáticos (as nossas imagens de produtos)
// Qualquer pedido para /uploads/imagem.png será servido a partir da pasta física 'backend/uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Registo de todas as rotas da API
// Diz ao Express para usar os ficheiros de rotas que importámos
app.use('/api/equipamentos', equipamentosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Inicia o servidor em modo HTTPS
https.createServer(options, app).listen(PORT, () => {
  // A mensagem no terminal para sabermos que o servidor arrancou com sucesso
  console.log(`🚀 Servidor backend rodando em modo SEGURO (HTTPS) na porta https://10.1.1.85:${PORT}`);
});