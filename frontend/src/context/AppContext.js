import React, { createContext, useState } from 'react';

// 1. Cria o Contexto
export const AppContext = createContext();

// 2. Cria o "Provedor" que irá conter o nosso estado e funções
export const AppProvider = ({ children }) => {
  const [listaKey, setListaKey] = useState(0);

  // Esta é a função que todos os componentes poderão chamar para forçar uma atualização
  const forcarAtualizacaoGeral = () => {
    setListaKey(prevKey => prevKey + 1);
  };

  return (
    <AppContext.Provider value={{ listaKey, forcarAtualizacaoGeral }}>
      {children}
    </AppContext.Provider>
  );
};