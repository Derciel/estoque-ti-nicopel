const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ROTA GET: Listar todos os equipamentos
router.get('/', async (req, res) => {
  try {
    const equipamentos = await db('equipamentos')
      .join('produtos', 'equipamentos.produto_id', '=', 'produtos.id')
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id')
      .select(
        'equipamentos.id',
        'produtos.nome as nome_produto',
        'produtos.imagem_url',
        'equipamentos.codigo_produto',
        'equipamentos.status',
        'usuarios.nome as nome_usuario'
      )
      .orderBy('equipamentos.id', 'desc');
    res.json(equipamentos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar equipamentos.' });
  }
});

// ROTA GET: Buscar um único equipamento pelo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const equipamento = await db('equipamentos')
      .where({ 'equipamentos.id': id })
      .join('produtos', 'equipamentos.produto_id', 'produtos.id')
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id')
      .select('equipamentos.*', 'produtos.nome as nome_produto', 'usuarios.nome as nome_usuario')
      .first();
    if (equipamento) res.json(equipamento);
    else res.status(404).json({ message: 'Equipamento não encontrado.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// ROTA GET: Buscar um único equipamento PELO CÓDIGO DE PATRIMÔNIO (A ROTA USADA PELO SCANNER)
router.get('/por-codigo/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const equipamento = await db('equipamentos')
      .where({ codigo_produto: codigo })
      .join('produtos', 'equipamentos.produto_id', 'produtos.id')
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id') // Garante que a tabela de usuários é incluída
      .select('equipamentos.*', 'produtos.nome as nome_produto', 'usuarios.nome as nome_usuario') // Garante que o nome do usuário é selecionado
      .first();
      
    if (equipamento) res.json(equipamento);
    else res.status(404).json({ message: 'Equipamento com este código não foi encontrado.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// ROTA POST: Cadastrar um novo equipamento
router.post('/', async (req, res) => {
  let { codigo_produto, numero_serie, produto_id } = req.body;
  try {
    if (numero_serie === '' || numero_serie === undefined) {
      numero_serie = null;
    }
    const [novoEquipamento] = await db('equipamentos').insert({ codigo_produto, numero_serie, produto_id }).returning('*');
    res.status(201).json(novoEquipamento);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ message: 'O código de patrimônio ou N/S informado já existe.' });
    res.status(500).json({ message: 'Ocorreu um erro inesperado.' });
  }
});

// ROTA POST: Alocar um equipamento a um usuário
router.post('/:id/alocar', async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ message: 'O ID do usuário é obrigatório.' });
  }

  try {
    const equipamento = await db('equipamentos').where({ id }).first();
    if (!equipamento) return res.status(404).json({ message: 'Equipamento não encontrado.' });
    if (equipamento.status !== 'Em Estoque') return res.status(409).json({ message: `Este equipamento já está "${equipamento.status}".` });
    
    const [equipamentoAtualizado] = await db('equipamentos').where({ id }).update({ usuario_id: usuario_id, status: 'Em Uso' }).returning('*');
    res.status(200).json({ message: 'Equipamento alocado com sucesso!', equipamento: equipamentoAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor ao tentar alocar.' });
  }
});

// ROTA POST: Desalocar um equipamento
router.post('/:id/desalocar', async (req, res) => {
  const { id } = req.params;
  try {
    const equipamento = await db('equipamentos').where({ id }).first();
    if (!equipamento) return res.status(404).json({ message: 'Equipamento não encontrado.' });
    if (equipamento.status !== 'Em Uso') return res.status(409).json({ message: 'Este equipamento não está em uso.' });

    const [equipamentoAtualizado] = await db('equipamentos').where({ id }).update({ usuario_id: null, status: 'Em Estoque' }).returning('*');
    res.status(200).json({ message: 'Equipamento devolvido ao estoque com sucesso!', equipamento: equipamentoAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor ao tentar desalocar.' });
  }
});

// ROTA PUT: Atualizar um equipamento
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo_produto, numero_serie, produto_id } = req.body;
  let ns = numero_serie;
  if (ns === '') ns = null;

  try {
    const count = await db('equipamentos').where({ id }).update({ codigo_produto, numero_serie: ns, produto_id });
    if (count > 0) {
      const equipamento = await db('equipamentos').where({ id }).first();
      res.status(200).json(equipamento);
    } else {
      res.status(404).json({ message: 'Equipamento não encontrado.' });
    }
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ message: 'O código de patrimônio ou N/S informado já pertence a outro item.' });
    }
    res.status(500).json({ message: 'Erro ao atualizar equipamento.' });
  }
});

// ROTA DELETE: Excluir um equipamento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rowsDeleted = await db('equipamentos').where({ id }).del();
    if (rowsDeleted > 0) {
      res.status(200).json({ message: 'Equipamento excluído com sucesso.' });
    } else {
      res.status(404).json({ message: 'Equipamento não encontrado para exclusão.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor ao tentar excluir.' });
  }
});

module.exports = router;