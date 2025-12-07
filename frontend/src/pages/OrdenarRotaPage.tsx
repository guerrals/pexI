import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Container, Typography, Box, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

import { Quadro, Passageiro } from '../types/schemas';
import { quadroService } from '../services/api';
import { SortableItem } from '../components/SortableItems';

const OrdenarRotaPage: React.FC = () => {
    let { quadro_id } = useParams<{ quadro_id: string }>();
  const navigate = useNavigate();

  const [quadro, setQuadro] = useState<Quadro | null>(null);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configura os sensores para o dnd-kit (rato, toque e teclado)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Carrega os dados do quadro (incluindo os passageiros já associados)
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const quadroData = await quadroService.buscarPorId(Number(quadro_id));
        setQuadro(quadroData);
        // Filtra apenas passageiros NÃO autônomos para a rota
        const passageirosParaRota = quadroData?.passageiros;
        if (passageirosParaRota){
            setPassageiros(passageirosParaRota);
        }
      } catch (err) {
        setError('Falha ao carregar dados do quadro.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [quadro_id]);

  // Função chamada quando o utilizador termina de arrastar
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPassageiros((items) => {
        const oldIndex = items.findIndex(p => p.id === active.id);
        const newIndex = items.findIndex(p => p.id === over.id);
        return arrayMove(items, oldIndex, newIndex); // Reordena o array
      });
    }
  };

  // Função para salvar a nova ordem
  const handleSalvarOrdem = async () => {
    setSaving(true);
    // Extrai apenas os IDs na nova ordem
    const idsOrdenados = passageiros.map(p => p.id);
    
    try {
      // CHAMA A NOVA FUNÇÃO DO BACKEND (que vamos criar)
      await quadroService.salvarOrdemParadas(Number(quadro_id), idsOrdenados);
      alert('Ordem salva com sucesso!');
      navigate(-1);
    } catch (err) {
      setError('Falha ao salvar a nova ordem.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">Ordenar Rota</Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Arraste e solte os passageiros para definir a ordem de recolha. O primeiro da lista será o primeiro a ser recolhido.
      </Typography>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={passageiros.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          {passageiros.map(p => <SortableItem key={p.id} passageiro={p} />)}
        </SortableContext>
      </DndContext>

      <Button 
        variant="contained" 
        size="large" 
        fullWidth 
        sx={{ mt: 3 }}
        onClick={handleSalvarOrdem}
        disabled={saving}
        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
      >
        {saving ? 'A Salvar...' : 'Salvar Ordem'}
      </Button>
    </Container>
  );
};

export default OrdenarRotaPage;