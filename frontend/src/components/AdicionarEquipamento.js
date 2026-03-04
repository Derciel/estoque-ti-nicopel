import React, { useState, useEffect, useContext } from 'react';
// MUDANÇA 1: Importamos o api em vez do axios
import api from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { QRCodeCanvas } from 'qrcode.react';
import { AppContext } from '../context/AppContext';
import {
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import html2canvas from 'html2canvas';

const AdicionarEquipamento = () => {
  const { forcarAtualizacaoGeral } = useContext(AppContext);
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({ produto_id: '', codigo_produto: '', numero_serie: '' });
  const [itemRecemCriado, setItemRecemCriado] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // MUDANÇA 2: Usamos api.get com a URL correta (com barra no início)
    api.get('/api/produtos')
      .then(response => {
        setProdutos(response.data);
        if (response.data.length > 0) {
          // Define o primeiro produto como padrão para evitar select vazio
          setForm(prev => ({ ...prev, produto_id: response.data[0].id }));
        }
      })
      .catch(error => {
        console.error("Erro ao buscar produtos:", error)
      });
  }, []);

  const getQrCodeValue = (item) => JSON.stringify({ id: item.id, tipo: 'equipamento', codigo: item.codigo_produto });

  const handleDownloadEtiqueta = () => {
    const etiquetaElement = document.getElementById('etiqueta-sucesso');
    if (etiquetaElement) {
      html2canvas(etiquetaElement, { backgroundColor: '#FFFFFF' }).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `etiqueta-${itemRecemCriado.codigo_produto}.png`;
        link.click();
      });
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGerarCodigo = () => {
    const codigoUnico = `PAT-${uuidv4().slice(0, 8).toUpperCase()}`;
    setForm(prev => ({ ...prev, codigo_produto: codigoUnico, numero_serie: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setItemRecemCriado(null);
    try {
      // MUDANÇA 3: api.post para enviar para o backend correto
      const response = await api.post('/api/equipamentos', form);
      setItemRecemCriado(response.data);
      setForm(prev => ({ ...prev, codigo_produto: '', numero_serie: '' }));
      forcarAtualizacaoGeral();
    } catch (error) {
      alert('Erro ao adicionar equipamento. Verifique se o código ou N/S já existe.');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Adicionar Novo Patrimônio ao Estoque</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipo de Produto</InputLabel>
              <Select name="produto_id" value={form.produto_id} label="Tipo de Produto" onChange={handleChange}>
                {produtos.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField name="codigo_produto" label="Cód. Patrimônio" value={form.codigo_produto} onChange={handleChange} fullWidth required margin="normal" />
              <Button variant="outlined" onClick={handleGerarCodigo} sx={{ mt: 1, whiteSpace: 'nowrap' }}>Gerar Código</Button>
            </Box>
            <TextField name="numero_serie" label="Número de Série (Opcional)" value={form.numero_serie} onChange={handleChange} fullWidth margin="normal" />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Adicionar Item ao Inventário'}
            </Button>
          </Grid>

          <Grid item xs={12} md={5}>
            {itemRecemCriado && (
              <Box sx={{ mt: { xs: 3, md: 2 }, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                <Typography variant="h6" color="primary.main" gutterBottom>Item Criado com Sucesso!</Typography>
                <Box id="etiqueta-sucesso" sx={{ p: 2, backgroundColor: 'white', textAlign: 'center', width: '220px', margin: 'auto' }}>
                  <QRCodeCanvas value={getQrCodeValue(itemRecemCriado)} size={180} bgColor={"#ffffff"} fgColor={"#000000"} imageSettings={{ src: "/logo.png", height: 35, width: 35, excavate: true }} />
                  <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: 'black', mt: 1, fontFamily: 'monospace' }}>
                    {itemRecemCriado.codigo_produto}
                  </Typography>
                </Box>
                <Button variant="contained" onClick={handleDownloadEtiqueta} sx={{ mt: 2, width: '100%' }}>
                  Baixar Etiqueta
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default AdicionarEquipamento;