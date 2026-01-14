import React, { useState, useEffect } from 'react';
// MUDANÇA 1: Importamos api em vez de axios
import api from '../services/api';

// Removemos a prop 'onEditar'
const VisaoEstoque = ({ listaKey }) => {
  const [estoque, setEstoque] = useState([]);

  useEffect(() => {
    // MUDANÇA 2: Usamos api.get para buscar do backend correto
    api.get('/api/estoque')
      .then(response => setEstoque(response.data))
      .catch(error => console.error("Erro ao buscar estoque:", error));
  }, [listaKey]); // Usamos a key para forçar a atualização

  return (
    <div className="lista-container">
      <h2>Visão Geral do Estoque</h2>
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Marca</th>
            <th>Qtd. Total</th>
            <th>Disponível</th>
          </tr>
        </thead>
        <tbody>
          {estoque.map(produto => (
            <tr key={produto.id}>
              <td>{produto.nome}</td>
              <td>{produto.marca || 'N/A'}</td>
              <td>{produto.total}</td>
              <td>{produto.em_estoque || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisaoEstoque;