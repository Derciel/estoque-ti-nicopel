import React, { useState, useEffect, useMemo, useContext } from 'react';
// MUDANÇA 1: Importamos api em vez de axios
import api from '../services/api';
import { QRCodeCanvas } from 'qrcode.react';
import { AppContext } from '../context/AppContext';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Avatar,
  Grid,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';

const EquipamentosLista = ({ onExcluir }) => {
  const { listaKey } = useContext(AppContext);
  const [equipamentos, setEquipamentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [imagemModalOpen, setImagemModalOpen] = useState(false);
  const [etiquetaModalOpen, setEtiquetaModalOpen] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [selecionados, setSelecionados] = useState([]);

  // Função auxiliar para corrigir URL da imagem no Render
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.REACT_APP_API_URL || '';
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    // MUDANÇA 2: api.get
    api.get('/api/equipamentos')
      .then(response => setEquipamentos(response.data))
      .catch(error => console.error('Erro ao buscar equipamentos:', error));
  }, [listaKey]);

  const totalizadores = useMemo(() => {
    if (!equipamentos) return { total: 0, emEstoque: 0, emUso: 0 };
    return {
      total: equipamentos.length,
      emEstoque: equipamentos.filter(item => item.status === 'Em Estoque').length,
      emUso: equipamentos.filter(item => item.status === 'Em Uso').length,
    };
  }, [equipamentos]);

  const handleOpenImagemModal = (item) => { setItemSelecionado(item); setImagemModalOpen(true); };
  const handleCloseImagemModal = () => setImagemModalOpen(false);
  const handleOpenEtiquetaModal = (item) => { setItemSelecionado(item); setEtiquetaModalOpen(true); };
  const handleCloseEtiquetaModal = () => setEtiquetaModalOpen(false);

  const handleDownload = () => {
    const etiquetaElement = document.getElementById('etiqueta-para-download');
    if (etiquetaElement) {
      html2canvas(etiquetaElement, { backgroundColor: '#FFFFFF' }).then(canvas => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `etiqueta-${itemSelecionado.codigo_produto}.png`;
        link.click();
      });
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredEquipamentos.map(item => item.id);
      setSelecionados(allIds);
    } else {
      setSelecionados([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selecionados.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selecionados, id);
    } else {
      newSelected = selecionados.filter(selectedId => selectedId !== id);
    }
    setSelecionados(newSelected);
  };

  const handleExportarPDF = async () => {
    const itensParaExportar = equipamentos.filter(item => selecionados.includes(item.id));
    if (itensParaExportar.length === 0) {
      alert("Por favor, selecione pelo menos um item para exportar.");
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const etiquetaWidth = 40;
    const etiquetaHeight = 30;
    const margin = 5;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    let x = margin;
    let y = margin;

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    for (const item of itensParaExportar) {
      const etiquetaElement = document.createElement('div');
      tempContainer.appendChild(etiquetaElement);

      const qrCodeComponent = (
        <Box sx={{ p: 0.5, backgroundColor: 'white', textAlign: 'center', width: `${etiquetaWidth * 3}px` }}>
          <QRCodeCanvas value={getQrCodeValue(item)} size={70} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} imageSettings={{ src: "/logo.png", height: 24, width: 24, excavate: true }} />
          <Typography sx={{ fontWeight: 'bold', fontSize: '10px', color: 'black', fontFamily: 'monospace' }}>
            {item.codigo_produto}
          </Typography>
        </Box>
      );

      const root = createRoot(etiquetaElement);
      await new Promise(resolve => {
        root.render(qrCodeComponent);
        setTimeout(resolve, 50);
      });

      const canvas = await html2canvas(etiquetaElement, { scale: 6 });
      const imgData = canvas.toDataURL('image/png');

      if (y + etiquetaHeight > pageH - margin) {
        pdf.addPage();
        x = margin;
        y = margin;
      }

      pdf.addImage(imgData, 'PNG', x, y, etiquetaWidth, etiquetaHeight);

      x += etiquetaWidth + 2;
      if (x + etiquetaWidth > pageW - margin) {
        x = margin;
        y += etiquetaHeight + 2;
      }

      root.unmount();
    }

    document.body.removeChild(tempContainer);
    pdf.save('etiquetas-patrimonio.pdf');
    setSelecionados([]);
  };

  const filteredEquipamentos = useMemo(() => {
    if (!equipamentos) return [];
    return equipamentos
      .filter(item => statusFilter === 'Todos' || item.status === statusFilter)
      .filter(item => {
        const search = searchTerm.toLowerCase();
        return (
          item.nome_produto?.toLowerCase().includes(search) ||
          item.codigo_produto?.toLowerCase().includes(search) ||
          item.nome_usuario?.toLowerCase().includes(search)
        );
      });
  }, [equipamentos, searchTerm, statusFilter]);

  const getStatusChipColor = (status) => {
    if (status === 'Em Uso') return 'warning';
    if (status === 'Manutenção') return 'error';
    return 'success';
  };

  const getQrCodeValue = (item) => JSON.stringify({ id: item.id, tipo: 'equipamento', codigo: item.codigo_produto });

  return (
    <Paper sx={{ p: 3, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', m: 0 }}>Inventário Geral de Patrimônio</Typography>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportarPDF}
          disabled={selecionados.length === 0}
        >
          Exportar ({selecionados.length}) Selecionado(s)
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}><Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">Total de Itens</Typography><Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalizadores.total}</Typography></Paper></Grid>
        <Grid item xs={6} sm={4}><Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'success.main' }}><Typography variant="body2" color="text.secondary">Em Estoque</Typography><Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>{totalizadores.emEstoque}</Typography></Paper></Grid>
        <Grid item xs={6} sm={4}><Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderColor: 'warning.main' }}><Typography variant="body2" color="text.secondary">Em Uso</Typography><Typography variant="h5" sx={{ fontWeight: 'bold', color: 'warning.main' }}>{totalizadores.emUso}</Typography></Paper></Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="Pesquisar..." variant="outlined" size="small" fullWidth value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filtrar por Status</InputLabel>
          <Select value={statusFilter} label="Filtrar por Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="Todos">Todos</MenuItem>
            <MenuItem value="Em Estoque">Em Estoque</MenuItem>
            <MenuItem value="Em Uso">Em Uso</MenuItem>
            <MenuItem value="Manutenção">Manutenção</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selecionados.length > 0 && selecionados.length < filteredEquipamentos.length}
                  checked={filteredEquipamentos.length > 0 && selecionados.length === filteredEquipamentos.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Imagem</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Cód. Patrimônio</TableCell>
              <TableCell>Usuário Alocado</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">QR Code</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEquipamentos.map((item) => {
              const isSelected = selecionados.indexOf(item.id) !== -1;
              return (
                <TableRow key={item.id} hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onClick={() => handleSelectOne(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      // MUDANÇA: Usando getImageUrl para garantir que a imagem apareça
                      src={getImageUrl(item.imagem_url) || '/placeholder.png'}
                      onClick={() => item.imagem_url && handleOpenImagemModal(item)}
                      sx={{ cursor: item.imagem_url ? 'pointer' : 'default' }}
                    />
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.nome_produto}</TableCell>
                  <TableCell>{item.codigo_produto}</TableCell>
                  <TableCell>{item.nome_usuario || '---'}</TableCell>
                  <TableCell align="center"><Chip label={item.status} color={getStatusChipColor(item.status)} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
                  <TableCell align="center" sx={{ p: '4px' }}>
                    <Box sx={{ p: 0.5, backgroundColor: 'white', borderRadius: 1, display: 'inline-block' }}>
                      <QRCodeCanvas value={getQrCodeValue(item)} size={50} bgColor={"#ffffff"} fgColor={"#000000"} imageSettings={{ src: "/logo.png", height: 12, width: 12, excavate: true }} />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="default" onClick={() => handleOpenEtiquetaModal(item)} title="Ver/Baixar Etiqueta"><DownloadIcon /></IconButton>
                    <IconButton color="error" onClick={() => onExcluir(item.id)} title="Excluir Item"><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog onClose={handleCloseImagemModal} open={imagemModalOpen} maxWidth="md">
        {itemSelecionado && <img src={getImageUrl(itemSelecionado.imagem_url)} alt={itemSelecionado.nome_produto} style={{ width: '100%', height: 'auto' }} />}
      </Dialog>

      <Dialog onClose={handleCloseEtiquetaModal} open={etiquetaModalOpen}>
        <DialogTitle>Etiqueta de Patrimônio</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {itemSelecionado && (
            <Box>
              <Box id="etiqueta-para-download" sx={{ p: 2, backgroundColor: 'white', textAlign: 'center', width: '220px' }}>
                <QRCodeCanvas value={getQrCodeValue(itemSelecionado)} size={180} bgColor={"#ffffff"} fgColor={"#000000"} imageSettings={{ src: "/logo.png", height: 35, width: 35, excavate: true }} />
                <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: 'black', mt: 1, fontFamily: 'monospace' }}>
                  {itemSelecionado.codigo_produto}
                </Typography>
              </Box>
              <Button variant="contained" onClick={handleDownload} sx={{ mt: 2, width: '100%' }}>
                Baixar Etiqueta
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default EquipamentosLista;