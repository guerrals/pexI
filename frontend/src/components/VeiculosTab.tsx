import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Alert,
  Snackbar,
  Modal,
  TextField,
  Button,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Veiculo, VeiculoCreate, Motorista } from '../types/schemas';
import { veiculoService, motoristaService } from '../services/api';
import { validatePlaca, validateModelo, validateCor, validateMotoristaId } from '../utils/validations';
import FloatingButtom from './FloatingButtom';

const VeiculosTab: React.FC = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMotoristas, setLoadingMotoristas] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Estado do formulário
  const [formData, setFormData] = useState<VeiculoCreate>({
    placa: '',
    modelo: '',
    cor: '',
    motorista_id: 0,
  });
  const [errors, setErrors] = useState({
    placa: '',
    modelo: '',
    cor: '',
    motorista_id: '',
  });

  // Carregar lista de veículos
  const carregarVeiculos = async () => {
    try {
      setLoading(true);
      const dados = await veiculoService.listar();
      setVeiculos(dados);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar lista de veículos',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar lista de motoristas para o select
  const carregarMotoristas = async () => {
    try {
      setLoadingMotoristas(true);
      const motoristasDisponiveis = await motoristaService.listar();
      setMotoristas(motoristasDisponiveis.filter(motorista => motorista.veiculo_id === null));
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar lista de motoristas',
        severity: 'error',
      });
    } finally {
      setLoadingMotoristas(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    carregarVeiculos();
  }, []);

  // Carregar motoristas quando abrir o formulário
  useEffect(() => {
    if (openForm) {
      carregarMotoristas();
    }
  }, [openForm]);

  // Validar formulário
  const validateForm = () => {
    const newErrors = {
      placa: validatePlaca(formData.placa),
      modelo: validateModelo(formData.modelo),
      cor: validateCor(formData.cor),
      motorista_id: validateMotoristaId(formData.motorista_id),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Manipular mudanças nos campos
  const handleChange = (field: keyof VeiculoCreate) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'motorista_id' ? Number(value) : value,
    }));
    
    // Validar campo em tempo real
    if (field === 'placa') {
      setErrors(prev => ({
        ...prev,
        placa: validatePlaca(value),
      }));
    } else if (field === 'modelo') {
      setErrors(prev => ({
        ...prev,
        modelo: validateModelo(value),
      }));
    } else if (field === 'cor') {
      setErrors(prev => ({
        ...prev,
        cor: validateCor(value),
      }));
    } else if (field === 'motorista_id') {
      setErrors(prev => ({
        ...prev,
        motorista_id: validateMotoristaId(Number(value)),
      }));
    }
  };

  // Manipular envio do formulário
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      try {
        await veiculoService.criar(formData);
        setOpenForm(false);
        setSnackbar({
          open: true,
          message: 'Veículo criado com sucesso!',
          severity: 'success',
        });
        // Limpar formulário
        setFormData({
          placa: '',
          modelo: '',
          cor: '',
          motorista_id: 0,
        });
        // Recarregar lista
        carregarVeiculos();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: `Erro ao criar veículo: ${error?.response?.data?.detail}`,
          severity: 'error',
        });
      }
    }
  };

  // Fechar modal e limpar formulário
  const handleClose = () => {
    setFormData({
      placa: '',
      modelo: '',
      cor: '',
      motorista_id: 0,
    });
    setErrors({
      placa: '',
      modelo: '',
      cor: '',
      motorista_id: '',
    });
    setOpenForm(false);
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : veiculos.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum veículo cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique no botão + para adicionar o primeiro veículo
          </Typography>
        </Box>
      ) : (
        <List>
          {veiculos.map((veiculo) => (
            <ListItem key={veiculo.id} divider>
              <ListItemText
                primary={`${veiculo.modelo} - ${veiculo.placa}`}
                secondary={`Cor: ${veiculo.cor} | Motorista: ${veiculo.motorista.nome}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Botão de ação flutuante */}
      <FloatingButtom setOpenForm={setOpenForm} />

      {/* Modal do formulário */}
      <Modal
        open={openForm}
        onClose={handleClose}
        aria-labelledby="modal-veiculo-form"
        aria-describedby="modal-veiculo-form-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 400 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          {/* Cabeçalho do modal */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography id="modal-veiculo-form" variant="h6" component="h2">
              Novo Veículo
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Formulário */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 2 }}
          >
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Placa"
                value={formData.placa}
                onChange={handleChange('placa')}
                error={!!errors.placa}
                helperText={errors.placa}
                required
                autoFocus
                placeholder="ABC-1234"
              />

              <TextField
                fullWidth
                label="Modelo"
                value={formData.modelo}
                onChange={handleChange('modelo')}
                error={!!errors.modelo}
                helperText={errors.modelo}
                required
                placeholder="Ex: Ford Transit"
              />

              <TextField
                fullWidth
                label="Cor"
                value={formData.cor}
                onChange={handleChange('cor')}
                error={!!errors.cor}
                helperText={errors.cor}
                required
                placeholder="Ex: Branco"
              />

              <FormControl fullWidth required error={!!errors.motorista_id}>
                <InputLabel id="motorista-select-label">Motorista</InputLabel>
                <Select
                  labelId="motorista-select-label"
                  value={formData.motorista_id || ''}
                  label="Motorista"
                  onChange={handleChange('motorista_id')}
                  disabled={loadingMotoristas}
                >
                  {motoristas.map((motorista) => (
                    <MenuItem key={motorista.id} value={motorista.id}>
                      {motorista.nome}
                    </MenuItem>
                  ))}
                </Select>
                {errors.motorista_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.motorista_id}
                  </Typography>
                )}
              </FormControl>

              {/* Botões */}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                >
                  Salvar
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VeiculosTab;
