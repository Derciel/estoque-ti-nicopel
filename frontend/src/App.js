import React, { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Importa o Layout e todas as Páginas
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PatrimonioPage from './pages/PatrimonioPage';
import GestaoPage from './pages/GestaoPage';
import VerificarItemPage from './pages/VerificarItemPage';
import EtiquetasPage from './pages/EtiquetasPage';
import Notification from './components/Notification';
import ConfirmDialog from './components/ConfirmDialog';
import { AppContext } from './context/AppContext';
import api from './services/api';

/**
 * Componente interno para as rotas, permitindo o uso do AppContext
 */
function AppRoutes() {
  const [listaKey, setListaKey] = useState(0);
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);

  const {
    showNotification,
    showConfirm,
    closeConfirm,
    confirmDialog,
    notification,
    closeNotification
  } = useContext(AppContext);

  const forcarAtualizacaoGeral = () => {
    setListaKey(prevKey => prevKey + 1);
    setProdutoParaEditar(null);
    setUsuarioParaEditar(null);
  };

  const handleEditarProduto = (produto) => setProdutoParaEditar(produto);
  const handleFinishEditProduto = () => setProdutoParaEditar(null);
  const handleEditarUsuario = (usuario) => setUsuarioParaEditar(usuario);
  const handleFinishEditUsuario = () => setUsuarioParaEditar(null);

  const handleExcluirUsuario = (usuarioId) => {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este usuário permanentemente?',
      async () => {
        try {
          await api.delete(`/api/usuarios/${usuarioId}`);
          showNotification('Usuário excluído com sucesso!', 'success');
          forcarAtualizacaoGeral();
        } catch (error) {
          showNotification('Erro ao excluir usuário.', 'error');
          console.error('Erro ao excluir:', error);
        } finally {
          closeConfirm();
        }
      }
    );
  };

  const handleExcluir = (equipamentoId) => {
    showConfirm(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este item permanentemente?',
      async () => {
        try {
          await api.delete(`/api/equipamentos/${equipamentoId}`);
          showNotification('Item excluído com sucesso!', 'success');
          forcarAtualizacaoGeral();
        } catch (error) {
          showNotification('Erro ao excluir o item.', 'error');
          console.error('Erro ao excluir:', error);
        } finally {
          closeConfirm();
        }
      }
    );
  };

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage listaKey={listaKey} />} />
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
                handleExcluirUsuario={handleExcluirUsuario}
              />
            }
          />
          <Route path="/verificar" element={<VerificarItemPage />} />
          <Route path="/etiquetas" element={<EtiquetasPage />} />
        </Route>
      </Routes>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;