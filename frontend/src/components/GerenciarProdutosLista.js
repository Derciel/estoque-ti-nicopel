import React, { useState, useEffect, useContext } from 'react';
// MUDANÇA 1: Importamos api em vez de axios
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Avatar,
  Dialog,
  DialogContent,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const GerenciarProdutosLista = ({ onEditarProduto }) => {
  const [produtos, setProdutos] = useState([]);
  const { listaKey, forcarAtualizacaoGeral } = useContext(AppContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // Função auxiliar para montar a URL da imagem corretamente no Render
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url; // Se já for completa, retorna ela
    // Se for relativa, adiciona a base da API
    const baseUrl = process.env.REACT_APP_API_URL || '';
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    // MUDANÇA 2: api.get
    api.get('/api/produtos')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => console.error("Erro ao buscar produtos:", error));
  }, [listaKey]);

  const handleExcluirProduto = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este Tipo de Produto?')) {
      try {
        // MUDANÇA 3: api.delete
        const response = await api.delete(`/api/produtos/${produtoId}`);
        alert(response.data.message);
        forcarAtualizacaoGeral();
      } catch (error) {
        alert(`Erro: ${error.response ? error.response.data.message : 'Não foi possível conectar ao servidor'}`);
      }
    }
  };

  const handleOpenModal = (imageUrl) => {
    setSelectedImage(getImageUrl(imageUrl));
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tipos de Produto Cadastrados</Typography>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="tabela de gestão de produtos">
          <TableHead>
            <TableRow>
              <TableCell>Imagem</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos && produtos.map(produto => (
              <TableRow key={produto.id} hover>
                <TableCell>
                  {produto.imagem_url && (
                    <Avatar
                      variant="rounded"
                      // Usamos a função auxiliar para garantir que a imagem apareça
                      src={getImageUrl(produto.imagem_url)}
                      alt={produto.nome}
                      onClick={() => handleOpenModal(produto.imagem_url)}
                      sx={{ cursor: 'pointer' }}
                    />
                  )}
                </TableCell>
                <TableCell>{produto.id}</TableCell>
                <TableCell component="th" scope="row">{produto.nome}</TableCell>
                <TableCell>{produto.marca || '---'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => onEditarProduto(produto)} title="Editar Produto">
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleExcluirProduto(produto.id)} title="Excluir Produto">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md">
        <DialogContent sx={{ p: 1 }}>
          <img src={selectedImage} alt="Visualização do Produto" style={{ width: '100%', height: 'auto', borderRadius: '4px' }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GerenciarProdutosLista;