import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const GerenciarUsuariosLista = ({ onEditarUsuario, listaKey }) => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios.get('/api/usuarios')
      .then(response => setUsuarios(response.data))
      .catch(error => console.error("Erro ao buscar usuários:", error));
  }, [listaKey]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Usuários Cadastrados</Typography>
      <TableContainer>
        <Table size="small" aria-label="tabela de usuários">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Matrícula</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map(usuario => (
              <TableRow key={usuario.id} hover>
                <TableCell>{usuario.id}</TableCell>
                <TableCell component="th" scope="row">{usuario.nome}</TableCell>
                <TableCell>{usuario.matricula || '---'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => onEditarUsuario(usuario)}><EditIcon /></IconButton>
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