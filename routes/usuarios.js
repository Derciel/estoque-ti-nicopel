const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ROTA GET: Listar todos os usuários
router.get('/', async (req, res) => {
  try {
    const usuarios = await db('usuarios').select('*').orderBy('nome', 'asc');
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// ROTA GET: Listar usuários com os seus equipamentos (A ROTA CRÍTICA)
router.get('/com-equipamentos', async (req, res) => {
  try {
    const usuarios = await db('usuarios').select('id', 'nome', 'matricula');

    const equipamentosAlocados = await db('equipamentos')
      .where('status', 'Em Uso')
      .join('produtos', 'equipamentos.produto_id', 'produtos.id')
      .select(
        'equipamentos.id',
        'produtos.nome as nome_produto',
        'equipamentos.codigo_produto',
        'equipamentos.usuario_id'
      );

    const resultado = usuarios.map(usuario => {
      const equipamentosDoUsuario = equipamentosAlocados.filter(
        equipamento => equipamento.usuario_id === usuario.id
      );
      return { ...usuario, equipamentos: equipamentosDoUsuario };
    });

    res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro na rota /com-equipamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários e equipamentos.', error: error.message });
  }
});

// ROTA POST: Cadastrar um novo usuário
router.post('/', async (req, res) => {
  try {
    let query = db('usuarios').insert(req.body);

    if (db.client.config.client === 'pg') {
      const [novoUsuario] = await query.returning('*');
      return res.status(201).json(novoUsuario);
    } else {
      const [id] = await query;
      const novoUsuario = await db('usuarios').where({ id }).first();
      return res.status(201).json(novoUsuario);
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === '23505') {
      return res.status(409).json({ message: 'A matrícula informada já existe.' });
    }
    res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
});

// ROTA PUT: Atualizar um usuário existente
router.put('/:id', async (req, res) => {
  try {
    const count = await db('usuarios').where({ id: req.params.id }).update(req.body);
    if (count > 0) {
      const usuario = await db('usuarios').where({ id: req.params.id }).first();
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'A matrícula informada já pertence a outro usuário.' });
    }
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
});

// ROTA DELETE: Excluir um usuário
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Desalocar equipamentos que estão com este usuário (Postgres FK)
    await db('equipamentos').where({ usuario_id: id }).update({ usuario_id: null, status: 'Em Estoque' });

    // 2. Apagar o usuário
    const rowsDeleted = await db('usuarios').where({ id }).del();
    
    if (rowsDeleted > 0) {
      res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    } else {
      res.status(404).json({ message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro interno ao excluir usuário.' });
  }
});

module.exports = router;