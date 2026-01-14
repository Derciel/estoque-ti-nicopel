import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BEF264',
    },
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          color: '#111827',
        }
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(255, 255, 255, 0.12)',
        }
      }
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                boxShadow: 'none',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            }
        }
    },
    // --- NOVAS REGRAS DE ESTILO PARA AS TABELAS ---
    MuiTableCell: {
      styleOverrides: {
        root: {
          // Ajusta o tamanho da fonte e o espaçamento para um look mais "data-dense"
          fontSize: '0.875rem', // 14px
          padding: '12px 16px', // Menos espaçamento vertical
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
        head: {
          // Estilo específico para as células do cabeçalho
          fontWeight: 600,
          color: '#9CA3AF', // Cor secundária para o texto do cabeçalho
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            // Define uma cor de fundo subtil ao passar o rato
            backgroundColor: 'rgba(255, 255, 255, 0.08) !important',
          },
        },
      },
    },
  },
}); 

export default theme;