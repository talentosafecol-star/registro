import RegisterForm from '@/components/auth/RegisterForm';
import LoginOTP from '@/components/auth/LoginOTP';
import { useState } from 'react';
import { Box, Container, Typography, Tabs, Tab } from '@mui/material';
import { Security } from '@mui/icons-material';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleSwitchToLogin = () => setActiveTab(0);
  const handleSwitchToRegister = () => setActiveTab(1);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)',
        display: 'flex',
        flexDirection: 'column',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              mb: 2
            }}
          >
            <Security sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 1,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            Reporte de Incidentes
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Plataforma segura para reportar incidentes de seguridad y convivencia
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
                height: 3,
                borderRadius: '3px 3px 0 0'
              },
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: 'white'
                }
              }
            }}
          >
            <Tab label="Iniciar Sesión" />
            <Tab label="Registrarse" />
          </Tabs>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          {activeTab === 0 ? (
            <LoginOTP onSwitchToRegister={handleSwitchToRegister} />
          ) : (
            <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
          )}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © 2025 Sistema de Reporte de Incidentes. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
