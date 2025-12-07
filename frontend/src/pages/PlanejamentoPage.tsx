import { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Alert, Box, IconButton, Snackbar } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { MapaTransporte } from '../types/schemas';
import { mapaTransporteService } from '../services/api';
import MapaTransporteForm from '../components/MapaTransporteFormPage';
import FloatingButtom from '../components/FloatingButtom';

const PlanejamentoPage = () => {
  const [mapas, setMapas] = useState<MapaTransporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const fetchMapas = async () => {
    try {
      const response = await mapaTransporteService.listar();
      setMapas(response);
    } catch (err) {
      setError('Falha ao carregar os Mapas de Transporte.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMapas();
  }, []);

  const handleSuccess = (novoMapa: MapaTransporte) => {
    setMapas(prev => [novoMapa, ...prev]);
    setSnackbarMessage('Mapa de Transporte criado com sucesso!');
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Container sx={{ py: 3 }}><Alert severity="error">{error}</Alert></Container>;
  console.log("Dados de mapas: ", mapas)
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
          Planejamento de Transportes
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}
        >
          Gerencie os planos de transporte, quadros e regras
        </Typography>
      </Box>
      <List>
        {mapas.map((mapa) => (
            <ListItem
              key={mapa.id}
              divider
              secondaryAction={
                <IconButton edge="end" aria-label="details" component={Link} to={`/planejamento/mapas/${mapa.id}`}>
                  <ArrowForwardIosIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={mapa.nome}
                secondary={`Início: ${new Date(mapa.data_inicio).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}`}
              />
            </ListItem>
          ))
        }
      </List>
      <FloatingButtom setOpenForm={setFormOpen} />

      <MapaTransporteForm
        open={isFormOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleSuccess}
      />

      <Snackbar open={!!snackbarMessage} autoHideDuration={4000} onClose={() => setSnackbarMessage(null)}>
        <Alert onClose={() => setSnackbarMessage(null)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PlanejamentoPage;