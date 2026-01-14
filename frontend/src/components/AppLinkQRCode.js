import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Box, Typography } from '@mui/material';

const AppLinkQRCode = () => {
  // Altera o caminho para a página de patrimônio/estoque
  const appUrl = `https://willingly-relieved-polliwog.ngrok-free.app/patrimonio`;

  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>Aceder ao Inventário</Typography>
      <QRCodeCanvas value={appUrl} size={180} />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Escaneie para abrir a página de visualização de estoque.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {appUrl}
      </Typography>
    </Box>
  );
};

export default AppLinkQRCode;