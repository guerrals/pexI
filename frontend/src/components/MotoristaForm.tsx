import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { validateNome, validateTelefoneCelular, formatarTelefoneCelular } from '../utils/validations';

interface MotoristaFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { nome: string; contato: string }) => void;
}

const MotoristaForm: React.FC<MotoristaFormProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    contato: '',
  });
  const [errors, setErrors] = useState({
    nome: '',
    contato: '',
  });

  // Validar formulário
  const validateForm = () => {
    const newErrors = {
      nome: validateNome(formData.nome),
      contato: validateTelefoneCelular(formData.contato),
    };

    setErrors(newErrors);
    return !newErrors.nome && !newErrors.contato;
  };

  // Manipular mudanças nos campos
  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value;
    
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
    } else if (field === 'contato') {
      value = formatarTelefoneCelular(value);
      setErrors(prev => ({
        ...prev,
        contato: validateTelefoneCelular(value),
      }));
    }
  };

  // Manipular envio do formulário
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      // Limpar formulário após envio
      setFormData({
        nome: '',
        contato: '',
      });
    }
  };

  // Fechar modal e limpar formulário
  const handleClose = () => {
    setFormData({
      nome: '',
      contato: '',
    });
    setErrors({
      nome: '',
      contato: '',
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-motorista-form"
      aria-describedby="modal-motorista-form-description"
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
          <Typography id="modal-motorista-form" variant="h6" component="h2">
            Novo Motorista
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
              label="Nome"
              value={formData.nome}
              onChange={handleChange('nome')}
              error={!!errors.nome}
              helperText={errors.nome}
              required
              autoFocus
            />

            <TextField
              fullWidth
              label="Contato"
              value={formData.contato}
              onChange={handleChange('contato')}
              error={!!errors.contato}
              helperText={errors.contato}
              required
              placeholder="(11) 99999-9999"
              InputProps={{
                inputProps: { 
                  maxLength: 15
                }
              }}
            />

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
  );
};

export default MotoristaForm;
