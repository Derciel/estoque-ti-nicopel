const express = require('express');
const router = express.Router();
const db = require('../database/db');
const multer = require('multer');
const path = require('path');
// As importações do axios, form-data e fs não são mais necessárias aqui

// Configuração do Multer para guardar os ficheiros diretamente na pasta 'uploads'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // A pasta onde as imagens serão guardadas
  },
  filename: function (req, file, cb) {
    // Cria um nome de ficheiro único para evitar conflitos
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// ROTA GET: Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    // Usamos .select('*') para garantir que todos os campos da tabela são retornados
    const produtos = await db('produtos').select('*').orderBy('id', 'asc');
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos.' });
  }
});

// ROTA POST: Cadastrar um novo produto com upload de imagem simples
router.post('/', upload.single('imagem'), async (req, res) => {
  const { nome, marca, descricao } = req.body;
  // Se um ficheiro foi enviado, guarda o caminho dele, senão, guarda null.
  const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [produto] = await db('produtos').insert({ nome, marca, descricao, imagem_url }).returning('*');
    res.status(201).json(produto);
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    res.status(500).json({ message: 'Erro ao cadastrar produto.' });
  }
});

// ROTA PUT: Atualizar um produto existente, com opção de nova imagem
router.put('/:id', upload.single('imagem'), async (req, res) => {
  const { id } = req.params;
  const { nome, marca, descricao } = req.body;
  
  const updateData = { nome, marca, descricao };
  // Se um novo ficheiro for enviado na atualização, o seu caminho é adicionado
  if (req.file) {
    updateData.imagem_url = `/uploads/${req.file.filename}`;
  }

  try {
    const count = await db('produtos').where({ id }).update(updateData);
    if (count > 0) {
      const produto = await db('produtos').where({ id }).first();
      res.status(200).json(produto);
    } else {
      res.status(404).json({ message: 'Produto não encontrado.' });
    }
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ message: 'Erro ao atualizar produto.' });
  }
});

// ROTA DELETE: Excluir um tipo de produto (com verificação de dependência)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Verifica se algum equipamento está a usar este tipo de produto
    const equipamentosUsando = await db('equipamentos').where({ produto_id: id }).first();

    if (equipamentosUsando) {
      // 2. Se estiver em uso, retorna um erro 409 (Conflict) e não apaga
      return res.status(409).json({ message: 'Não é possível excluir este tipo de produto, pois existem equipamentos associados a ele.' });
    }

    // 3. Se não estiver em uso, apaga o produto
    const rowsDeleted = await db('produtos').where({ id }).del();
    if (rowsDeleted > 0) {
      res.status(200).json({ message: 'Tipo de produto excluído com sucesso.' });
    } else {
      res.status(404).json({ message: 'Tipo de produto não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

module.exports = router;