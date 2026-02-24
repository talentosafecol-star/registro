'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Paper
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person, Phone } from '@mui/icons-material';
import { authService } from '@/services/auth/authService';
import { validationService } from '@/services/validation/validationService';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validationService.validateEmail(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!validationService.validatePhone(formData.phone)) {
      newErrors.phone = 'Ingrese un número de teléfono válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = validationService.validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      if (result.success) {
        setSuccessMessage(result.message || 'Registro exitoso. Por favor, verifica tu correo electrónico.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setServerError(result.message || 'Error al registrar usuario');
      }
    } catch (error) {
      setServerError('Error de conexión. Por favor, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        maxWidth: 450,
        width: '100%',
        borderRadius: 2,
        background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)'
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            mb: 3,
            color: 'primary.main'
          }}
        >
          Crear Cuenta
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', mb: 3 }}
        >
          Regístrate para reportar incidentes de seguridad
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <TextField
          fullWidth
          name="name"
          label="Nombre Completo"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="action" />
              </InputAdornment>
            )
          }}
          autoComplete="name"
        />

        <TextField
          fullWidth
          name="email"
          label="Correo Electrónico"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={!!errors.email}
          helperText={errors.email}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            )
          }}
          autoComplete="email"
        />

        <TextField
          fullWidth
          name="phone"
          label="Teléfono"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={!!errors.phone}
          helperText={errors.phone}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone color="action" />
              </InputAdornment>
            )
          }}
          autoComplete="tel"
        />

        <TextField
          fullWidth
          name="password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          error={!!errors.password}
          helperText={errors.password || 'Mínimo 8 caracteres, mayúscula, minúscula y número'}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          autoComplete="new-password"
        />

        <TextField
          fullWidth
          name="confirmPassword"
          label="Confirmar Contraseña"
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          margin="normal"
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            )
          }}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isLoading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.39)'
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Registrarse'
          )}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes una cuenta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToLogin}
              sx={{ fontWeight: 600 }}
            >
              Iniciar Sesión
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
