import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, CircularProgress, Alert, Card, CardContent, IconButton, Grid, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Map as MapIcon } from '@mui/icons-material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { Rota } from '../types/schemas';
import { rotaService } from '../services/api';
import { formatarData, formatarDatetimeParaHHMM, formatarSegundosParaHHMM } from '../utils/formatTime';

const RotaDetailPage: React.FC = () => {
  const { rota_id } = useParams<{ rota_id: string }>();
  const navigate = useNavigate();
  const rotaId = rota_id ? parseInt(rota_id) : 0;

  const [rota, setRota] = useState<Rota | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (rotaId) {
      const fetchRota = async () => {
        try {
          const data = await rotaService.buscarPorId(rotaId);
          setRota(data);
        } catch (error) {setLoading(false)} 
        finally { setLoading(false); }
      };
      fetchRota();
    }
  }, [rotaId]);

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (!rota) return <Container sx={{ py: 3 }}><Alert severity="error">Rota não encontrada.</Alert></Container>;

  // Acessa o quadro através da relação na rota
  const quadro = rota.quadro;

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Rota Otimizada do Quadro: {quadro.nome}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<MapIcon />}
        component="a" 
        href={rota.google_maps_link || '#'}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!rota.google_maps_link}
        fullWidth
        sx={{ mb: 4 }}
      >
        Abrir Rota no Google Maps
      </Button>

      {/* Cartão de Resumo */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Resumo da Rota</Typography>
          <Grid container spacing={2}>
            <Grid>
                <Typography variant="body2" color="text.secondary">Veículo</Typography>
                <Typography>{quadro.veiculo?.placa} - {quadro.veiculo?.motorista.nome}</Typography>
            </Grid>
            <Grid>
              <Typography variant="body2" color="text.secondary">Duração Estimada</Typography>
              <Typography>{formatarSegundosParaHHMM(rota.duracao_total_estimada)}</Typography> 
            </Grid>
            <Grid>
              <Typography variant="body2" color="text.secondary">Distância Total</Typography>
              <Typography>{rota.distancia_total_estimada_km.toFixed(2)} km</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Itinerário em Linha do Tempo */}
      <Typography variant="h5" component="h2" gutterBottom>Itinerário</Typography>
      <Timeline position="alternate">
        {/* Ponto de Partida */}
        <TimelineItem>
            <TimelineOppositeContent color="text.secondary">{new Date(`1970-01-01T${quadro.horario_saida}`).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</TimelineOppositeContent>
            <TimelineSeparator><TimelineDot color="success" /><TimelineConnector /></TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}><Typography variant="h6">Partida</Typography><Typography>{quadro.origem.rua}, {quadro.origem.numero}</Typography></TimelineContent>
        </TimelineItem>
        
        {/* Paradas de Recolha */}
        {rota.paradas.sort((a, b) => a.ordem - b.ordem).map((parada) => (
          <TimelineItem key={parada.id}>
            <TimelineOppositeContent color="text.secondary">{new Date(`1970-01-01T${parada?.horario_saida}`).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</TimelineOppositeContent>
            <TimelineSeparator><TimelineDot color="primary" /><TimelineConnector /></TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h6" component="span">{parada.ordem}ª Parada: {parada.passageiro.nome}</Typography>
              <Typography variant="body2" color="text.secondary">{parada.passageiro.endereco.rua}, {parada.passageiro.endereco.numero}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}

        {/* Ponto de Chegada */}
        <TimelineItem>
            <TimelineOppositeContent color="text.secondary">{formatarDatetimeParaHHMM(rota.horario_chegada_estimado)}</TimelineOppositeContent>
            <TimelineSeparator><TimelineDot color="error" /></TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}><Typography variant="h6">Destino Final</Typography><Typography>{quadro.destino.rua}, {quadro.destino.numero}</Typography></TimelineContent>
        </TimelineItem>
      </Timeline>
    </Container>
  );
};

export default RotaDetailPage;