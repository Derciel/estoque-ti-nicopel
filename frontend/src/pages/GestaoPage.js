import React, { useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Grid, Dialog, DialogContent, DialogTitle, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

import GerenciarProdutos from '../components/GerenciarProdutos';
import GerenciarProdutosLista from '../components/GerenciarProdutosLista';
import AdicionarUsuario from '../components/AdicionarUsuario';
import GerenciarUsuariosLista from '../components/GerenciarUsuariosLista';
import AdicionarEquipamento from '../components/AdicionarEquipamento';

const GestaoPage = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const produtoModalOpen = Boolean(props.produtoParaEditar);
  const usuarioModalOpen = Boolean(props.usuarioParaEditar);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 900, color: 'text.primary' }}>
        Painel de Gestão
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* 1. ADICIONAR PATRIMÔNIO (INLINE) */}
        <Accordion defaultExpanded sx={{ background: 'rgba(22, 27, 39, 0.4)', borderRadius: '16px !important', mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Entrada de Patrimônio</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AdicionarEquipamento onEquipamentoAdicionado={props.forcarAtualizacaoGeral} />
          </AccordionDetails>
        </Accordion>

        {/* 2. GERIR PRODUTOS */}
        <Accordion sx={{ background: 'rgba(22, 27, 39, 0.4)', borderRadius: '16px !important', mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Tipos de Produto</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4, height: '100%' }}>
                  <GerenciarProdutos onFinishEdit={props.handleFinishEditProduto} />
                </Box>
              </Grid>
              <Grid item xs={12} lg={8}>
                <GerenciarProdutosLista
                  listaKey={`lista-produtos-${props.listaKey}`}
                  onEditarProduto={props.handleEditarProduto}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* 3. GERIR USUÁRIOS */}
        <Accordion sx={{ background: 'rgba(22, 27, 39, 0.4)', borderRadius: '16px !important' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Base de Usuários</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={4}>
                <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4, height: '100%' }}>
                  <AdicionarUsuario onUsuarioAdicionado={props.forcarAtualizacaoGeral} onFinishEdit={props.handleFinishEditUsuario} />
                </Box>
              </Grid>
              <Grid item xs={12} lg={8}>
                <GerenciarUsuariosLista
                  listaKey={props.listaKey}
                  onEditarUsuario={props.handleEditarUsuario}
                  onExcluirUsuario={props.handleExcluirUsuario}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* MODAL DE EDIÇÃO DE PRODUTO */}
      <Dialog
        open={produtoModalOpen}
        onClose={props.handleFinishEditProduto}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: isMobile ? 0 : 4,
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800}>Editar Produto</Typography>
          <IconButton onClick={props.handleFinishEditProduto}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <GerenciarProdutos
            produtoParaEditar={props.produtoParaEditar}
            onFinishEdit={props.handleFinishEditProduto}
          />
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO DE USUÁRIO */}
      <Dialog
        open={usuarioModalOpen}
        onClose={props.handleFinishEditUsuario}
        fullScreen={isMobile}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: isMobile ? 0 : 4,
            border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={800}>Editar Usuário</Typography>
          <IconButton onClick={props.handleFinishEditUsuario}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <AdicionarUsuario
            usuarioParaEditar={props.usuarioParaEditar}
            onFinishEdit={props.handleFinishEditUsuario}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GestaoPage;
