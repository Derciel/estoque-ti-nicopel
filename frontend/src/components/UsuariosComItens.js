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
          <Accordion key={usuario.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Avatar sx={{ background: `linear-gradient(135deg, ${userColors[index % userColors.length]} 0%, #111 100%)`, mr: 2 }}>{usuario.nome.charAt(0)}</Avatar>
                <Typography sx={{ flexGrow: 1, fontWeight: 700 }}>{usuario.nome}</Typography>
                <Chip label={`${usuario.equipamentos.length} item(s)`} color="primary" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {Object.entries(equipamentosAgrupados).map(([nomeProduto, itens]) => (
                  <Accordion key={nomeProduto} elevation={0} sx={{ border: 'none', mb: 0 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 1 }}>
                      <Typography component="div" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {nomeProduto}
                        <Chip label={itens.length} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <List dense disablePadding>
                        {itens.map(item => (
                          <ListItem key={item.id} sx={{ py: 0 }}>
                            <ListItemText
                              secondary={`Patrimônio: ${item.codigo_produto}`}
                              secondaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary' }}
                            />
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