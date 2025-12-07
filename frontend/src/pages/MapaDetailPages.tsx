import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Button, 
  IconButton, 
  Snackbar 
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Download as DownloadIcon } from '@mui/icons-material';

// Importa os nossos tipos, serviços de API e componentes filhos
import { MapaTransporte, QuadroCreate } from '../types/schemas';
import { mapaTransporteService, quadroService } from '../services/api';
import QuadroList from '../components/QuadroList';
import QuadroForm from '../components/QuadroForm';
import FloatingButtom from '../components/FloatingButtom';

const MapaDetailPage: React.FC = () => {
  // Hooks para navegação e para obter o parâmetro da URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const mapaId = id ? parseInt(id) : 0;
  
  // --- LÓGICA DE ESTADO (STATE) ---
  const [mapa, setMapa] = useState<MapaTransporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGerandoRotas, setisGerandoRotas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [isDownloading, setIsDownloading] = useState(false);

  // --- LÓGICA DE DADOS ---

  // Função para buscar os detalhes do mapa, usando 'useCallback' para otimização
  const carregarDetalhes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mapaTransporteService.buscarPorId(mapaId);
      setMapa(data);
    } catch (err) {
      setError('Falha ao carregar os detalhes do Mapa de Transporte.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mapaId]);

  // Hook 'useEffect' para chamar a busca de dados quando a página carrega
  useEffect(() => {
    if (mapaId > 0) {
      carregarDetalhes();
    }
  }, [carregarDetalhes, mapaId]);

  // --- LÓGICA DE EVENTOS (HANDLERS) ---

  // Função chamada pelo formulário quando um novo quadro é criado com sucesso
  const handleQuadroSubmit = async (formData: QuadroCreate) => {
    try {
      // Adicionamos o ID do mapa atual ao payload antes de enviar
      const payload = { ...formData, mapa_transporte_id: mapaId };
      await quadroService.criar(payload);

      setSnackbar({ open: true, message: 'Quadro criado com sucesso!', severity: 'success' });
      setFormOpen(false); // Fecha o formulário
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao criar o quadro.', severity: 'error' });
    } finally {
      carregarDetalhes();
    }
  };

  const handleDeleteQuadro = async (quadroIdToDelete: number) => {
    try {
      await quadroService.apagar(quadroIdToDelete); // Chama a API para apagar
      setSnackbar({ open: true, message: 'Quadro apagado com sucesso!', severity: 'success' });
      carregarDetalhes(); // Recarrega os dados para remover o quadro da lista
    } catch (error: any) {
      const message = error.response?.data?.detail || "Erro ao apagar o quadro.";
      console.error("Erro ao apagar quadro:", error);
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Função para o botão de gerar PDF
  const handleGerarPDF = async () => {
    if (!mapa) return;
    setIsDownloading(true);
    try {
      const response = await mapaTransporteService.gerarPdf(mapa.id);
      
      // Cria um URL temporário para o ficheiro 'blob' recebido
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Cria um link invisível para iniciar o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mapa_consolidado_${mapa.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpa o link e o URL após o download
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao gerar o PDF.', severity: 'error' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGerarRotas = async () => {
    try {
      setisGerandoRotas(true)
      await mapaTransporteService.gerarRotas(mapaId);
    }
    catch(error) {
      setisGerandoRotas(false)
      setSnackbar({ open: true, message: 'Erro ao mapa de transporte.', severity: 'error' });
    } finally {
      setisGerandoRotas(false)
      carregarDetalhes();
    }
  }
  
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
  
  // --- LÓGICA DE VALIDAÇÃO PARA A UI ---

  // Função para verificar se o mapa está "completo"
  const isMapaCompleto = (): boolean => {
    if (!mapa || mapa.quadros.length === 0) {
      return false;
    }
    // Verifica se todos os quadros têm um veículo e pelo menos um passageiro
    return mapa.quadros.every(q => q.passageiros && q.passageiros.length > 0 && q.rota);
  };

  // const podeGerarRotas = (): boolean => {
  //   if (!mapa || mapa.quadros.length === 0) {
  //     return false;
  //   }
  //   return mapa.quadros.every(q => q.passageiros && q.passageiros.length > 0 && q.origem && q.destino);
  // }

  // --- RENDERIZAÇÃO ---
  
  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Container sx={{ py: 3 }}><Alert severity="error">{error}</Alert></Container>;
  if (!mapa) return <Container sx={{ py: 3 }}><Typography>Mapa não encontrado.</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Cabeçalho da Página */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">{mapa.nome}</Typography>
      </Box>

      {/* Botão Principal de Ação */}
      <Button 
        variant="outlined" 
        color="primary"
        disabled={!isMapaCompleto() || isDownloading}
        onClick={handleGerarPDF}
        fullWidth
        startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        sx={{ mb: 4 }}
      >
        Gerar PDF Consolidado do Mapa
      </Button>

      {/* Botão Principal de Ação */}
      {/* <Button 
        variant="outlined" 
        color="primary"
        disabled={!podeGerarRotas()}
        onClick={handleGerarRotas}
        loading={isGerandoRotas}
        fullWidth
        sx={{ mb: 4 }}
      >
        Gerar Rotas de Mapa de Transporte
      </Button> */}

      {/* Título da Lista de Quadros */}
      <Typography variant="h6" component="h2" gutterBottom>
        Quadros do Plano
      </Typography>

      {/* Componente que renderiza a lista de quadros */}
      <QuadroList quadros={mapa.quadros} onDelete={handleDeleteQuadro} />
      
      {/* Botão flutuante para adicionar um novo quadro A ESTE MAPA */}
      <FloatingButtom setOpenForm={() => setFormOpen(true)} />

      {/* O Formulário para criar um novo quadro, renderizado num Modal */}
      <QuadroForm
        open={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleQuadroSubmit}
      />

      {/* Componente para mostrar mensagens de feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default MapaDetailPage;