import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Stack,
  List,
  ListItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  DirectionsCar as CarIcon,
  People as PeopleIcon,
  Route as RouteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { Quadro, QuadroAssociacao, Veiculo as VeiculoType, Passageiro as PassageiroType } from '../types/schemas';
import { quadroService, veiculoService, passageiroService } from '../services/api';
import { formatarData } from '../utils/formatTime';

const MontagemQuadroPage: React.FC = () => {
  let { quadro_id } = useParams<{ quadro_id: string }>();
  const navigate = useNavigate();

  const [quadro, setQuadro] = useState<Quadro | null>(null);
  const [veiculos, setVeiculos] = useState<VeiculoType[]>([]);
  const [passageiros, setPassageiros] = useState<PassageiroType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssociacao, setLoadingAssociacao] = useState(false);
  const [loadingRota, setLoadingRota] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Estados para seleção
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<number | null>(null);
  const [passageirosSelecionados, setPassageirosSelecionados] = useState<number[]>([]);
  const podeGerarRota = quadro?.passageiros && quadro.passageiros.length > 0;
  const rotaExistente = quadro?.rota;

  // Carregar dados do quadro e recursos
  const carregarDados = async () => {
    try {
      if (quadro_id === undefined)
        quadro_id = "0"
      // Carregar quadro, veículos e passageiros em paralelo
      const [quadroData, veiculosData, passageirosData] = await Promise.all([
        quadroService.buscarPorId(parseInt(quadro_id)),
        veiculoService.listar(),
        passageiroService.listar(),
      ]);

      setQuadro(quadroData);
      setVeiculos(veiculosData.filter(veiculo => veiculo.quadro_id == null));
      setPassageiros(passageirosData);

      // Definir seleções atuais do quadro
      if (quadroData.veiculo) {
        setVeiculoSelecionado(quadroData.veiculo.id);
      }
      if (quadroData.passageiros) {
        setPassageirosSelecionados(quadroData.passageiros.map(passageiro => passageiro.id));
      }
      setLoading(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados do quadro',
        severity: 'error',
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    if (quadro_id !== undefined) {
      carregarDados();
    }
  }, [quadro_id]);


  const handleGerarRota = async () => {
    try {
      setLoadingRota(true);
      // Chama o serviço da API que faz a requisição POST /quadros/{quadroId}/gerar_rota/
      await quadroService.gerarRota(quadro ? quadro.id : 0);
      
      setSnackbar({
        open: true,
        message: 'Rota otimizada gerada com sucesso!',
        severity: 'success',
      });
  
      // Navega para a página de detalhes da nova rota
      // navigate(`/rotas/${rotaGerada.id}`);
  
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao gerar rota otimizada. Verifique os dados e tente novamente.',
        severity: 'error',
      });
    } finally {
      setLoadingRota(false); // Desativa o spinner no botão
    }
  };

  // Manipular seleção de veículo
  const handleVeiculoChange = (event: any) => {
    setVeiculoSelecionado(event.target.value);
  };

  // Manipular seleção de passageiros
  const handlePassageiroToggle = (passageiroId: number) => {
    setPassageirosSelecionados(prev => 
      prev.includes(passageiroId)
        ? prev.filter(id => id !== passageiroId)
        : [...prev, passageiroId]
    );
  };

  // Salvar associações
  const handleSalvarAssociacoes = async () => {
    if (passageirosSelecionados.length === 0) {
      setSnackbar({
        open: true,
        message: 'Selecione pelo menos um passageiro',
        severity: 'error',
      });
      return;
    }

    try {
      setLoadingAssociacao(true);
      const associacao: QuadroAssociacao = {
        veiculo_id: veiculoSelecionado,
        passageiros_ids: passageirosSelecionados,
      };
      
      if (quadro_id === undefined)
        quadro_id = "0"
      const quadroAtualizado = await quadroService.associarRecursos(quadro_id, associacao);
      setQuadro(quadroAtualizado);

      setSnackbar({
        open: true,
        message: 'Recursos associados com sucesso!',
        severity: 'success',
      });
      back()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao salvar associações',
        severity: 'error',
      });
    } finally {
      setLoadingAssociacao(false);
    }
  };

  // Fechar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOrdenarRotaClick = () => {
    navigate(`/planejamento/quadros/${quadro_id}/ordenar`);
  };

  const renderChipStatus = (length: number) => {
    let label = ""
    let color = ""
    let variant = ""
    if (length > 0) {
      label = `${length} Passageiro(s)`
      color = 'success'
      variant = "filled"
    }
    else {
      label = '0 Passageiro(s)'
      color = "default"
      variant = "outlined"
    }
    return {label, color, variant}
  }

  const handleNavigateRota = () => {
    if (quadro?.rota) navigate(`/planejamento/rota/${rotaExistente?.id}`)
  }
  
  const renderQuadroStatus = (quadro: Quadro) => {
    const chipStatus = renderChipStatus(quadro?.passageiros?.length ?? 0)
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status do Quadro
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            useFlexGap 
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Chip
              icon={<CarIcon />}
              label={quadro.veiculo ? `${quadro.veiculo.placa} | ${quadro.veiculo.motorista.nome}` : 'Sem Veículo'}
              color={quadro.veiculo ? 'success' : 'default'}
              variant={quadro.veiculo ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<PeopleIcon />}
              label={chipStatus.label}
              color={chipStatus.color as "success" | "default"}
              variant={chipStatus.variant as "filled" | "outlined"}
            />
            <Chip
              icon={<RouteIcon />}  
              label={quadro.rota ? 'Rota Gerada' : 'Sem Rota'}
              color={quadro.rota ? 'success' : 'default'}
              variant={quadro.rota ? 'filled' : 'outlined'}
              onClick={handleNavigateRota}
            />
          </Stack>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!quadro) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">
          Quadro não encontrado
        </Alert>
      </Container>
    );
  }

  const back = () => navigate(-1)

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={back}
            variant="outlined"
          >
            Voltar
          </Button>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            {quadro.nome}
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Horário: {formatarData(quadro.horario_saida)}
        </Typography>
        
        {quadro.descricao && (
          <Typography variant="body2" color="text.secondary">
            {quadro.descricao}
          </Typography>
        )}
        {/* {podeGerarRota && (
          <Button
            variant="text"color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleGerarRota}
            disabled={loadingRota}
            size="medium"
            sx={{ mt: 2 }}
          >
            {loadingRota ? <CircularProgress size={20} /> : 'Gerar Rota Otimizada'}
          </Button>
        )} */}
      </Box>

      {/* Status do Quadro */}
      {renderQuadroStatus(quadro)}

      {/* Seleção de Veículo */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selecionar Veículo sem Quadro
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="veiculo-select-label">Veículo</InputLabel>
            <Select
              labelId="veiculo-select-label"
              value={veiculoSelecionado}
              label="Veículo"
              onChange={handleVeiculoChange}
            >
              {veiculos.map((veiculo) => (
                <MenuItem key={veiculo.id} value={veiculo.id}>
                  {veiculo.placa} - {veiculo.modelo} ({veiculo.cor}) - {veiculo.motorista.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Seleção de Passageiros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Selecionar Passageiros sem Quadro
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecione os passageiros que farão parte deste quadro:
          </Typography>
          
          <List>
            {passageiros.map((passageiro) => (
              <ListItem key={passageiro.id} disablePadding>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={passageirosSelecionados.includes(passageiro.id)}
                      onChange={() => handlePassageiroToggle(passageiro.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1">
                        {passageiro.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {passageiro.funcao} • {passageiro.endereco ? `${passageiro.endereco.cidade}/${passageiro.endereco.estado}` : ''}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSalvarAssociacoes}
          disabled={loadingAssociacao || passageirosSelecionados.length === 0}
          size="large"
        >
          {loadingAssociacao ? <CircularProgress size={20} /> : 'Salvar Associações'}
        </Button>

        {/* {rotaExistente && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleNavigateRota}
          >
            Ver Rota Gerada
          </Button>
        )} */}
        {quadro.passageiros && (
            <Button
            variant="outlined"
            color="primary"
            startIcon={<RouteIcon />} // Ícone atualizado
            onClick={handleOrdenarRotaClick} // Função atualizada
            size="large"
          >
            Definir Ordem de Recolha
          </Button>
        )}
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
    </Container>
  );
};

export default MontagemQuadroPage;
