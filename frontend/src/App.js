import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Importa o Layout e todas as Páginas
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PatrimonioPage from './pages/PatrimonioPage';
import GestaoPage from './pages/GestaoPage';
import VerificarItemPage from './pages/VerificarItemPage';
import EtiquetasPage from './pages/EtiquetasPage'; // Rota nova

function App() {
  // State para forçar a atualização das listas quando um item é adicionado/editado/excluído
  const [listaKey, setListaKey] = useState(0);

  // States para controlar qual item está em modo de edição
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);

  /**
   * Força a atualização de todos os componentes que dependem de dados atualizados.
   * Também limpa os estados de edição para resetar os formulários.
   */
  const forcarAtualizacaoGeral = () => {
    setListaKey(prevKey => prevKey + 1);
    setProdutoParaEditar(null);
    setUsuarioParaEditar(null);
  };

  // Funções para controlar o modo de edição de Produtos
  const handleEditarProduto = (produto) => setProdutoParaEditar(produto);
  const handleFinishEditProduto = () => setProdutoParaEditar(null);

  // Funções para controlar o modo de edição de Usuários
  const handleEditarUsuario = (usuario) => setUsuarioParaEditar(usuario);
  const handleFinishEditUsuario = () => setUsuarioParaEditar(null);

  // Função para excluir um item de patrimônio
  const handleExcluir = async (equipamentoId) => {
    // Exibe uma confirmação antes de uma ação destrutiva
    if (window.confirm('Tem certeza que deseja excluir este item permanentemente?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/equipamentos/${equipamentoId}`);
        alert('Item excluído com sucesso!');
        forcarAtualizacaoGeral(); // Atualiza as listas
      } catch (error) {
        alert('Erro ao excluir o item.');
        console.error('Erro ao excluir:', error);
      }
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* O 'Layout' é o nosso template principal com menu lateral e barra de topo */}
        <Route element={<Layout />}>
          
          {/* Rota inicial que redireciona para o dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rota para o Dashboard */}
          <Route 
            path="/dashboard" 
            element={<DashboardPage listaKey={listaKey} />} 
          />
          
          {/* Rota para a página de Patrimônio e Operações */}
          <Route 
            path="/patrimonio" 
            element={
              <PatrimonioPage 
                listaKey={listaKey}
                forcarAtualizacaoGeral={forcarAtualizacaoGeral}
                handleExcluir={handleExcluir}
              />
            } 
          />
          
          {/* Rota para a página de Gestão e Cadastros */}
          <Route 
            path="/gestao" 
            element={
              <GestaoPage 
                listaKey={listaKey}
                forcarAtualizacaoGeral={forcarAtualizacaoGeral}
                produtoParaEditar={produtoParaEditar}
                handleEditarProduto={handleEditarProduto}
                handleFinishEditProduto={handleFinishEditProduto}
                usuarioParaEditar={usuarioParaEditar}
                handleEditarUsuario={handleEditarUsuario}
                handleFinishEditUsuario={handleFinishEditUsuario}
              />
            } 
          />
          
          {/* Rota para a nova página de verificação por câmara */}
          <Route path="/verificar" element={<VerificarItemPage />} />
          <Route path="/etiquetas" element={<EtiquetasPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;