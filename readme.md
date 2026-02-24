# Sistema de Autenticación - Reporte de Incidentes

Plataforma segura para el reporte de incidentes de seguridad y convivencia.

## Características

- ✅ Registro de usuarios con validación
- ✅ Login con autenticación de dos factores (OTP)
- ✅ Perfil de usuario personalizable
- ✅ Historial de actividad de seguridad
- ✅ Diseño responsivo y accesible

## Tecnologías

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Material UI v5
- **Auth**: JWT + OTP

## Instalación

```bash
npm install
npm run dev
```

## Estructura del Proyecto

```
src/
├── app/                    # Páginas de Next.js
│   ├── auth/              # Página de autenticación
│   └── profile/           # Página de perfil
├── components/
│   └── auth/              # Componentes de autenticación
│       ├── RegisterForm.tsx
│       ├── LoginOTP.tsx
│       └── UserProfile.tsx
├── services/
│   ├── auth/              # Servicios de autenticación
│   └── validation/        # Servicios de validación
├── context/               # React Context
└── types/                 # Tipos TypeScript
```

## Principios SOLID Aplicados

| Principio | Aplicación |
|-----------|------------|
| **SRP** | Componentes con única responsabilidad |
| **OCP** | Servicios extensibles sin modificar existentes |
| **DIP** | Inyección de dependencias vía interfaces |
| **LSP** | Implementaciones intercambiables |
| **ISP** | Interfaces pequeñas y específicas |

## Medidas de Seguridad

1. **OTP de 6 dígitos** con expiración de 2 minutos
2. **Validación de contraseña**: 8+ chars, mayúscula, minúscula, número
3. **Tokens en sessionStorage** (no persistentes)
4. **Sanitización de inputs** contra XSS
5. **Rate limiting** en endpoints de autenticación
6. **Logging de eventos** de seguridad

## Flujo de Autenticación

```
Usuario → Login → Credenciales → Server → OTP
                                    ↓
                              Usuario ← Token JWT
                                    ↓
                              Acceder a recursos
```

## Licencia

MIT
