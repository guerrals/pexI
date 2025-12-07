import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Fab,
  CircularProgress,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Motorista } from '../types/schemas';
import { motoristaService } from '../services/api';
import MotoristaForm from './MotoristaForm';
import FloatingButtom from './FloatingButtom';

const MotoristasTab: React.FC = () => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Carregar lista de motoristas
  const carregarMotoristas = async () => {
    try {
      setLoading(true);
      const dados = await motoristaService.listar();
      setMotoristas(dados);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar lista de motoristas',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    carregarMotoristas();
  }, []);

  // Função para criar novo motorista
  const handleCriarMotorista = async (motoristaData: { nome: string; contato: string }) => {
    try {
      await motoristaService.criar(motoristaData);
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Motorista criado com sucesso!',
        severity: 'success',
      });
      // Recarregar lista
      carregarMotoristas();
    } catch (error) {
      console.error('Erro ao criar motorista:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar motorista',
        severity: 'error',
      });
    }
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
      ) : motoristas.length === 0 ? (
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
            Nenhum motorista cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique no botão + para adicionar o primeiro motorista
          </Typography>
        </Box>
      ) : (
        <List>
          {motoristas.map((motorista) => (
            <ListItem key={motorista.id} divider>
              <ListItemText
                primary={motorista.nome}
                secondary={`Telefone: ${motorista.contato}`}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Botão de ação flutuante */}
      <FloatingButtom setOpenForm={setOpenForm} />

      {/* Modal do formulário */}
      <MotoristaForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCriarMotorista}
      />

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

export default MotoristasTab;
