import React, { useState, useEffect, useContext } from 'react';
// MUDANÇA 1: Importamos api em vez de axios
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Avatar, Chip, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { deepOrange, deepPurple, green, blue } from '@mui/material/colors';

const userColors = [deepOrange[500], deepPurple[500], green[500], blue[500]];

const agruparEquipamentos = (equipamentos) => {
  if (!equipamentos) return {};
  return equipamentos.reduce((acc, equipamento) => {
    const nomeProduto = equipamento.nome_produto;
    if (!acc[nomeProduto]) {
      acc[nomeProduto] = [];
    }
    acc[nomeProduto].push(equipamento);
    return acc;
  }, {});
};

const UsuariosComItens = () => {
  const { listaKey } = useContext(AppContext);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // MUDANÇA 2: Usamos api.get para buscar do backend correto
    api.get(`/api/usuarios/com-equipamentos`)
      .then(response => {
        setDados(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados de patrimônio:", error);
        setLoading(false);
      });
  }, [listaKey]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  const usuariosComItens = dados.filter(usuario => usuario.equipamentos.length > 0);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Patrimônio por Colaborador</Typography>
      {usuariosComItens.length > 0 ? usuariosComItens.map((usuario, index) => {
        const equipamentosAgrupados = agruparEquipamentos(usuario.equipamentos);
        return (
          <Accordion key={usuario.id} sx={{ backgroundImage: 'none', mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ bgcolor: userColors[index % userColors.length], mr: 2 }}>{usuario.nome.charAt(0)}</Avatar>
                <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>{usuario.nome}</Typography>
                <Chip label={`${usuario.equipamentos.length} item(s) alocado(s)`} color="primary" size="small" />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
              <List dense>
                {Object.entries(equipamentosAgrupados).map(([nomeProduto, itens]) => (
                  <Accordion key={nomeProduto} sx={{ backgroundImage: 'none', boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography component="div" sx={{ fontWeight: 500 }}>
                        {nomeProduto}
                        <Chip label={`${itens.length} Unidade(s)`} size="small" sx={{ ml: 2 }} />
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense disablePadding>
                        {itens.map(item => (
                          <ListItem key={item.id}>
                            <ListItemText secondary={`Patrimônio: ${item.codigo_produto}`} />
                          </ListItem>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      }) : <Typography color="text.secondary">Nenhum item alocado a colaboradores no momento.</Typography>}
    </Box>
  );
};

export default UsuariosComItens;