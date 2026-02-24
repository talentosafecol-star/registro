'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Security,
  Notifications,
  History,
  Logout,
  Edit,
  Check,
  Close,
  Shield,
  AccessTime,
  DeviceHub
} from '@mui/icons-material';
import { authService } from '@/services/auth/authService';
import { useAuth } from '@/context/AuthContext';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  emailVerified: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'otp_verification';
  device: string;
  location: string;
  timestamp: string;
  status: 'success' | 'failed';
}

interface UserProfileProps {
  onLogout?: () => void;
}

export default function UserProfile({ onLogout }: UserProfileProps) {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    incidents: true,
    updates: false
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
    loadSecurityEvents();
  }, [user]);

  const loadSecurityEvents = async () => {
    setIsLoading(true);
    try {
      const events = await authService.getSecurityEvents();
      setSecurityEvents(events);
    } catch (error) {
      console.error('Error loading);
    } finally {
      setIsLoading(false);
    security events:', error }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await authService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      if (result.success) {
        await refreshUser();
        setSuccessMessage('Perfil actualizado exitosamente');
        setIsEditing(false);
      } else {
        setErrorMessage(result.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      setErrorMessage('Error de conexión. Por favor, intenta más tarde.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await authService.logout();
      onLogout?.();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <Login />;
      case 'password_change':
        return <Lock />;
      case 'otp_verification':
        return <Security />;
      default:
        return <Shield />;
    }
  };

  const getEventLabel = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return 'Inicio de sesión';
      case 'password_change':
        return 'Cambio de contraseña';
      case 'otp_verification':
        return 'Verificación OTP';
      default:
        return 'Evento de seguridad';
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            p: 4,
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: '2.5rem',
                fontWeight: 700,
                border: '4px solid white',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Shield fontSize="small" />
                <Typography variant="body2">
                  Cuenta verificada
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Información Personal
            </Typography>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                sx={{ textTransform: 'none' }}
              >
                Editar
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  color="success"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? <CircularProgress size={20} /> : <Check />}
                </IconButton>
                <IconButton
                  color="error"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <Close />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Person color="action" />
              <TextField
                name="name"
                label="Nombre Completo"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                variant={isEditing ? 'outlined' : 'filled'}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Email color="action" />
              <TextField
                label="Correo Electrónico"
                value={user.email}
                disabled
                variant="filled"
                size="small"
                sx={{ flex: 1 }}
                helperText="El correo no puede ser modificado"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Phone color="action" />
              <TextField
                name="phone"
                label="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                variant={isEditing ? 'outlined' : 'filled'}
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTime color="action" />
              <TextField
                label="Miembro desde"
                value={formatDate(user.createdAt)}
                disabled
                variant="filled"
                size="small"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Notifications color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Preferencias de Notificaciones
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  color="primary"
                />
              }
              label="Notificaciones por correo electrónico"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.sms}
                  onChange={() => handleNotificationChange('sms')}
                  color="primary"
                />
              }
              label="Notificaciones por SMS"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.incidents}
                  onChange={() => handleNotificationChange('incidents')}
                  color="primary"
                />
              }
              label="Actualizaciones sobre mis reportes"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.updates}
                  onChange={() => handleNotificationChange('updates')}
                  color="primary"
                />
              }
              label="Noticias y actualizaciones de la app"
            />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Security color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Actividad de Seguridad
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : securityEvents.length > 0 ? (
            <List>
              {securityEvents.slice(0, 5).map((event) => (
                <ListItem key={event.id} divider>
                  <ListItemIcon>
                    <Box
                      sx={{
                        color: event.status === 'success' ? 'success.main' : 'error.main'
                      }}
                    >
                      {getEventIcon(event.type)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={getEventLabel(event.type)}
                    secondary={`${event.device} • ${event.location} • ${formatDate(event.timestamp)}`}
                  />
                  <ListItemSecondaryAction>
                    <Chip
                      label={event.status === 'success' ? 'Exitoso' : 'Fallido'}
                      size="small"
                      color={event.status === 'success' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No hay actividad reciente
            </Typography>
          )}

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Lock />}
              sx={{ textTransform: 'none' }}
            >
              Cambiar Contraseña
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeviceHub />}
              sx={{ textTransform: 'none' }}
            >
              Gestionar Dispositivos
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'error.main' }}>
            Zona de Peligro
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Esta acción es irreversible. Cerrarás sesión en todos tus dispositivos.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={() => setShowLogoutDialog(true)}
            sx={{ textTransform: 'none' }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          ¿Confirmar cierre de sesión?
        </DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas cerrar sesión? Necesitarás verificar tu identidad
            para volver a entrar.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowLogoutDialog(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none' }}
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function Login({}: {}) {
  return <History />;
}
