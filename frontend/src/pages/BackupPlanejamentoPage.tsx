import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  DirectionsCar as CarIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Quadro, QuadroCreate } from '../types/schemas';
import { quadroService } from '../services/api';
import QuadroForm from '../components/QuadroForm';
import FloatingButtom from '../components/FloatingButtom';

const PlanejamentoPage: React.FC = () => {
  const navigate = useNavigate();
  const [quadros, setQuadros] = useState<Quadro[]>([]);
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

  // Carregar lista de quadros
  const carregarQuadros = async () => {
    try {
      setLoading(true);
      const dados = await quadroService.listar();
      setQuadros(dados);
    } catch (error) {
      console.error('Erro ao carregar quadros:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar lista de quadros',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    carregarQuadros();
  }, []);

  // Função para criar novo quadro
  const handleCriarQuadro = async (quadroData: QuadroCreate) => {
    try {
      await quadroService.criar(quadroData);
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Quadro criado com sucesso!',
        severity: 'success',
      });
      // Recarregar lista
      carregarQuadros();
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar quadro',
        severity: 'error',
      });
    }
  };

  // Função para navegar para montagem do quadro
  const handleEditarQuadro = (quadroId: number) => {
    navigate(`/quadros/${quadroId}`);
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Formatar data para exibição
  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Obter status do quadro
  const obterStatusQuadro = (quadro: Quadro) => {
    if (quadro.rota) {
      return { label: 'Rota Gerada', color: 'success' as const };
    } else if (quadro.veiculo && quadro.passageiros) {
      return { label: 'Pronto para Rota', color: 'warning' as const };
    } else if (quadro.veiculo || quadro.passageiros) {
      return { label: 'Em Montagem', color: 'info' as const };
    } else {
      return { label: 'Vazio', color: 'default' as const };
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            color: 'primary.main',
            fontWeight: 700,
            textAlign: 'center',
            mb: 2
          }}
        >
          Planejamento de Quadros
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}
        >
          Gerencie os quadros de transporte e otimize as rotas
        </Typography>
      </Box>

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
      ) : quadros.length === 0 ? (
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
            Nenhum quadro criado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique no botão + para criar o primeiro quadro
          </Typography>
        </Box>
      ) : (
        <List>
          {quadros.map((quadro) => {
            const status = obterStatusQuadro(quadro);
            return (
              <Card key={quadro.id} sx={{ mb: 2 }}>
                <CardContent>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="span">
                            {quadro.nome}
                          </Typography>
                          <Chip 
                            label={status.label} 
                            color={status.color} 
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatarData(quadro.horario_saida)}
                            </Typography>
                          </Box>
                          
                          {quadro.descricao && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {quadro.descricao}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CarIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {quadro.veiculo ? 'Veículo selecionado' : 'Sem veículo'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PeopleIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {quadro?.passageiros?.length ?? 0} passageiro(s)
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        
                        edge="end"
                        aria-label="editar quadro"
                        onClick={() => handleEditarQuadro(quadro.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </CardContent>
              </Card>
            );
          })}
        </List>
      )}

      {/* Botão de ação flutuante */}
      <FloatingButtom setOpenForm={setOpenForm} />

      {/* Modal do formulário */}
      <QuadroForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleCriarQuadro}
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
    </Container>
  );
};

export default PlanejamentoPage;
