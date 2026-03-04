import React, { createContext, useState } from 'react';

// 1. Cria o Contexto
export const AppContext = createContext();

// 2. Cria o "Provedor" que irá conter o nosso estado e funções
export const AppProvider = ({ children }) => {
  const [listaKey, setListaKey] = useState(0);
  
  // Estados para Notificações
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados para Diálogo de Confirmação
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  const forcarAtualizacaoGeral = () => {
    setListaKey(prevKey => prevKey + 1);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  return (
    <AppContext.Provider value={{ 
      listaKey, 
      forcarAtualizacaoGeral,
      notification,
      showNotification,
      closeNotification,
      confirmDialog,
      showConfirm,
      closeConfirm
    }}>
      {children}
    </AppContext.Provider>
  );
};