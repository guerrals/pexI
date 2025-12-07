import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Divider,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  validateNome, 
  validateRua, 
  validateBairro, 
  validateCidade, 
  validateEstado, 
  validateCep, 
  validateNumero 
} from '../utils/validations';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import { QuadroCreate } from '../types/schemas';
import { cepService } from '../services/cepService';

interface QuadroFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: QuadroCreate) => void;
}

const QuadroForm: React.FC<QuadroFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<QuadroCreate>({
    nome: '',
    horario_saida: '',
    descricao: '',
    origem: {
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      numero: '',
    },
    destino: {
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      numero: '',
    },
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [errors, setErrors] = useState({
    nome: '',
    origem: {
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      numero: '',
    },
    destino: {
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      numero: '',
    }
  });
  const [horarioSaida, setHorarioSaida] = useState<Date | null>(null);

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTimeChange = (newValue: Date | null) => {
    setHorarioSaida(newValue);
  };

  // Validar formulário
  const validateForm = () => {
    const newErrors = {
      nome: validateNome(formData.nome),
      origem: {
        rua: validateRua(formData.origem.rua),
        bairro: validateBairro(formData.origem.bairro),
        cidade: validateCidade(formData.origem.cidade),
        estado: validateEstado(formData.origem.estado),
        cep: validateCep(formData.origem.cep),
        numero: validateNumero(formData.origem.numero),
      },
      destino: {
        rua: validateRua(formData.destino.rua),
        bairro: validateBairro(formData.destino.bairro),
        cidade: validateCidade(formData.destino.cidade),
        estado: validateEstado(formData.destino.estado),
        cep: validateCep(formData.destino.cep),
        numero: validateNumero(formData.destino.numero),
      }
    };

    setErrors(newErrors);
    const semErrosNaOrigem = Object.values(newErrors.origem).every(value => value == "")
    const semErrosNoDestino = Object.values(newErrors.destino).every(value => value == "")
    return !newErrors.nome && semErrosNaOrigem && semErrosNoDestino;
  };

  // Função para buscar CEP com debounce
  const buscarCep = useCallback(async (cep: string, key: string) => {
    if (!cepService.validarCep(cep)) {
      return;
    }

    try {
      setLoadingCep(true);
      const dadosCep = await cepService.buscarCep(cep);
      if (dadosCep) {
        setFormData(prev => ({
          ...prev,
          [key]: {
            ...prev[key == "origem" ? "origem" : "destino"],
            rua: dadosCep.logradouro || '',
            bairro: dadosCep.bairro || '',
            cidade: dadosCep.localidade || '',
            estado: dadosCep.uf || '',
            cep: cepService.formatarCep(cep),
          },
        }))};
        
        setSnackbar({
          open: true,
          message: 'Endereço preenchido automaticamente!',
          severity: 'success',
        });
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setSnackbar({
        open: true,
        message: 'CEP não encontrado ou inválido',
        severity: 'error',
      });
    } finally {
      setLoadingCep(false);
    }
  }, []);

  // Debounce para busca de CEP
  useEffect(() => {
    const cep = formData.origem.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      const timeoutId = setTimeout(() => {
        buscarCep(cep, "origem");
      }, 1000); // Aguarda 1 segundo após parar de digitar

      return () => clearTimeout(timeoutId);
    }
  }, [formData.origem.cep, buscarCep]);

  useEffect(() => {
    const cep = formData.destino.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      const timeoutId = setTimeout(() => {
        buscarCep(cep, "destino");
      }, 1000); // Aguarda 1 segundo após parar de digitar

      return () => clearTimeout(timeoutId);
    }
  }, [formData.destino.cep, buscarCep]);

  // Manipular mudanças nos campos
  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Validar campo em tempo real
    if (field === 'nome') {
      setErrors(prev => ({
        ...prev,
        nome: validateNome(value),
      }));
    }
  };

  // Manipular mudanças nos campos de endereço
  const handleEnderecoChange = (field: keyof QuadroCreate['origem'], key: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = event.target.value;
    
    // Formatar CEP automaticamente
    if (field === 'cep') {
      value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
      if (value.length > 5) {
        value = value.replace(/(\d{5})(\d{3})/, '$1-$2');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [key]: {
        ...prev[key == "origem" ? "origem" : "destino"],
        [field]: value,
      },
    }));
    
    // Validar campo em tempo real
    if (field === 'rua') {
      setErrors(prev => ({
        ...prev,
        rua: validateRua(value),
      }));
    } else if (field === 'bairro') {
      setErrors(prev => ({
        ...prev,
        bairro: validateBairro(value),
      }));
    } else if (field === 'cidade') {
      setErrors(prev => ({
        ...prev,
        cidade: validateCidade(value),
      }));
    } else if (field === 'estado') {
      setErrors(prev => ({
        ...prev,
        estado: validateEstado(value),
      }));
    } else if (field === 'cep') {
      setErrors(prev => ({
        ...prev,
        cep: validateCep(value),
      }));
    } else if (field === 'numero') {
      setErrors(prev => ({
        ...prev,
        numero: validateNumero(value),
      }));
    }
  };

  const createEnderecoFields = (key: string) => {
    let endereco = {
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      numero: "",
    }
    let enderecoErros = {
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      numero: "",
    }
    if (key == "origem") {
      endereco = formData.origem
      enderecoErros = errors.origem
    } else {
      endereco = formData.destino
      enderecoErros = errors.destino
    }
    return (
      <>
        <TextField
          fullWidth
          label="Rua"
          value={endereco.rua}
          onChange={handleEnderecoChange('rua', key)}
          error={!!enderecoErros.rua}
          helperText={enderecoErros.rua}
          required
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Número"
            value={endereco.numero}
            onChange={handleEnderecoChange('numero', key)}
            error={!!enderecoErros.numero}
            helperText={enderecoErros.numero}
            required
          />
          <TextField
            fullWidth
            label="CEP"
            value={endereco.cep}
            onChange={handleEnderecoChange('cep', key)}
            error={!!enderecoErros.cep}
            helperText={enderecoErros.cep || (loadingCep ? 'Buscando endereço...' : 'Digite o CEP para preenchimento automático')}
            required
            placeholder="00000-000"
            InputProps={{
              endAdornment: loadingCep ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : (
                <InputAdornment position="end">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <TextField
          fullWidth
          label="Bairro"
          value={endereco.bairro}
          onChange={handleEnderecoChange('bairro', key)}
          error={!!enderecoErros.bairro}
          helperText={enderecoErros.bairro}
          required
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Cidade"
            value={endereco.cidade}
            onChange={handleEnderecoChange('cidade', key)}
            error={!!enderecoErros.cidade}
            helperText={enderecoErros.cidade}
            required
          />
          <TextField
            fullWidth
            label="Estado"
            value={endereco.estado}
            onChange={handleEnderecoChange('estado', key)}
            error={!!enderecoErros.estado}
            helperText={enderecoErros.estado}
            required
            placeholder="SP"
          />
        </Stack>
      </>
    )
  }

  const clearFormData = () => {
    setFormData({
      nome: '',
      horario_saida: '',
      descricao: '',
      origem: {
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        numero: '',
      },
      destino: {
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        numero: '',
      },
    });
  }

  // Manipular envio do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      const horarioFormatado = horarioSaida ? format(horarioSaida, 'HH:mm') : '';
      onSubmit({
        nome: formData.nome,
        horario_saida: horarioFormatado,
        descricao: formData.descricao || undefined,
        origem: formData.origem,
        destino: formData.destino
      });
      // Limpar formulário após envio
      // clearFormData()
    }
  };

  // Fechar modal e limpar formulário
  const handleClose = () => {
    clearFormData()
    setHorarioSaida(null);
    setErrors({
      nome: '',
      origem: {
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        numero: '',
      },
      destino: {
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        numero: '',
      }
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-quadro-form"
      aria-describedby="modal-quadro-form-description"
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography id="modal-quadro-form" variant="h6" component="h2">
            Novo Quadro
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
              label="Nome do Quadro"
              value={formData.nome}
              onChange={handleChange('nome')}
              error={!!errors.nome}
              helperText={errors.nome}
              required
              autoFocus
              placeholder="Ex: Quadro Manhã - Segunda-feira"
            />

            <TimePicker
              label="Horário de Saída"
              value={horarioSaida}
              onChange={(novoHorario) => handleTimeChange(novoHorario)}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: 'standard',
                  helperText: 'Selecione o horário de saída da base'
                },
              }}
            />

            <TextField
              fullWidth
              label="Descrição (Opcional)"
              value={formData.descricao}
              onChange={handleChange('descricao')}
              multiline
              rows={3}
              placeholder="Informações adicionais sobre este quadro..."
            />

            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Origem
              </Typography>
            </Divider>
            {/* Campos de endereço */}
            {createEnderecoFields("origem")}
            <Divider sx={{ my: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Destino
              </Typography>
            </Divider>
            {createEnderecoFields("destino")}

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
                Criar Quadro
              </Button>
            </Stack>
          </Stack>
        </Box>
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
    </Modal>
  );
};

export default QuadroForm;
