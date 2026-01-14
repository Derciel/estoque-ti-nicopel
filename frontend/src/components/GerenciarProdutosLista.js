import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
  Grid // Importação do Grid que estava em falta
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const GerenciarProdutosLista = ({ onEditarProduto }) => {
  const [produtos, setProdutos] = useState([]);
  const { listaKey, forcarAtualizacaoGeral } = useContext(AppContext);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    // Usa o caminho relativo para a API, que funcionará com o proxy
    axios.get('/api/produtos')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => console.error("Erro ao buscar produtos:", error));
  }, [listaKey]);

  const handleExcluirProduto = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este Tipo de Produto?')) {
      try {
        // CORREÇÃO: Usa o caminho relativo para a API
        const response = await axios.delete(`/api/produtos/${produtoId}`);
        alert(response.data.message);
        forcarAtualizacaoGeral();
      } catch (error) {
        alert(`Erro: ${error.response ? error.response.data.message : 'Não foi possível conectar ao servidor'}`);
      }
    }
  };

  const handleOpenModal = (imageUrl) => {
    setSelectedImage(imageUrl);
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
                  {/* CORREÇÃO: Usa o caminho relativo para a imagem */}
                  {produto.imagem_url && (
                    <Avatar 
                      variant="rounded"
                      src={produto.imagem_url} 
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