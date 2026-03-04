import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Box, Typography } from '@mui/material';

const AppLinkQRCode = () => {
  // MUDANÇA: Usamos window.location.origin para pegar a URL atual do site automaticamente.
  // Isso garante que funcione tanto no localhost quanto no Render sem precisar mudar código.
  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const appUrl = `${origin}/verificar`;

  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>Aceder ao Inventário</Typography>
      <QRCodeCanvas value={appUrl} size={180} />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Escaneie para abrir a página de visualização de estoque.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}>
        {appUrl}
      </Typography>
    </Box>
  );
};

export default AppLinkQRCode;