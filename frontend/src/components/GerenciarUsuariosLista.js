import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Paper, alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const GerenciarUsuariosLista = ({ onEditarUsuario, onExcluirUsuario, listaKey }) => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    api.get('/api/usuarios')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error("Erro ao buscar usuários:", error));
  }, [listaKey]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Usuários Cadastrados</Typography>
      <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255,255,255,0.01)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
        <Table size="small" aria-label="tabela de usuários">
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>NOME</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>DEPARTAMENTO</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>AÇÕES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map(usuario => (
              <TableRow key={usuario.id} hover sx={{ '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)' } }}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>{usuario.nome}</TableCell>
                <TableCell>{usuario.matricula || '---'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    sx={{ color: 'primary.main', mr: 1, bgcolor: alpha('#BEF264', 0.05), '&:hover': { bgcolor: alpha('#BEF264', 0.2) } }}
                    onClick={() => onEditarUsuario(usuario)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={(theme) => ({
                      color: 'error.main',
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                    })}
                    onClick={() => onExcluirUsuario(usuario.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GerenciarUsuariosLista;