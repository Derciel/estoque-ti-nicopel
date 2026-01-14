import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, IconButton, Popover, useTheme, useMediaQuery, Divider } from '@mui/material';

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

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Patrimônio', icon: <ComputerIcon />, path: '/patrimonio' },
  { text: 'Gestão', icon: <SettingsIcon />, path: '/gestao' },
  { text: 'Verificar Item', icon: <QrCode2Icon />, path: '/verificar' },
  { text: 'Etiquetas', icon: <PrintIcon />, path: '/etiquetas' },
];

const Layout = () => {
  const theme = useTheme();
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
    <div>
      <Toolbar />
      <Divider />
      <List sx={{ p: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink} to={item.path} title={item.text}
              sx={{ minHeight: 48, justifyContent: isCollapsed ? 'center' : 'initial', px: 2.5, borderRadius: 2, mb: 1, '&.active': { backgroundColor: 'primary.main', color: '#111827', '& .MuiListItemIcon-root': { color: '#111827' } } }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 0 : 2, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
              {!isCollapsed && <ListItemText primary={item.text} sx={{ opacity: isCollapsed ? 0 : 1, whiteSpace: 'nowrap' }} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'background.paper', boxShadow: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <Box sx={{ width: '25%', display: 'flex', justifyContent: 'flex-start' }}>
            <IconButton color="inherit" onClick={isMobile ? handleDrawerToggle : handleCollapseToggle} sx={{ mr: 2 }}>
              {isMobile ? <MenuIcon /> : <ChevronLeftIcon sx={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
            </IconButton>
          </Box>
          <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
            <img src="https://i.ibb.co/QFQ1hhQW/ESTOQUE-2.png" alt="Logo da Empresa" style={{ height: '69px', width: 'auto' }} />
          </Box>
          <Box sx={{ width: '25%', display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton color="inherit" onClick={handleQrClick} title="Mostrar QR Code de Acesso">
              <QrCode2Icon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Popover open={openQrPopover} anchorEl={anchorEl} onClose={handleQrClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <AppLinkQRCode />
      </Popover>

      <Box component="nav" sx={{ width: { md: isCollapsed ? collapsedDrawerWidth : drawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.3s' }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawerContent}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: isCollapsed ? collapsedDrawerWidth : drawerWidth, transition: 'width 0.3s', overflowX: 'hidden' } }} open>
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${isCollapsed ? collapsedDrawerWidth : drawerWidth}px)` }, transition: 'width 0.3s' }}>
        <Toolbar sx={{ minHeight: '56px !important' }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;