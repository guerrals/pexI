import React, { useState } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, Stack, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { MapaTransporte, MapaTransporteCreate } from '../types/schemas';
import { mapaTransporteService } from '../services/api';

// Interface para as propriedades que o componente recebe
interface MapaTransporteFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (novoMapa: MapaTransporte) => void;
}

const MapaTransporteForm: React.FC<MapaTransporteFormProps> = ({ open, onClose, onSuccess }) => {
  // Estado para os dados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [regras, setRegras] = useState('');

  // Estado para controlo da UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    // Limpa o formulário antes de chamar a função do pai para fechar
    setNome('');
    setDescricao('');
    setDataInicio(null);
    setRegras('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nome || !dataInicio) {
      setError('Nome e Data de Início são obrigatórios.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const payload: MapaTransporteCreate = {
        nome,
        descricao: descricao || null,
        data_inicio: dataInicio.toISOString(), // Converte para string ISO 8601
        regras: regras.trim(),
      };

      const novoMapa = await mapaTransporteService.criar(payload);
      onSuccess(novoMapa);
      handleClose();
    } catch (err) {
      setError('Falha ao criar o Mapa de Transporte. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-mapa-form"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 500 },
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          overflow: 'auto',
        }}
      >
        {/* Cabeçalho do modal */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography id="modal-mapa-form" variant="h6" component="h2">
            Novo Mapa de Transporte
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Formulário */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="Nome do Mapa"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoFocus
              disabled={loading}
            />
            <DateTimePicker
              label="Data e Hora de Início"
              value={dataInicio}
              onChange={(newValue) => setDataInicio(newValue)}
              format="dd/MM/yyyy HH:mm"
              ampm={false}
              slotProps={{
                textField: {
                  required: true,
                  fullWidth: true,
                  disabled: loading,
                },
              }}
            />
            <TextField
              fullWidth
              label="Descrição (Opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              multiline
              rows={3}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Regras (uma por linha) (Opcional)"
              value={regras}
              onChange={(e) => setRegras(e.target.value)}
              multiline
              rows={4}
              disabled={loading}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleClose} fullWidth disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <><SaveIcon fontSize="inherit" sx={{mr: 1}} />Salvar</>}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
};

export default MapaTransporteForm;