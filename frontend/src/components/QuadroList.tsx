import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  List,
  Card,
  CardContent,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  DirectionsCar as CarIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Quadro } from '../types/schemas';
import { formatarData } from '../utils/formatTime';
import ConfirmationDialog from './ConfirmationModal';

const obterStatusQuadro = (quadro: Quadro) => {
    if (quadro.rota) return { label: 'Rota Gerada', color: 'success' as const };
    if (quadro.veiculo && quadro?.passageiros) return { label: 'Pronto para Rota', color: 'warning' as const };
    if (quadro.veiculo || quadro?.passageiros) return { label: 'Em Montagem', color: 'info' as const };
    return { label: 'Vazio', color: 'default' as const };
};

// --- O Componente ---
interface QuadroListProps {
  quadros: Quadro[];
  onDelete: (id: number) => void
}

const QuadroList: React.FC<QuadroListProps> = ({ quadros, onDelete }) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quadroToDelete, setQuadroToDelete] = useState<number | null>(null);

  const handleOpenConfirm = (id: number) => {
    setQuadroToDelete(id);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setQuadroToDelete(null);
    setConfirmOpen(false);
  };

  const handleConfirmDelete = () => {
    if (quadroToDelete !== null) {
      onDelete(quadroToDelete); // Chama a função do componente pai
    }
    handleCloseConfirm();
  };

  const handleEditarQuadro = (id: number) => {
    navigate(`/planejamento/quadros/${id}`);
  };

  if (quadros.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
        Nenhum quadro cadastrado para este mapa de transporte. Clique no botão '+' para adicionar o primeiro.
      </Typography>
    );
  }

  return (
    <>
      <List>
        {quadros.map((quadro: Quadro) => {
          const status = obterStatusQuadro(quadro);
          return (
            <Card key={quadro.id} sx={{ mb: 2 }}>
              <CardContent>
                <ListItem disablePadding>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6" component="span">{quadro.nome}</Typography>
                        <Chip label={status.label} color={status.color} size="small" />
                      </Box>
                    }
                    secondary={
                      <Box>
                        {quadro.horario_saida && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Saída: {formatarData(quadro.horario_saida)}
                            </Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {quadro.veiculo ? quadro?.veiculo?.placa : 'Sem veículo'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {quadro.passageiros?.length || 0} passageiro(s)
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton edge="end" aria-label="editar quadro" onClick={() => handleEditarQuadro(quadro.id)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" aria-label="apagar quadro" onClick={() => handleOpenConfirm(quadro.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              </CardContent>
            </Card>
          );
        })}
      </List>
      <ConfirmationDialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Confirmar Deleção"
        description="Tem a certeza de que quer apagar este quadro? Esta ação não pode ser desfeita e irá apagar também a rota associada."
      />
    </>
  );
};

export default QuadroList;