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
  IconButton,
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Passageiro } from '../types/schemas';
import { passageiroService } from '../services/api';

import FloatingButtom from './FloatingButtom';
import PassageiroForm from './PassageiroForm';

const PassageirosTab: React.FC = () => {
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [passageiroParaEditar, setPassageiroParaEditar] = useState<Passageiro | null>(null);
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

  // Carregar lista de passageiros
  const carregarPassageiros = async () => {
    try {
      setLoading(true);
      const dados = await passageiroService.listar();
      setPassageiros(dados);
    } catch (error) {
      console.error('Erro ao carregar passageiros:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar lista de passageiros',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    carregarPassageiros();
  }, []);

  // Abre o formulário para criar um novo
  const handleAbrirFormCriacao = () => {
    setPassageiroParaEditar(null); // Garante que não há dados de edição
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setPassageiroParaEditar(null);
  }

  const handleAbrirFormEdicao = (passageiro: Passageiro) => {
    setPassageiroParaEditar(passageiro);
    setOpenForm(true);
  };

  // Função chamada quando o formulário salva com sucesso
  const handleFormSuccess = (passageiroAtualizado: Passageiro) => {
    // Verifica se o passageiro já existe na lista (caso de edição)
    const existe = passageiros.some(p => p.id === passageiroAtualizado.id);
    if (existe) {
      // Atualiza o passageiro na lista
      setPassageiros(prev => prev.map(p => p.id === passageiroAtualizado.id ? passageiroAtualizado : p));
    } else {
      // Adiciona o novo passageiro à lista
      setPassageiros(prev => [passageiroAtualizado, ...prev]);
    }
  };
    
  const handleApagar = async (passageiroId: number) => {
      if (window.confirm("Tem a certeza de que quer apagar este passageiro? Esta ação não pode ser desfeita.")) {
        try {
          await passageiroService.apagar(passageiroId);
          setPassageiros(prev => prev.filter(p => p.id !== passageiroId));
          // (Mostrar snackbar de sucesso)
        } catch (error: any) {
          // (Mostrar snackbar de erro com a mensagem da API)
          const errorMessage = error.response?.data?.detail || "Erro ao apagar passageiro.";
          console.error(errorMessage);
        }
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
      ) : passageiros.length === 0 ? (
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
            Nenhum passageiro cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique no botão + para adicionar o primeiro passageiro
          </Typography>
        </Box>
      ) : (
        <List>
          {passageiros.map((passageiro) => (
            <ListItem key={passageiro.id} divider>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
                      {passageiro.nome}
                    </Typography>
                    <IconButton edge="end" aria-label="editar" onClick={() => handleAbrirFormEdicao(passageiro)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="apagar" onClick={() => handleApagar(passageiro.id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Box>}
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" color="text.secondary">
                      Telefone: {passageiro.contato}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Função: {passageiro.funcao}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Endereço: {passageiro.endereco?.rua &&
                      `${passageiro.endereco.rua}, ${passageiro.endereco.numero} - ${passageiro.endereco.bairro}, ${passageiro.endereco.cidade}/${passageiro.endereco.estado}`}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Botão de ação flutuante */}
      <FloatingButtom setOpenForm={handleAbrirFormCriacao} />

      <PassageiroForm
        open={openForm}
        onClose={closeForm}
        onSuccess={handleFormSuccess}
        passageiroParaEditar={passageiroParaEditar}
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

export default PassageirosTab;
