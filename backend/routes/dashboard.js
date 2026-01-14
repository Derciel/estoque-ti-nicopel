const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ROTA PARA OS CARTÕES (KPIs - Key Performance Indicators)
router.get('/kpis', async (req, res) => {
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
    console.error("Erro ao buscar KPIs:", error);
    res.status(500).json({ message: 'Erro ao buscar KPIs.' });
  }
});

// ROTA PARA O GRÁFICO (ITENS POR PRODUTO)
router.get('/produtos-chart', async (req, res) => {
  try {
    const resumo = await db('produtos')
      .leftJoin('equipamentos', 'produtos.id', 'equipamentos.produto_id')
      .select(
        'produtos.nome',
        db.raw('COUNT(equipamentos.id) as total'),
        db.raw("SUM(CASE WHEN equipamentos.status = 'Em Estoque' THEN 1 ELSE 0 END) as disponivel")
      )
      .groupBy('produtos.nome')
      .orderBy('total', 'desc');

    res.json(resumo);
  } catch (error) {
    console.error("Erro ao buscar dados para o gráfico:", error);
    res.status(500).json({ message: 'Erro ao buscar dados para o gráfico.' });
  }
});

// ROTA PARA A LISTA DE ITENS RECENTES
router.get('/recentes', async (req, res) => {
    try {
        const recentes = await db('equipamentos')
            .join('produtos', 'equipamentos.produto_id', 'produtos.id')
            .select('equipamentos.id', 'produtos.nome', 'produtos.imagem_url', 'equipamentos.codigo_produto')
            .orderBy('equipamentos.id', 'desc')
            .limit(5);
        res.json(recentes);
    } catch (error) {
        console.error("Erro ao buscar itens recentes:", error);
        res.status(500).json({ message: 'Erro ao buscar itens recentes.' });
    }
});

module.exports = router;