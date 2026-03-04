import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AppProvider } from './context/AppContext'; // 1. IMPORTAR O PROVIDER

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. ENVOLVER A APLICAÇÃO COM O AppProvider */}
    <AppProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </AppProvider>
  </React.StrictMode>
);