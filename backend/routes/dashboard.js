const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ROTA PARA OS CARTÕES (KPIs)
router.get('/kpis', async (req, res) => {
  // ... (esta rota está correta, sem alterações)
  try {
    const [totalEquipamentos] = await db('equipamentos').count('id as count');
    const [equipamentosAlocados] = await db('equipamentos').where('status', 'Em Uso').count('id as count');
    const [totalUsuarios] = await db('usuarios').count('id as count');
    const [totalProdutos] = await db('produtos').count('id as count');

    res.json({
      totalItens: totalEquipamentos.count,
      itensAlocados: equipamentosAlocados.count,
      totalUsuarios: totalUsuarios.count,
      tiposDeProduto: totalProdutos.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar KPIs do dashboard.' });
  }
});

// ROTA PARA O GRÁFICO DE BARRAS (ITENS POR PRODUTO)
router.get('/produtos-chart', async (req, res) => {
  try {
    // A CORREÇÃO ESTÁ NESTA CONSULTA:
    // Reescrita para ser mais explícita e compatível
    const resumo = await db('produtos')
      .leftJoin('equipamentos', 'produtos.id', 'equipamentos.produto_id')
      .select(
        'produtos.nome',
        db.raw('COUNT(equipamentos.id) as total'),
        db.raw("SUM(CASE WHEN equipamentos.status = 'Em Estoque' THEN 1 ELSE 0 END) as disponivel")
      )
      .groupBy('produtos.nome')
      .orderBy('total', 'desc')
      .limit(7);

    res.json(resumo);
  } catch (error) {
    console.error("Erro ao buscar dados do gráfico:", error);
    res.status(500).json({ message: 'Erro ao buscar dados para o gráfico.' });
  }
});

module.exports = router;