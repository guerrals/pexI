import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const AppBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar valor baseado na rota atual
  const getCurrentValue = () => {
    if (location.pathname.startsWith('/recursos')) return 0;
    if (location.pathname.startsWith('/planejamento')) return 1;  
    if (location.pathname.startsWith('/quadros')) return 1; // Quadros também usa Planejamento
    return 0;
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/recursos');
        break;
      case 1:
        navigate('/planejamento');
        break;
      default:
        navigate('/recursos');
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        display: { xs: 'block' },
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Recursos"
          icon={<PeopleIcon />}
        />
        <BottomNavigationAction
          label="Planejamento"
          icon={<AssignmentIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default AppBottomNavigation;
