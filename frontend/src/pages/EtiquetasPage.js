import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material'; // Removi Paper que não estava sendo usado diretamente
import { AppContext } from '../context/AppContext';

// MUDANÇA 1: Importamos a nossa configuração de API em vez do axios puro
import api from '../services/api';

// Importamos o nosso componente de lista de equipamentos
import EquipamentosLista from '../components/EquipamentosLista';

const EtiquetasPage = () => {
  const { forcarAtualizacaoGeral } = useContext(AppContext);

  // A função de exclusão de PATRIMÔNIO (item individual)
  const handleExcluirEquipamento = async (equipamentoId) => {
    if (window.confirm('Tem certeza que deseja excluir este item de patrimônio permanentemente?')) {
      try {
        // MUDANÇA 2: Usamos 'api.delete' para que ele saiba usar a URL do Render
        await api.delete(`/api/equipamentos/${equipamentoId}`);

        alert('Item de patrimônio excluído com sucesso!');
        forcarAtualizacaoGeral(); // Atualiza a lista após a exclusão
      } catch (error) {
        alert('Erro ao excluir o item.');
        console.error('Erro ao excluir:', error);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Etiquetas de Patrimônio
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Utilize esta página para encontrar um item de património existente e visualizar ou descarregar a sua etiqueta de QR Code para impressão.
      </Typography>

      {/* Usamos o componente EquipamentosLista, passando a função de exclusão */}
      <EquipamentosLista onExcluir={handleExcluirEquipamento} />

    </Box>
  );
};

export default EtiquetasPage;