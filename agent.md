# Agente de Desarrollo - Sistema de Autenticación

## Descripción del Proyecto
Sistema de autenticación completo para aplicación web de reporte de incidentes de seguridad y convivencia (robo, violencia intrafamiliar, riñas, etc.)

## stack Tecnológico
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: Material UI v5
- **Language**: TypeScript
- **Deployment**: Vercel
- **Authentication**: JWT + OTP

## Estructura de Componentes

### SRP - Single Responsibility Principle
```
src/components/auth/
├── RegisterForm.tsx   → Única responsabilidad: registro de usuarios
├── LoginOTP.tsx       → Única responsabilidad: autenticación con OTP
└── UserProfile.tsx    → Única responsabilidad: gestión de perfil de usuario
```

### Servicios con OCP/DIP
```
src/services/
├── auth/
│   ├── authService.ts      → Servicio principal (extensible)
│   └── IAuthService.ts     → Interfaces para inyección de dependencias
└── validation/
    └── validationService.ts → Validaciones de entrada
```

## Flujo de Autenticación

1. **Registro**: Usuario completa formulario → Validación → Creación en BD → Email de verificación
2. **Login**: Credenciales → Verificación → Envío OTP → Validación OTP → Token JWT
3. **Perfil**: Verificación token → Carga datos → Edición → Actualización BD

## Comandos de Desarrollo

```bash
npm install          # Instalar dependencias
npm run dev          # Iniciar servidor desarrollo
npm run build        # Construir para producción
npm run lint         # Verificar código
npm run typecheck    # Verificar tipos
```

## Variables de Entorno

```env
NEXT_PUBLIC_API_URL=/api
JWT_SECRET=secret_key
OTP_EXPIRY=120
```

## Reglas de Contribución
- Mantener SRP en todos los componentes
- Usar interfaces para dependencias (DIP)
- Extender servicios sin modificar código existente (OCP)
- Ejecutar lint y typecheck antes de commit
