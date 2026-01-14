import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import QRCode from 'qrcode.react';
import axios from 'axios';

const QrCodeScanner = ({ onOperacaoRealizada }) => {
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [itemDetails, setItemDetails] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [scanning, setScanning] = useState(true);

  // Carregar usuários
  useEffect(() => {
    axios.get('/api/usuarios').then(res => {
      setUsuarios(res.data);
      if (res.data.length > 0) setSelectedUserId(res.data[0].id);
    });
  }, []);

  // Inicializar leitor ZXing
  useEffect(() => {
    if (!scanning) return;

    codeReader.current = new BrowserMultiFormatReader();

    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        zoom: 2, // tentativa de zoom nativo
        focusMode: 'continuous'
      }
    };

    codeReader.current.decodeFromVideoDevice(
      null,
      videoRef.current,
      async (result, err) => {
        if (result) {
          try {
            codeReader.current.reset(); // parar após leitura
            const data = JSON.parse(result.getText());
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/equipamentos/${data.id}`);
            setItemDetails(response.data);
            setScanning(false);
          } catch (error) {
            setStatusMessage('Erro ao processar QR Code.');
            console.error(error);
          }
        }
      },
      constraints
    );

    return () => {
      codeReader.current?.reset();
    };
  }, [scanning]);

  // Ações de alocar/desalocar
  const handleAlocarItem = async () => {
    setStatusMessage('');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/equipamentos/${itemDetails.id}/alocar`, {
        usuario_id: selectedUserId
      });
      setStatusMessage(response.data.message);
      setShowQrCode(true);
      if (onOperacaoRealizada) onOperacaoRealizada();
    } catch (error) {
      handleApiError(error, 'alocar');
    }
  };

  const handleDesalocarItem = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/equipamentos/${itemDetails.id}/desalocar`);
      setStatusMessage(response.data.message);
      if (onOperacaoRealizada) onOperacaoRealizada();
    } catch (error) {
      handleApiError(error, 'desalocar');
    }
  };

  const resetState = () => {
    setItemDetails(null);
    setStatusMessage('');
    setShowQrCode(false);
    setScanning(true);
  };

  const handleApiError = (error, operacao) => {
    if (error.response) {
      setStatusMessage(`Erro ao ${operacao}: ${error.response.data.message}`);
    } else {
      setStatusMessage(`Erro de conexão ao tentar ${operacao}.`);
    }
  };

  return (
    <div className="scanner-container">
      <h3>Operações de Estoque (Alocar / Desalocar)</h3>

      {scanning && <video ref={videoRef} style={{ width: '100%', maxWidth: '400px' }} />}

      {!scanning && !itemDetails && (
        <button onClick={resetState}>📷 Ler outro QR Code</button>
      )}

      {itemDetails && (
        <div className="scan-result">
          <h4>Item Escaneado: {itemDetails.nome}</h4>
          <p>Status Atual: <span className={`status ${itemDetails.status.replace(' ', '-').toLowerCase()}`}>{itemDetails.status}</span></p>

          {itemDetails.status === 'Em Estoque' && (
            <div className="alocacao-controls">
              <label>Alocar para:</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </select>
              <button onClick={handleAlocarItem}>✅ Alocar Item</button>
            </div>
          )}

          {itemDetails.status === 'Em Uso' && (
            <div className="alocacao-controls">
              <button onClick={handleDesalocarItem} className="desalocar-btn">📦 Devolver ao Estoque</button>
            </div>
          )}
        </div>
      )}

      {statusMessage && <p className="mensagem">{statusMessage}</p>}

      {showQrCode && itemDetails && (
        <div className="qr-print">
          <h4>Etiqueta para colar no dispositivo</h4>
          <QRCode
            value={JSON.stringify({ id: itemDetails.id })}
            size={300}
            level="H"
            includeMargin={true}
          />
          <p><b>{itemDetails.id}</b></p>
          <button onClick={() => window.print()}>🖨 Imprimir QR Code</button>
        </div>
      )}
    </div>
  );
};

export default QrCodeScanner;
