import React, { useState, useEffect, useContext } from 'react';
// MUDANÇA 1: Importamos api em vez de axios
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

const AdicionarUsuario = ({ usuarioParaEditar, onFinishEdit }) => {
  const { forcarAtualizacaoGeral } = useContext(AppContext);
  const [form, setForm] = useState({ nome: '', matricula: '' });
  const [isEditing, setIsEditing] = useState(false);
  // State para controlar as mensagens de feedback
  const [feedback, setFeedback] = useState({ error: '', success: '' });

  useEffect(() => {
    if (usuarioParaEditar) {
      setForm(usuarioParaEditar);
      setIsEditing(true);
      setFeedback({ error: '', success: '' }); // Limpa mensagens antigas
    } else {
      setForm({ nome: '', matricula: '' });
      setIsEditing(false);
    }
  }, [usuarioParaEditar]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ error: '', success: '' }); // Limpa a mensagem antes de cada tentativa

    const url = isEditing ? `/api/usuarios/${form.id}` : '/api/usuarios';
    const method = isEditing ? 'put' : 'post';

    try {
      // MUDANÇA 2: Usamos api[method] para garantir a URL base correta
      await api[method](url, form);

      const successMessage = `Usuário ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!`;
      setFeedback({ success: successMessage, error: '' });

      // Se tivermos uma função de callback para finalizar a edição (limpar o form pai)
      if (onFinishEdit) onFinishEdit();

      forcarAtualizacaoGeral();

    } catch (error) {
      // Verificamos se o erro tem uma resposta e uma mensagem específica do servidor
      if (error.response && error.response.data && error.response.data.message) {
        setFeedback({ error: error.response.data.message, success: '' });
      } else {
        setFeedback({ error: 'Ocorreu um erro de comunicação com o servidor.', success: '' });
      }
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleCancelEdit = () => {
    if (onFinishEdit) onFinishEdit();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
      </Typography>

      {/* Mostra os alertas de sucesso ou erro */}
      {feedback.success && <Alert severity="success" sx={{ mb: 2 }}>{feedback.success}</Alert>}
      {feedback.error && <Alert severity="error" sx={{ mb: 2 }}>{feedback.error}</Alert>}

      <TextField name="nome" label="Nome do Usuário" value={form.nome} onChange={handleChange} fullWidth required margin="normal" />
      <TextField name="matricula" label="Departamento" value={form.matricula} onChange={handleChange} fullWidth margin="normal" />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">{isEditing ? 'Salvar Alterações' : 'Cadastrar Usuário'}</Button>
        {isEditing && <Button variant="outlined" color="secondary" onClick={handleCancelEdit}>Cancelar</Button>}
      </Box>
    </Box>
  );
};

export default AdicionarUsuario;