import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Grid } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import GerenciarProdutos from '../components/GerenciarProdutos';
import GerenciarProdutosLista from '../components/GerenciarProdutosLista';
import AdicionarUsuario from '../components/AdicionarUsuario';
import GerenciarUsuariosLista from '../components/GerenciarUsuariosLista';
import AdicionarEquipamento from '../components/AdicionarEquipamento';

const GestaoPage = (props) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Painel de Gestão</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Adicionar Patrimônio ao Estoque</Typography></AccordionSummary>
          <AccordionDetails><AdicionarEquipamento onEquipamentoAdicionado={props.forcarAtualizacaoGeral} /></AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Gerir Tipos de Produto</Typography></AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={4} alignItems="flex-start">
              <Grid item xs={12} md={5}>
                <GerenciarProdutos  produtoParaEditar={props.produtoParaEditar} onFinishEdit={props.handleFinishEditProduto} />
              </Grid>
              <Grid item xs={12} md={7}>
                <GerenciarProdutosLista 
                  listaKey={`lista-produtos-${props.listaKey}`} 
                  onEditarProduto={props.handleEditarProduto}
                  onExcluirProduto={props.handleExcluirProduto} 
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="h6">Gerir Usuários</Typography></AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={4} alignItems="flex-start">
              <Grid item xs={12} md={5}>
                <AdicionarUsuario onUsuarioAdicionado={props.forcarAtualizacaoGeral} usuarioParaEditar={props.usuarioParaEditar} onFinishEdit={props.handleFinishEditUsuario} />
              </Grid>
              <Grid item xs={12} md={7}>
                <GerenciarUsuariosLista listaKey={props.listaKey} onEditarUsuario={props.handleEditarUsuario} />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default GestaoPage;