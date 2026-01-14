import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext'; // 1. Importar o Provedor
import './App.css';

// ... (importações das páginas e do Layout)
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PatrimonioPage from './pages/PatrimonioPage';
import GestaoPage from './pages/GestaoPage';
import VerificarItemPage from './pages/VerificarItemPage';

function App() {
  // O state para edição continua aqui, pois é mais específico
  const [produtoParaEditar, setProdutoParaEditar] = useState(null);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);

  const handleEditarProduto = (produto) => setProdutoParaEditar(produto);
  const handleFinishEditProduto = () => setProdutoParaEditar(null);
  const handleEditarUsuario = (usuario) => setUsuarioParaEditar(usuario);
  const handleFinishEditUsuario = () => setUsuarioParaEditar(null);

  return (
    // 2. Envolvemos tudo com o AppProvider
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patrimonio" element={<PatrimonioPage />} />
            <Route 
              path="/gestao" 
              element={
                <GestaoPage 
                  produtoParaEditar={produtoParaEditar}
                  handleEditarProduto={handleEditarProduto}
                  handleFinishEditProduto={handleFinishEditProduto}
                  usuarioParaEditar={usuarioParaEditar}
                  handleEditarUsuario={handleEditarUsuario}
                  handleFinishEditUsuario={handleFinishEditUsuario}
                />
              } 
            />
            <Route path="/verificar" element={<VerificarItemPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;