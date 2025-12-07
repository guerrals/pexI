import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, Box, Typography, TextField, Button, Stack, IconButton,
  CircularProgress, Alert, Checkbox, FormControlLabel, 
  Divider,
  InputAdornment,
  Snackbar,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
} from '@mui/material';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';

// Importa todos os tipos e serviços necessários
import { Funcao, Passageiro, PassageiroCreate, PassageiroUpdate } from '../types/schemas';
import { passageiroService } from '../services/api';
import { formatarTelefoneCelular, validateBairro, validateCep, validateCidade, validateEstado, validateFuncao, validateNome, validateNumero, validateRua, validateTelefoneCelular } from '../utils/validations';
import { cepService } from '../services/cepService';

// A interface de props agora inclui um passageiro opcional para edição
interface PassageiroFormProps {
  open: boolean;
  onClose: Function
  // A função onSuccess agora pode receber o passageiro criado ou atualizado
  onSuccess: (passageiro: Passageiro) => void;
  passageiroParaEditar?: Passageiro | null;
}

const PassageiroForm: React.FC<PassageiroFormProps> = ({ open, onClose, onSuccess, passageiroParaEditar }) => {
  // Estado para os dados do formulário
  const [formData, setFormData] = useState<PassageiroCreate>({
    nome: '',
    contato: '',
    funcao: Funcao.OUTRO,
    autonomo: false,
    endereco: {
      rua: '', bairro: '', cidade: '', estado: '', cep: '', numero: ''
    }
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldRequestCep, setShouldRequestCep] = useState(false);
  const [errors, setErrors] = useState({
    nome: '',
    contato: '',
    funcao: '',
    rua: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    numero: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Determina se estamos no modo de edição
  const isEditMode = Boolean(passageiroParaEditar);

  useEffect(() => {
    if (isEditMode && passageiroParaEditar) {
      setFormData({
        nome: passageiroParaEditar.nome,
        contato: passageiroParaEditar.contato,
        funcao: passageiroParaEditar.funcao,
        autonomo: passageiroParaEditar.autonomo,
        endereco: passageiroParaEditar.endereco || { rua: '', bairro: '', cidade: '', estado: '', cep: '', numero: '' },
      });
    } else {
      clearForm();
    }
  }, [passageiroParaEditar, open]);

  // Função para buscar CEP com debounce
  const buscarCep = useCallback(async (cep: string) => {
    if (!cepService.validarCep(cep)) {
      return;
    }

    try {
      setLoadingCep(true);
      const dadosCep = await cepService.buscarCep(cep);
      
      if (dadosCep) {
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            rua: dadosCep.logradouro || '',
            bairro: dadosCep.bairro || '',
            cidade: dadosCep.localidade || '',
            estado: dadosCep.uf || '',
            cep: cepService.formatarCep(cep),
          },
        }));
        
        setSnackbar({
          open: true,
          message: 'Endereço preenchido automaticamente!',
          severity: 'success',
        });
      }
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
    const cep = formData.endereco.cep.replace(/\D/g, '');
    if (cep.length === 8 && shouldRequestCep) {
      const timeoutId = setTimeout(() => {
        buscarCep(cep);
      }, 1000); // Aguarda 1 segundo após parar de digitar

      return () => clearTimeout(timeoutId);
    }
  }, [formData.endereco.cep, buscarCep]);

  // Validar formulário
  const validateForm = () => {
    let newErrors = errors
    const enderecoErrors = {
      rua: validateRua(formData.endereco.rua),
      bairro: validateBairro(formData.endereco.bairro),
      cidade: validateCidade(formData.endereco.cidade),
      estado: validateEstado(formData.endereco.estado),
      cep: validateCep(formData.endereco.cep),
      numero: validateNumero(formData.endereco.numero),
    }
    const infoErrors = {
      nome: validateNome(formData.nome),
      contato: validateTelefoneCelular(formData.contato),
      funcao: validateFuncao(formData.funcao),
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      numero: '',

    };
    if (formData.autonomo) {
      newErrors = {...infoErrors}
    } else {
      newErrors = {...infoErrors, ...enderecoErrors}
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const clearForm = () => {
    setFormData({
      nome: '', contato: '', funcao: Funcao.OUTRO, autonomo: false,
      endereco: { rua: '', bairro: '', cidade: '', estado: '', cep: '', numero: '' }
    });
    setErrors(
      {
        nome: '',
        contato: '',
        funcao: '',
        rua: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        numero: '',
      }
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const valor = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: valor }));

    // Validar campo em tempo real
    if (name === 'nome') {
      setErrors(prev => ({
        ...prev,
        nome: validateNome(value),
      }));
    } else if (name === 'contato') {
      const novoContato = formatarTelefoneCelular(value);
      setFormData(prev => ({
        ...prev,
        contato: novoContato,
      }));
      setErrors(prev => ({
        ...prev,
        contato: validateTelefoneCelular(novoContato),
      }));
    }
  };

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'cep') setShouldRequestCep(true)
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [name]: value }
    }));
  };

  const handleClose = () => {
    clearForm();
    onClose()
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    if (validateForm()) {
      try {
        let passageiroResultante: Passageiro;

        // LÓGICA CONDICIONAL: ATUALIZAR OU CRIAR
        if (isEditMode && passageiroParaEditar) {
          // Modo de Edição
          const payload: PassageiroUpdate = {
            ...formData,
            funcao: formData.funcao as Funcao, // Garante o tipo correto para funcao
            endereco: formData.autonomo ? undefined : formData.endereco,
          };
          passageiroResultante = await passageiroService.atualizar(passageiroParaEditar.id, payload);
        } else {
          // Modo de Criação
          const payload: PassageiroCreate = {
            ...formData,
            funcao: formData.funcao as any,
            ...(formData.autonomo ? {} : { endereco: formData.endereco }),
          };
          passageiroResultante = await passageiroService.criar(payload);
        }

        onSuccess(passageiroResultante);
        handleClose();

      } catch (err) {
        console.log(err)
        setSnackbar({
          open: true,
          message: `Erro ao criar passageiro: ${err}`,
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    } else {
      console.log(errors)
      Object.values(errors).forEach(error => setSnackbar({
        open: true,
        message: `Erro ao criar passageiro: ${error}`,
        severity: 'error',
      }))
      setLoading(false);
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const funcoes = Object.values(Funcao);

  return (
    <Modal 
        open={open} 
        onClose={handleClose} 
        aria-labelledby="modal-passageiro-form"
        aria-describedby="modal-passageiro-form-description"
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
        }}>
        <Box 
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
            }}
        >
        <Typography id="modal-passageiro-form" variant="h6" component="h2">
          {isEditMode ? 'Editar Passageiro' : 'Novo Passageiro'}
        </Typography>
        <IconButton onClick={handleClose} size='small'><CloseIcon/></IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField 
              name="nome" 
              label="Nome"  
              error={!!errors.nome}
              helperText={errors.nome} 
              value={formData.nome} 
              onChange={handleChange} 
              required 
              autoFocus
            />
            <TextField 
              name="contato" 
              label="Contato" 
              value={formData.contato} 
              onChange={handleChange} 
              error={!!errors.contato}
              helperText={errors.contato}
              placeholder="(11) 99999-9999"
              required 
              inputProps={{ maxLength: 15 }}
            />
            <FormControl fullWidth required error={!!errors.funcao}>
              <InputLabel id="funcao-select-label">Função</InputLabel>
              <Select
                labelId="funcao-select-label"
                value={formData.funcao}
                label="Função"
                name="funcao"
                onChange={(event) => {
                  const value = event.target.value;
                  setFormData(prev => ({ ...prev, funcao: value }))
                }}
              >
                {funcoes.map((funcao) => (
                  <MenuItem key={funcao} value={funcao}>
                    {funcao}
                  </MenuItem>
                ))}
              </Select>
              {errors.funcao && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {errors.funcao}
                </Typography>
              )}
            </FormControl>


            <FormControlLabel
              control={
                <Checkbox name="autonomo" checked={formData.autonomo} onChange={handleChange} />
              }
              label="Passageiro com veículo próprio (autônomo)"
            />

            {!formData.autonomo && (
              <Box>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Endereço
                  </Typography>
                </Divider>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Rua"
                    name="rua"
                    value={formData.endereco.rua}
                    onChange={handleEnderecoChange}
                    error={!!errors.rua}
                    helperText={errors.rua}
                    required
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Número"
                      name="numero"
                      value={formData.endereco.numero}
                      onChange={handleEnderecoChange}
                      error={!!errors.numero}
                      helperText={errors.numero}
                      required
                    />
                    <TextField
                      fullWidth
                      label="CEP"
                      name="cep"
                      value={formData.endereco.cep}
                      onChange={handleEnderecoChange}
                      error={!!errors.cep}
                      helperText={errors.cep || (loadingCep ? 'Buscando endereço...' : 'Digite o CEP para preenchimento automático')}
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
                    name="bairro"
                    value={formData.endereco.bairro}
                    onChange={handleEnderecoChange}
                    error={!!errors.bairro}
                    helperText={errors.bairro}
                    required
                  />
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      label="Cidade"
                      name="cidade"
                      value={formData.endereco.cidade}
                      onChange={handleEnderecoChange}
                      error={!!errors.cidade}
                      helperText={errors.cidade}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Estado"
                      name="estado"
                      value={formData.endereco.estado}
                      onChange={handleEnderecoChange}
                      error={!!errors.estado}
                      helperText={errors.estado}
                      required
                      placeholder="SP"
                    />
                  </Stack>
                </Stack>
              </Box>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleClose} fullWidth>Cancelar</Button>
              <Button type="submit" variant="contained" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Salvar'}
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
}

export default PassageiroForm;