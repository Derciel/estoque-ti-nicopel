import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BEF264', // Lime vibrante
      dark: '#84CC16',
      light: '#D9F99D',
    },
    secondary: {
      main: '#38BDF8', // Sky blue para contraste
    },
    background: {
      default: '#0B0F1A', // Azul ultra escuro (quase preto)
      paper: '#161B27',   // Escuro com tom azulado
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#9CA3AF',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  shape: {
    borderRadius: 16, // Bordas mais redondas para look moderno
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { letterSpacing: '0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#2b2b2b #121212",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: '8px',
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#2b2b2b",
            minHeight: 24,
            border: "2px solid #161B27",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(22, 27, 39, 0.7)',
          backdropFilter: 'blur(20px)', // Glassmorphism
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 800,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px -8px rgba(190, 242, 100, 0.5)',
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.3)',
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #BEF264 0%, #84CC16 100%)',
          color: '#0B0F1A !important', // Força a cor escura no fundo claro
          boxShadow: '0 4px 14px 0 rgba(190, 242, 100, 0.39)',
          '&:hover': {
            background: 'linear-gradient(135deg, #D9F99D 0%, #BEF264 100%)',
            boxShadow: '0 6px 20px rgba(190, 242, 100, 0.5)',
          },
          '&.Mui-disabled': {
            background: 'rgba(190, 242, 100, 0.2)',
            color: 'rgba(190, 242, 100, 0.4) !important',
          }
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0B0F1A',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(11, 15, 26, 0.8)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '16px',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        },
        head: {
          fontWeight: 700,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.03) !important',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(22, 27, 39, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px !important',
          marginBottom: '12px',
          '&:before': { display: 'none' },
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }
      }
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 20px',
          '& .MuiTypography-root': {
            fontWeight: 700,
            fontSize: '0.95rem',
          }
        }
      }
    },
  },
});

export default theme;