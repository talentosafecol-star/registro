'use client';

import { useState, useEffect, useRef } from 'react';
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
  Paper,
  Divider,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Timer,
  VerifiedUser,
  Send
} from '@mui/icons-material';
import { authService, OTPRequest } from '@/services/auth/authService';
import { validationService } from '@/services/validation/validationService';

interface LoginOTPProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

type LoginStep = 'credentials' | 'otp';

interface CredentialsForm {
  email: string;
  password: string;
}

interface OTPForm {
  code: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  code?: string;
}

const OTP_LENGTH = 6;
const OTP_TIMEOUT = 120;

export default function LoginOTP({ onSuccess, onSwitchToRegister }: LoginOTPProps) {
  const [step, setStep] = useState<LoginStep>('credentials');
  const [credentials, setCredentials] = useState<CredentialsForm>({
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState<OTPForm>({ code: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number>(OTP_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 'otp' && otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, otpExpiry]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateCredentials = (): boolean => {
    const newErrors: FormErrors = {};

    if (!credentials.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!validationService.validateEmail(credentials.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOTP = (): boolean => {
    if (!otp.code || otp.code.length !== OTP_LENGTH) {
      setErrors({ code: `Ingrese el código de ${OTP_LENGTH} dígitos` });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setServerError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.code.split('');
    newOtp[index] = value.slice(-1);
    const newCode = newOtp.join('');
    setOtp({ code: newCode });

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.length === OTP_LENGTH) {
      setErrors({});
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateCredentials()) {
      return;
    }

    setIsLoading(true);

    try {
      const request: OTPRequest = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      };

      const result = await authService.requestOTP(request);

      if (result.success && result.sessionToken) {
        setSessionToken(result.sessionToken);
        setStep('otp');
        setOtpExpiry(OTP_TIMEOUT);
        setCanResend(false);
        setOtp({ code: '' });
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setServerError(result.message || 'Credenciales inválidas');
      }
    } catch (error) {
      setServerError('Error de conexión. Por favor, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateOTP()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.verifyOTP({
        sessionToken,
        code: otp.code
      });

      if (result.success) {
        onSuccess?.();
      } else {
        setServerError(result.message || 'Código inválido o expirado');
        setOtp({ code: '' });
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setServerError('Error de conexión. Por favor, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      const request: OTPRequest = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      };

      const result = await authService.requestOTP(request);

      if (result.success) {
        setOtpExpiry(OTP_TIMEOUT);
        setCanResend(false);
        setOtp({ code: '' });
        setServerError('');
        inputRefs.current[0]?.focus();
      } else {
        setServerError('Error al reenviar el código');
      }
    } catch (error) {
      setServerError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('credentials');
    setOtp({ code: '' });
    setOtpExpiry(OTP_TIMEOUT);
    setCanResend(false);
    setServerError('');
    setErrors({});
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
      {step === 'credentials' ? (
        <Box component="form" onSubmit={handleCredentialsSubmit} noValidate>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <VerifiedUser
              sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
            />
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingresa tus credenciales para continuar
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <TextField
            fullWidth
            name="email"
            label="Correo Electrónico"
            type="email"
            value={credentials.email}
            onChange={handleCredentialsChange}
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
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleCredentialsChange}
            error={!!errors.password}
            helperText={errors.password}
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
            autoComplete="current-password"
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link href="/auth/reset-password" variant="body2">
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

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
              'Continuar'
            )}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Chip label="ó" size="small" />
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ¿No tienes una cuenta?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={onSwitchToRegister}
                sx={{ fontWeight: 600 }}
              >
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleOtpSubmit} noValidate>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Send sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Verificación en Dos Pasos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Se envió un código de verificación a{' '}
              <strong>{credentials.email}</strong>
            </Typography>
          </Box>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mb: 3
            }}
          >
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <TextField
                key={index}
                inputRef={el => (inputRefs.current[index] = el)}
                value={otp.code[index] || ''}
                onChange={e => handleOtpChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    width: 40
                  }
                }}
                error={!!errors.code}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            ))}
          </Box>

          {errors.code && (
            <Typography color="error" variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
              {errors.code}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 3
            }}
          >
            <Timer color="action" />
            <Typography variant="body2" color="text.secondary">
              {otpExpiry > 0 ? (
                <>El código expira en {formatTime(otpExpiry)}</>
              ) : (
                'El código ha expirado'
              )}
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isLoading || otp.code.length !== OTP_LENGTH}
            sx={{
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
              'Verificar Código'
            )}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={handleBack}
              disabled={isLoading}
              sx={{ textTransform: 'none' }}
            >
              ← Volver a credenciales
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            {canResend ? (
              <Button
                variant="outlined"
                onClick={handleResendOTP}
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
              >
                {isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  'Reenviar Código'
                )}
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary">
                ¿No recibiste el código?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={handleResendOTP}
                  disabled={!canResend}
                  sx={{ fontWeight: 600 }}
                >
                  Reenviar
                </Link>
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
