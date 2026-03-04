import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText color="text.primary">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
          Confirmar Exclusão
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
