import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RecursosPage from './pages/RecursosPage';
import MontagemQuadroPage from './pages/MontagemQuadroPage';
import RotaDetailPage from './pages/RotaDetailPage';
import AppBottomNavigation from './components/AppBottomNavigation';
import { Box } from '@mui/material';
import PlanejamentoPage from './pages/PlanejamentoPage';
import MapaDetailPage from './pages/MapaDetailPages';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { URL_MAPA_TRANSPORTE_DETAIL, URL_MAPA_TRANSPORTE_LIST, URL_ORDENAR_ROTA, URL_QUADRO_DETAIL, URL_RECURSOS, URL_ROTA_DETAIL } from './services/urls';
import OrdenarRotaPage from './pages/OrdenarRotaPage';

// Configuração do tema Material-UI baseado na paleta da imagem
const theme = createTheme({
  palette: {
    primary: {
      main: '#B71C1C', // Vermelho principal (#B71C1C)
      dark: '#8B0000',
      light: '#E57373',
      contrastText: '#FFD700', // Dourado para contraste
    },
    secondary: {
      main: '#FFD700', // Dourado (#FFD700)
      dark: '#FF8F00',
      light: '#FFF176',
      contrastText: '#B71C1C',
    },
    error: {
      main: '#FF0000', // Vermelho vibrante para destaques (#FF0000)
    },
    info: {
      main: '#0000EE', // Azul para links (#0000EE)
    },
    background: {
      default: '#F5F5F5', // Cinza claro para fundo (#F5F5F5)
      paper: '#FFFFFF', // Branco para papel (#FFFFFF)
    },
    text: {
      primary: '#212121', // Cinza escuro para texto principal (#212121)
      secondary: '#757575',
    },
    action: {
      hover: '#F5F5F5', // Cinza claro para hover (#F5F5F5)
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#B71C1C',
    },
    h6: {
      fontWeight: 600,
      color: '#212121',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#B71C1C',
          color: '#FFD700',
          '&:hover': {
            backgroundColor: '#8B0000',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFD700',
          color: '#B71C1C',
          '&:hover': {
            backgroundColor: '#FF8F00',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#B71C1C',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#212121',
          fontWeight: 600,
          '&.Mui-selected': {
            color: '#B71C1C',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 2px 4px rgba(183, 28, 28, 0.1)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          backgroundColor: '#B71C1C',
          color: '#FFD700',
          '&:hover': {
            backgroundColor: '#8B0000',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#B71C1C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#B71C1C',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#B71C1C',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#B71C1C',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        standardSuccess: {
          backgroundColor: '#E8F5E8',
          color: '#2E7D32',
        },
        standardError: {
          backgroundColor: '#FFEBEE',
          color: '#C62828',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <CssBaseline />
        <Router>
          <Box sx={{
            pb: { xs: '70px' } 
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/planejamento" replace />} />
              <Route path={URL_MAPA_TRANSPORTE_LIST} element={<PlanejamentoPage />} />
              <Route path={URL_MAPA_TRANSPORTE_DETAIL} element={<MapaDetailPage />} />
              <Route path={URL_QUADRO_DETAIL} element={<MontagemQuadroPage />} />
              <Route path={URL_ROTA_DETAIL} element={<RotaDetailPage />} />
              <Route path={URL_RECURSOS} element={<RecursosPage />} />
              <Route path={URL_ORDENAR_ROTA} element={<OrdenarRotaPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
          <AppBottomNavigation />
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
