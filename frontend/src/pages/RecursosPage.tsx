import React, { useState } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
} from '@mui/material';
import MotoristasTab from '../components/MotoristasTab';
import VeiculosTab from '../components/VeiculosTab';
import PassageirosTab from '../components/PassageirosTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`recursos-tabpanel-${index}`}
      aria-labelledby={`recursos-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `recursos-tab-${index}`,
    'aria-controls': `recursos-tabpanel-${index}`,
  };
}

const RecursosPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          Cadastro de Recursos
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}
        >
          Gerencie motoristas, veículos e passageiros da sua equipe
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="abas de recursos"
            variant="fullWidth"
          >
            <Tab label="Motoristas" {...a11yProps(0)} />
            <Tab label="Veículos" {...a11yProps(1)} />
            <Tab label="Passageiros" {...a11yProps(2)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <MotoristasTab />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <VeiculosTab />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <PassageirosTab />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default RecursosPage;
