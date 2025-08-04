// dentro de routes/usuarios.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', async (req, res) => {
  const usuarios = await db('usuarios').select('*');
  res.json(usuarios);
});

router.post('/', async (req, res) => {
   const { nome, matricula } = req.body;
   const [novoUsuario] = await db('usuarios').insert({ nome, matricula }).returning('*');
   res.status(201).json(novoUsuario);
});

module.exports = router;

// ROTA GET: Listar todos os usuários com seus respectivos equipamentos alocados
router.get('/com-equipamentos', async (req, res) => {
  try {
    const usuarios = await db('usuarios').select('id', 'nome', 'matricula');

    // CORREÇÃO AQUI: Adicionamos o .join() para buscar o nome do produto corretamente
    const equipamentosAlocados = await db('equipamentos')
      .where('status', 'Em Uso')
      .join('produtos', 'equipamentos.produto_id', 'produtos.id')
      .select(
        'equipamentos.id',
        'produtos.nome', // Agora busca o nome da tabela 'produtos'
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
    // Adicionamos um console.log para facilitar a depuração de erros futuros
    console.error('Erro na rota /com-equipamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários e equipamentos.', error: error.message });
  }
});

// ROTA PUT: Atualizar um usuário existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, matricula } = req.body;
  try {
    const count = await db('usuarios').where({ id }).update({ nome, matricula });
    if (count > 0) {
      const usuario = await db('usuarios').where({ id }).first();
      res.status(200).json(usuario);
    } else {
      res.status(404).json({ message: 'Usuário não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
});

module.exports = router