import React, { useState, useEffect, useContext } from 'react'; // 1. Importar useContext
import axios from 'axios';
import { AppContext } from '../context/AppContext'; // 2. Importar o nosso Contexto
import { Box, Typography, TextField, Button, Avatar, } from '@mui/material';

const GerenciarProdutos = ({ produtoParaEditar, onFinishEdit }) => {
  const { forcarAtualizacaoGeral } = useContext(AppContext);
  const [form, setForm] = useState({ nome: '', marca: '', descricao: '', imagem_url: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [imagemFile, setImagemFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
      if (produtoParaEditar) {
        setForm(produtoParaEditar);
        setIsEditing(true);
        setPreview(produtoParaEditar.imagem_url ? `${process.env.REACT_APP_API_URL}${produtoParaEditar.imagem_url}` : null);
      } else {
      setForm({ nome: '', marca: '', descricao: '', imagem_url: '' });
      setIsEditing(false);
      setPreview(null);
    }
  }, [produtoParaEditar]);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      // Validação do tipo de arquivo
      if (!e.target.files[0].type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem.');
        return;
      }

      setImagemFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nome', form.nome);
    formData.append('marca', form.marca);
    formData.append('descricao', form.descricao);
    if (imagemFile) {
      formData.append('imagem', imagemFile);
    }

    const method = isEditing ? 'put' : 'post';
    const url = isEditing
      ? `/api/produtos/${form.id}`
      : '/api/produtos';

    try {
      await axios[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onFinishEdit();
      forcarAtualizacaoGeral();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Ocorreu um erro ao salvar o produto.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {isEditing ? 'Editar Tipo de Produto' : 'Adicionar Tipo de Produto'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar variant="rounded" src={preview || '/placeholder.png'} sx={{ width: 80, height: 80 }} />
        <Button variant="outlined" component="label">
          Carregar Imagem
          <input type="file" hidden accept="image/*" onChange={handleImageChange} />
        </Button>
      </Box>

      <TextField name="nome" label="Nome do Produto" value={form.nome} onChange={handleFormChange} fullWidth required margin="normal" />
      <TextField name="marca" label="Marca" value={form.marca} onChange={handleFormChange} fullWidth margin="normal" />
      <TextField name="descricao" label="Descrição" value={form.descricao} onChange={handleFormChange} fullWidth multiline rows={2} margin="normal" />

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">{isEditing ? 'Salvar Alterações' : 'Adicionar Produto'}</Button>
        {isEditing && <Button variant="outlined" color="secondary" onClick={onFinishEdit}>Cancelar</Button>}
      </Box>
    </Box>
  );
};

export default GerenciarProdutos;
