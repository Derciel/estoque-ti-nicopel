const express = require('express');
const router = express.Router();
const db = require('../database/db');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuração condicional (Cloudinary se em produção, Local se em dev)
let storage;

if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_URL) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'estoque-ti',
      format: async (req, file) => 'webp',
      public_id: (req, file) => `produto-${Date.now()}`
    }
  });
} else {
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  });
}

const upload = multer({ storage: storage });

// ROTA GET: Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    let produtos = await db('produtos').select('*').orderBy('id', 'asc');
    // Retorna os produtos como estão, o frontend lidará com o prefixo se necessário
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar produtos.' });
  }
});

// ROTA POST: Cadastrar um novo produto
router.post('/', upload.single('imagem'), async (req, res) => {
  const { nome, marca, descricao } = req.body;
  const imagem_url = req.file ? (req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`) : null;

  try {
    let query = db('produtos').insert({ nome, marca, descricao, imagem_url });

    // SQLite não suporta .returning('*') em todas as versões. Postgres sim.
    if (db.client.config.client === 'pg') {
      const [produto] = await query.returning('*');
      return res.status(201).json(produto);
    } else {
      const [id] = await query;
      const produto = await db('produtos').where({ id }).first();
      return res.status(201).json(produto);
    }
  } catch (error) {
    console.error("Erro ao cadastrar produto:", error);
    res.status(500).json({ message: 'Erro ao cadastrar produto.' });
  }
});

// ROTA PUT: Atualizar um produto existente
router.put('/:id', upload.single('imagem'), async (req, res) => {
  const { id } = req.params;
  const { nome, marca, descricao } = req.body;

  const updateData = { nome, marca, descricao };
  if (req.file) {
    updateData.imagem_url = req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`;
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