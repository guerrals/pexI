import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Passageiro } from '../types/schemas';

interface SortableItemProps {
  passageiro: Passageiro;
}

export const SortableItem: React.FC<SortableItemProps> = ({ passageiro }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: passageiro.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    cursor: 'grab',
  };

  return (
    <Paper 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      elevation={isDragging ? 4 : 1}
      sx={{ mb: 1 }}
    >
      <ListItem>
        <ListItemIcon sx={{ minWidth: 40 }}>
          <DragHandleIcon />
        </ListItemIcon>
        <ListItemText
          primary={passageiro.nome}
          secondary={passageiro.endereco?.rua || 'Endereço não definido'}
        />
      </ListItem>
    </Paper>
  );
};