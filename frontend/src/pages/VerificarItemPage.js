import React, { useState, useEffect, useContext, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
// MUDANÇA 1: Trocamos o axios puro pelo nosso serviço configurado
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  TextField,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import InventoryIcon from '@mui/icons-material/Inventory';

// Função para definir o tamanho da caixa de leitura do QR Code
const qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
  let minEdgePercentage = 0.7;
  let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
  let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
  return { width: qrboxSize, height: qrboxSize };
};

const VerificarItemPage = () => {
  const { forcarAtualizacaoGeral } = useContext(AppContext);
  const navigate = useNavigate();
  const [itemDetails, setItemDetails] = useState(null);
  const [estoqueInfo, setEstoqueInfo] = useState(null);
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const [loading, setLoading] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);

  // Busca a lista de usuários UMA VEZ
  useEffect(() => {
    // MUDANÇA 2: api.get
    api.get('/api/usuarios')
      .then(response => {
        setUsuarios(response.data);
        if (response.data.length > 0) setSelectedUserId(response.data[0].id);
      })
      .catch(err => console.error("Erro ao buscar usuários: ", err));
  }, []);

  // Efeito para controlar o ciclo de vida do scanner de forma robusta
  useEffect(() => {
    if (showScanner) {
      const html5QrCode = new Html5Qrcode('reader-verifier');
      scannerRef.current = html5QrCode; // Guarda a instância na ref
      const config = { fps: 10, qrbox: qrboxFunction };

      const onScanSuccess = (decodedText) => {
        html5QrCode.stop().then(() => {
          setShowScanner(false);
          handleScan(decodedText);
        }).catch(err => console.error("Falha ao parar o scanner.", err));
      };

      html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .catch(err => {
          console.error("Não foi possível iniciar o scanner.", err);
          setFeedback({ error: "Não foi possível iniciar a câmara. Verifique as permissões.", success: '' });
          setShowScanner(false);
        });

      return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => { });
        }
      };
    }
  }, [showScanner]);

  const clearState = () => {
    setItemDetails(null);
    setEstoqueInfo(null);
    setFeedback({ error: '', success: '' });
    setCodigoManual('');
  };

  const fetchItemDetailsByCode = async (code) => {
    setLoading(true);
    clearState();
    try {
      // MUDANÇA 3: api.get
      const response = await api.get(`/api/equipamentos/por-codigo/${code}`);
      setItemDetails(response.data);

      if (response.data.produto_id) {
        // MUDANÇA 4: api.get
        const estoqueRes = await api.get('/api/estoque');
        const info = estoqueRes.data.find(p => p.id === response.data.produto_id);
        setEstoqueInfo(info);
      }
    } catch (e) {
      setFeedback({ error: 'Equipamento com este código não foi encontrado.', success: '' });
    }
    setLoading(false);
  };

  const handleScan = async (qrData) => {
    try {
      const data = JSON.parse(qrData);
      fetchItemDetailsByCode(data.codigo);
    } catch (e) {
      setFeedback({ error: 'QR Code inválido.', success: '' });
    }
  };

  const handleManualLookup = (e) => {
    e.preventDefault();
    if (!codigoManual) return setFeedback({ error: 'Por favor, insira um código de patrimônio.', success: '' });
    fetchItemDetailsByCode(codigoManual.trim());
  };

  const handleAlocar = async () => {
    setLoading(true);
    try {
      // MUDANÇA 5: api.post
      await api.post(`/api/equipamentos/${itemDetails.id}/alocar`, { usuario_id: selectedUserId });
      setFeedback({ success: 'Item alocado com sucesso!', error: '' });
      forcarAtualizacaoGeral();
      await fetchItemDetailsByCode(itemDetails.codigo_produto);
    } catch (error) {
      setFeedback({ error: 'Erro ao alocar item.', success: '' });
    }
    setLoading(false);
  };

  const handleDesalocar = async () => {
    setLoading(true);
    try {
      // MUDANÇA 6: api.post
      await api.post(`/api/equipamentos/${itemDetails.id}/desalocar`);
      setFeedback({ success: 'Item devolvido ao estoque com sucesso!', error: '' });
      forcarAtualizacaoGeral();
      await fetchItemDetailsByCode(itemDetails.codigo_produto);
    } catch (error) {
      setFeedback({ error: 'Erro ao desalocar item.', success: '' });
    }
    setLoading(false);
  };

  const getStatusChipColor = (status) => {
    if (status === 'Em Uso') return 'warning';
    if (status === 'Manutenção') return 'error';
    return 'success';
  };

  const handleNewOperation = () => {
    clearState();
    setShowScanner(false);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Operações de Patrimônio</Typography>
      <Paper sx={{ p: 3, maxWidth: '700px', margin: 'auto', borderRadius: 4 }}>

        {itemDetails ? (
          <Box>
            {feedback.error && <Alert severity="error" sx={{ mb: 2 }}>{feedback.error}</Alert>}
            {feedback.success && <Alert severity="success" sx={{ mb: 2 }}>{feedback.success}</Alert>}

            <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>{itemDetails.nome_produto}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">Cód. Patrimônio: {itemDetails.codigo_produto}</Typography>
                <Chip label={itemDetails.status} color={getStatusChipColor(itemDetails.status)} size="small" sx={{ fontWeight: 'bold' }} />
                {itemDetails.status === 'Em Uso' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}><PersonIcon /></Avatar>
                    <Box><Typography variant="body2">Alocado para:</Typography><Typography variant="h6">{itemDetails.nome_usuario || 'Não identificado'}</Typography></Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {estoqueInfo && (
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>Visão Geral do Produto</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}><InventoryIcon /></Avatar>
                    <Box>
                      <Typography variant="body2">Disponível / Total em Estoque</Typography>
                      <Typography variant="h6" component="p" sx={{ fontWeight: 'bold' }}>
                        {estoqueInfo.em_estoque || 0} / {estoqueInfo.total}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 3 }}>
              {itemDetails.status === 'Em Estoque' && (
                <Box>
                  <Typography sx={{ mb: 2 }}>Alocar para:</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl fullWidth size="small"><InputLabel>Colaborador</InputLabel><Select value={selectedUserId} label="Colaborador" onChange={(e) => setSelectedUserId(e.target.value)}>{usuarios.map(u => <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>)}</Select></FormControl>
                    <Button variant="contained" onClick={handleAlocar} disabled={loading}>Alocar</Button>
                  </Box>
                </Box>
              )}
              {itemDetails.status === 'Em Uso' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="contained" color="warning" fullWidth onClick={handleDesalocar} disabled={loading}>Devolver ao Estoque</Button>
                  <Button variant="outlined" fullWidth onClick={() => navigate('/patrimonio')}>Visualizar Lista de Patrimônio</Button>
                </Box>
              )}
            </Paper>
            <Button variant="text" onClick={handleNewOperation} fullWidth sx={{ mt: 2 }}>Verificar Outro Item</Button>
          </Box>
        ) : (
          <>
            <Box component="form" onSubmit={handleManualLookup}>
              <Typography variant="h6" gutterBottom>Busca por Código</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField label="Digite o Cód. de Patrimônio" variant="outlined" size="small" fullWidth value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} />
                <Button type="submit" variant="contained" disabled={loading}>Verificar</Button>
              </Box>
            </Box>
            <Divider sx={{ my: 3 }}>OU</Divider>
            <Typography variant="h6" gutterBottom>Busca por QR Code</Typography>
            {showScanner ? (
              <Box sx={{ position: 'relative' }}>
                <div id="reader-verifier" style={{ borderRadius: '8px', overflow: 'hidden' }}></div>
                <Box
                  sx={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    boxShadow: 'inset 0 0 0 500px rgba(0,0,0,0.5)',
                    '&:after': {
                      content: '""', position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '250px', height: '250px',
                      boxShadow: 'inset 0 0 0 5px white',
                      borderRadius: '8px',
                    }
                  }}
                />
              </Box>
            ) : (
              <Button variant="contained" startIcon={<CameraAltIcon />} onClick={() => setShowScanner(true)} sx={{ mt: 2 }}>
                Ativar Leitor
              </Button>
            )}
          </>
        )}

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {!itemDetails && feedback.error && <Alert severity="error" sx={{ mt: 2 }}>{feedback.error}</Alert>}
      </Paper>
    </Box>
  );
};

export default VerificarItemPage;