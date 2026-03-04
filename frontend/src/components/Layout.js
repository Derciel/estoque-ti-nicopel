import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, CssBaseline, IconButton, Popover,
  useTheme, useMediaQuery, Divider, BottomNavigation, BottomNavigationAction, Paper
} from '@mui/material';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ComputerIcon from '@mui/icons-material/Computer';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';

// Componentes
import AppLinkQRCode from './AppLinkQRCode';

const drawerWidth = 260;
const collapsedDrawerWidth = 80;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Patrimônio', icon: <ComputerIcon />, path: '/patrimonio' },
  { text: 'Gestão', icon: <SettingsIcon />, path: '/gestao' },
  { text: 'Verificar', icon: <QrCode2Icon />, path: '/verificar' },
  { text: 'Etiquetas', icon: <PrintIcon />, path: '/etiquetas' },
];

const Layout = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);
  const handleQrClick = (event) => setAnchorEl(event.currentTarget);
  const handleQrClose = () => setAnchorEl(null);
  const openQrPopover = Boolean(anchorEl);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Toolbar sx={{ px: 2, display: 'flex', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <img src="https://i.ibb.co/QFQ1hhQW/ESTOQUE-2.png" alt="Logo" style={{ height: '40px', width: 'auto' }} />
      </Toolbar>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ p: 1.5, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              title={item.text}
              sx={{
                minHeight: 52,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: 2.5,
                borderRadius: '12px',
                transition: 'all 0.2s',
                '&.active': {
                  background: 'linear-gradient(135deg, rgba(190, 242, 100, 0.15) 0%, rgba(132, 204, 22, 0.05) 100%)',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  border: '1px solid rgba(190, 242, 100, 0.2)',
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Header - Apenas para Desktop ou se Mobile precisar de algum controle extra */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: isMobile ? 'none' : 'flex'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={handleCollapseToggle} sx={{ mr: 2 }}>
              <ChevronLeftIcon sx={{
                transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />
            </IconButton>
          </Box>

          <img src="https://i.ibb.co/QFQ1hhQW/ESTOQUE-2.png" alt="Logo NICOPEL" style={{ height: '50px', width: 'auto' }} />

          <IconButton color="inherit" onClick={handleQrClick}>
            <QrCode2Icon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navegação Lateral - Desktop */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
            flexShrink: 0,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflowX: 'hidden',
                boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
              }
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          pb: { xs: 10, md: 4 }, // Espaço para a barra inferior no mobile
          width: '100%',
          transition: 'padding 0.3s'
        }}
      >
        {!isMobile && <Toolbar />} {/* Spacer para o AppBar fixo no desktop */}

        {/* Logo visível apenas no topo no mobile */}
        {isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <img src="https://i.ibb.co/QFQ1hhQW/ESTOQUE-2.png" alt="Logo" style={{ height: '60px', width: 'auto' }} />
          </Box>
        )}

        <Outlet />
      </Box>

      {/* Barra de Navegação Inferior - Mobile (Parece um App) */}
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 16, left: 16, right: 16, borderRadius: '24px', overflow: 'hidden', zIndex: 1000, boxShadow: '0 -10px 25px rgba(0,0,0,0.3)', backgroundColor: 'rgba(22, 27, 39, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}
          elevation={3}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(event, newValue) => navigate(newValue)}
            sx={{
              backgroundColor: 'transparent',
              height: 64,
              '& .Mui-selected': { color: 'primary.main' }
            }}
          >
            {menuItems.slice(0, 4).map((item) => (
              <BottomNavigationAction
                key={item.text}
                label={item.text === 'Verificar' ? 'Scanner' : item.text}
                icon={item.icon}
                value={item.path}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <Popover
        open={openQrPopover}
        anchorEl={anchorEl}
        onClose={handleQrClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: 4, p: 1, mt: 1, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' } }}
      >
        <AppLinkQRCode />
      </Popover>
    </Box>
  );
};

export default Layout;