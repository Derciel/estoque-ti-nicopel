const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ROTA GET: Listar todos os equipamentos com detalhes do produto
router.get('/', async (req, res) => {
  try {
    const equipamentos = await db('equipamentos')
      .join('produtos', 'equipamentos.produto_id', '=', 'produtos.id')
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id')
      .select(
        'equipamentos.id',
        'produtos.nome as nome_produto',
        'equipamentos.codigo_produto',
        'equipamentos.status',
        'usuarios.nome as nome_usuario'
      );
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
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id') // Adicionamos o join que faltava
      .select(
        'equipamentos.*',
        'produtos.nome as nome_produto',
        'usuarios.nome as nome_usuario' // E selecionamos o nome do usuário
      )
      .first();
      
    if (equipamento) {
      res.status(200).json(equipamento);
    } else {
      res.status(404).json({ message: 'Equipamento não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

// ROTA POST: Cadastrar um novo equipamento
router.post('/', async (req, res) => {
  let { codigo_produto, numero_serie, produto_id } = req.body;

  try {
    // AQUI ESTÁ A CORREÇÃO CRUCIAL:
    // Se o numero_serie vier como um texto vazio, nós o convertemos para null.
    if (numero_serie === '' || numero_serie === undefined) {
      numero_serie = null;
    }

    const [novoEquipamento] = await db('equipamentos')
      .insert({ codigo_produto, numero_serie, produto_id })
      .returning('*');
    res.status(201).json(novoEquipamento);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'O código de patrimônio ou N/S informado já existe no sistema.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Ocorreu um erro inesperado no servidor.' });
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
    if (!equipamento) {
      return res.status(404).json({ message: 'Equipamento não encontrado.' });
    }
    if (equipamento.status !== 'Em Estoque') {
      return res.status(409).json({ message: `Este equipamento já está "${equipamento.status}" e não pode ser alocado.` });
    }
    const [equipamentoAtualizado] = await db('equipamentos')
      .where({ id })
      .update({ usuario_id: usuario_id, status: 'Em Uso' })
      .returning('*');
    res.status(200).json({ message: 'Equipamento alocado com sucesso!', equipamento: equipamentoAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor ao tentar alocar.', error: error.message });
  }
});

// ROTA POST: Desalocar um equipamento (devolver ao estoque)
router.post('/:id/desalocar', async (req, res) => {
  const { id } = req.params;
  try {
    const equipamento = await db('equipamentos').where({ id }).first();
    if (!equipamento) {
      return res.status(404).json({ message: 'Equipamento não encontrado.' });
    }
    if (equipamento.status !== 'Em Uso') {
      return res.status(409).json({ message: 'Este equipamento não está em uso e não pode ser devolvido.' });
    }
    const [equipamentoAtualizado] = await db('equipamentos')
      .where({ id })
      .update({ usuario_id: null, status: 'Em Estoque' })
      .returning('*');
    res.status(200).json({ message: 'Equipamento devolvido ao estoque com sucesso!', equipamento: equipamentoAtualizado });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno no servidor ao tentar desalocar.', error: error.message });
  }
});

// ROTA DELETE: Excluir um equipamento pelo ID
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
    res.status(500).json({ message: 'Erro interno no servidor ao tentar excluir.', error: error.message });
  }
});

// ROTA PUT: Atualizar um equipamento existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  // Permitimos atualizar o código, o N/S e o tipo de produto associado
  const { codigo_produto, numero_serie, produto_id } = req.body;
  
  let { numero_serie: ns } = req.body;
  if (ns === '') ns = null; // Garante a conversão para null

  try {
    const count = await db('equipamentos').where({ id }).update({
      codigo_produto,
      numero_serie: ns,
      produto_id
    });
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

router.get('/por-codigo/:codigo', async (req, res) => {
  const { codigo } = req.params;
  try {
    const equipamento = await db('equipamentos')
      .where({ codigo_produto: codigo })
      .join('produtos', 'equipamentos.produto_id', 'produtos.id')
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id')
      .select(
        'equipamentos.*',
        'produtos.nome as nome_produto',
        'usuarios.nome as nome_usuario'
      )
      .first();
      
    if (equipamento) {
      res.status(200).json(equipamento);
    } else {
      res.status(404).json({ message: 'Equipamento com este código não foi encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const equipamentos = await db('equipamentos')
      .join('produtos', 'equipamentos.produto_id', '=', 'produtos.id')
      .leftJoin('usuarios', 'equipamentos.usuario_id', 'usuarios.id')
      .select(
        'equipamentos.id',
        'produtos.nome as nome_produto',
        'produtos.imagem_url', // Garanta que esta linha existe
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

module.exports = router;