import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Divider, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Avatar, Dialog, DialogContent } from '@mui/material';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

// Importa os componentes filhos que esta página irá usar
import UsuariosComItens from '../components/UsuariosComItens';
import EquipamentosLista from '../components/EquipamentosLista';

// --- COMPONENTE PARA A VISÃO GERAL DE ESTOQUE ---
// (Movido para dentro deste ficheiro para simplificar)
const VisaoEstoque = () => {
  const { listaKey } = useContext(AppContext);
  const [estoque, setEstoque] = useState([]);
  const [imagemModalOpen, setImagemModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);

  useEffect(() => {
    axios.get('/api/estoque')
      .then(response => {
        setEstoque(response.data);
      })
      .catch(error => console.error("Erro ao buscar estoque:", error));
  }, [listaKey]);
  
  const handleOpenImagemModal = (item) => {
    setItemSelecionado(item);
    setImagemModalOpen(true);
  };
  const handleCloseImagemModal = () => setImagemModalOpen(false);

  const getStatusChipColor = (disponivel, total) => {
    if (total === 0) return 'default';
    if (disponivel === total) return 'success';
    if (disponivel > 0) return 'warning';
    return 'error';
  };
  
  return (
    <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Visão Geral de Estoque</Typography>
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="tabela de estoque">
                <TableHead>
                <TableRow>
                    <TableCell>Imagem</TableCell>
                    <TableCell>Produto</TableCell>
                    <TableCell>Marca</TableCell>
                    <TableCell align="right">Qtd. Total</TableCell>
                    <TableCell align="right">Disponível</TableCell>
                    <TableCell align="center">Status</TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {estoque.map((produto) => (
                    <TableRow key={produto.id} hover>
                    <TableCell>
                        {produto.imagem_url && (
                            <Avatar 
                                variant="rounded" 
                                src={produto.imagem_url}
                                onClick={() => handleOpenImagemModal(produto)}
                                sx={{ cursor: 'pointer' }}
                            />
                        )}
                    </TableCell>
                    <TableCell component="th" scope="row">{produto.nome}</TableCell>
                    <TableCell>{produto.marca || 'N/A'}</TableCell>
                    <TableCell align="right">{produto.total}</TableCell>
                    <TableCell align="right">{produto.em_estoque || 0}</TableCell>
                    <TableCell align="center">
                        <Chip 
                        label={`${Math.round((produto.em_estoque / produto.total) * 100) || 0}% Disponível`}
                        color={getStatusChipColor(produto.em_estoque, produto.total)} 
                        size="small"
                        />
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>
        
        <Dialog onClose={handleCloseImagemModal} open={imagemModalOpen} maxWidth="md">
            {itemSelecionado && <img src={itemSelecionado.imagem_url} alt={itemSelecionado.nome_produto} style={{ width: '100%', height: 'auto' }} />}
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
        await axios.delete(`/api/equipamentos/${equipamentoId}`);
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