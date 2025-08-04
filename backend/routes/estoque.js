const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const resumo = await db('produtos')
      .leftJoin('equipamentos', 'produtos.id', 'equipamentos.produto_id')
      .select(
        'produtos.id',
        'produtos.nome',
        'produtos.marca',
        'produtos.imagem_url', // ADICIONADO: Garante que a URL da imagem seja enviada
        db.raw('COUNT(equipamentos.id) as total'),
        db.raw("SUM(CASE WHEN equipamentos.status = 'Em Estoque' THEN 1 ELSE 0 END) as em_estoque")
      )
      .groupBy('produtos.id', 'produtos.nome', 'produtos.marca', 'produtos.imagem_url')
      .orderBy('produtos.nome', 'asc');

    res.json(resumo);
  } catch (error) {
    console.error("Erro ao buscar resumo do estoque:", error);
    res.status(500).json({ message: 'Erro ao buscar resumo do estoque.' });
  }
});

module.exports = router;