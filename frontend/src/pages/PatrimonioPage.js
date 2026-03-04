import React, { useState, useEffect, useContext } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box, Typography, Paper, Divider, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Avatar, Dialog, IconButton, useMediaQuery, useTheme, DialogContent, Stack, Grid
} from '@mui/material';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import UsuariosComItens from '../components/UsuariosComItens';
import EquipamentosLista from '../components/EquipamentosLista';

// --- COMPONENTE PARA A VISÃO GERAL DE ESTOQUE ---
const VisaoEstoque = () => {
  const { listaKey } = useContext(AppContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [estoque, setEstoque] = useState([]);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  useEffect(() => {
    api.get('/api/estoque')
      .then(response => {
        setEstoque(response.data);
      })
      .catch(error => console.error("Erro ao buscar estoque:", error));
  }, [listaKey]);

  const handleOpenDetalhes = (item) => {
    setItemSelecionado(item);
    setDetalhesOpen(true);
  };
  const handleCloseDetalhes = () => setDetalhesOpen(false);

  const getStatusChipColor = (disponivel, total) => {
    if (total === 0) return 'default';
    if (disponivel === total) return 'success';
    if (disponivel > 0) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>Visão Geral de Estoque</Typography>
      <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
        <Table size={isMobile ? "medium" : "small"} aria-label="tabela de estoque">
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 0 }}>Imagem</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Marca</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Total</TableCell>
              <TableCell align="right">Estoque</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estoque.map((produto) => (
              <TableRow key={produto.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.05)' } }}>
                <TableCell sx={{ pl: 0 }}>
                  <Avatar
                    variant="rounded"
                    src={produto.imagem_url}
                    sx={{ width: isMobile ? 50 : 40, height: isMobile ? 50 : 40, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                    onClick={() => handleOpenDetalhes(produto)}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: isMobile ? '0.9rem' : '0.875rem' }}>
                    {produto.nome}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{produto.marca || 'N/A'}</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{produto.total}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {produto.em_estoque || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      disponível
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDetalhes(produto)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '&:hover': { bgcolor: 'primary.main', color: '#000' }
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL DE DETALHES COMPLETO */}
      <Dialog
        onClose={handleCloseDetalhes}
        open={detalhesOpen}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#161B27', backgroundImage: 'none' } }}
      >
        {itemSelecionado && (
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <img
                src={itemSelecionado.imagem_url}
                alt={itemSelecionado.nome}
                style={{ width: '100%', height: '240px', objectFit: 'cover' }}
              />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(transparent, #161B27)' }} />
            </Box>
            <Box sx={{ p: 3, mt: -2, position: 'relative' }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>{itemSelecionado.nome}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{itemSelecionado.descricao || 'Sem descrição cadastrada.'}</Typography>

              <Divider sx={{ mb: 3, opacity: 0.1 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Marca</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{itemSelecionado.marca || '---'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Status</Typography>
                  <Box>
                    <Chip
                      label={`${Math.round((itemSelecionado.em_estoque / itemSelecionado.total) * 100) || 0}% Estoque`}
                      color={getStatusChipColor(itemSelecionado.em_estoque, itemSelecionado.total)}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total Comprado</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>{itemSelecionado.total}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Disponível</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>{itemSelecionado.em_estoque || 0}</Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
const PatrimonioPage = () => {
  const { forcarAtualizacaoGeral } = useContext(AppContext);

  // A função de exclusão de PATRIMÔNIO (item individual) vive aqui
  const handleExcluirEquipamento = async (equipamentoId) => {
    if (window.confirm('Tem certeza que deseja excluir este item de patrimônio permanentemente?')) {
      try {
        // MUDANÇA 3: api.delete em vez de axios.delete
        await api.delete(`/api/equipamentos/${equipamentoId}`);

        alert('Item de patrimônio excluído com sucesso!');
        forcarAtualizacaoGeral(); // Atualiza a lista após a exclusão
      } catch (error) {
        alert('Erro ao excluir o item.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Patrimônio e Estoque</Typography>

      {/* 1. VISÃO GERAL DE ESTOQUE (AGORA NESTA PÁGINA) */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <VisaoEstoque />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* 2. PATRIMÔNIO POR COLABORADOR */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <UsuariosComItens />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* 3. INVENTÁRIO GERAL (LISTA DETALHADA) */}
      <EquipamentosLista onExcluir={handleExcluirEquipamento} />
    </Box>
  );
};

export default PatrimonioPage;