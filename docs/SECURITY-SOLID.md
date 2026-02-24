# Principios SOLID y Medidas de Seguridad

## Principios SOLID Aplicados

### 1. SRP - Single Responsibility Principle (Principio de Responsabilidad Única)

**Definición**: Una clase debe tener una sola razón para cambiar.

**Aplicación en componentes**:

```typescript
// RegisterForm.tsx - SOLO maneja registro de usuarios
// No maneja login, no maneja perfil, SOLO registro

// LoginOTP.tsx - SOLO maneja autenticación OTP
// No maneja registro, no maneja perfil, SOLO login con OTP

// UserProfile.tsx - SOLO maneja perfil de usuario
// No maneja autenticación, no maneja registro, SOLO perfil
```

**Beneficios**:
- Código más fácil de mantener
- Facilita testing unitario
- Reduce acoplamiento
- Mejora legibilidad

---

### 2. OCP - Open/Closed Principle (Principio Abierto/Cerrado)

**Definición**: Las entidades de software deben estar abiertas para extensión pero cerradas para modificación.

**Aplicación en authService**:

```typescript
// El servicio es EXTENSIBLE sin modificar código existente
class AuthService {
  private provider: IAuthProvider;
  
  // Agregar nuevos proveedores SIN modificar AuthService
  setProvider(provider: IAuthProvider): void {
    this.provider = provider;
  }
}

// Nuevas implementaciones:
- DefaultAuthProvider (implementación por defecto)
- CustomAuthProvider (para necesidades específicas)
- LDAPAuthProvider (autenticación empresarial)
- OAuthProvider (Google, Facebook, etc.)
```

**Beneficios**:
- Agregar funcionalidad sin cambiar código existente
- Reduce riesgo de introducir bugs
- Facilita extensiones futuras

---

### 3. DIP - Dependency Inversion Principle (Principio de Inversión de Dependencias)

**Definición**: Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.

**Aplicación**:

```typescript
// Interfaces (abstracciones)
export interface IAuthProvider {
  login(credentials: Credentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  // ...
}

export interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  // ...
}

export interface INotificationService {
  sendOTP(email: string, code: string): Promise<void>;
  // ...
}

// Inyección por constructor
class AuthService {
  constructor(
    private provider: IAuthProvider,           // Depende de abstracción
    private tokenStorage: ITokenStorage,      // Depende de abstracción
    private notificationService: INotificationService  // Depende de abstracción
  ) {}
}

// Fácil testing con mocks
const mockProvider = new MockAuthProvider();
const mockStorage = new MockTokenStorage();
const authService = new AuthService(mockProvider, mockStorage, mockNotification);
```

**Beneficios**:
- Código más testeable
- Menor acoplamiento
- Fácil intercambio de implementaciones

---

### 4. LSP - Liskov Substitution Principle (Principio de Sustitución de Liskov)

**Definición**: Los objetos de una clase derivada deben poder sustituirse por objetos de la clase base sin alterar el funcionamiento.

**Aplicación**:
```typescript
// Cualquier IAuthProvider puede ser usado indistintamente
const authService = new AuthService(
  new DefaultAuthProvider(),   // Puede ser cualquier implementación
  new LocalStorageTokenService(),
  new EmailNotificationService(),
  new SecurityLoggerService()
);

// testing
const mockProvider: IAuthProvider = new MockAuthProvider(); // Sustituye sin problemas
```

---

### 5. ISP - Interface Segregation Principle (Principio de Segregación de Interfaces)

**Definición**: Los clientes no deben depender de interfaces que no usan.

**Aplicación**:
```typescript
// Interfaces pequeñas y específicas
export interface IAuthProvider {
  login(credentials: Credentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  verifyOTP(request: OTPVerificationRequest): Promise<AuthResult>;
}

export interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
}

export interface INotificationService {
  sendOTP(email: string, code: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendSecurityAlert(email: string, event: SecurityEvent): Promise<void>;
}

export interface ISecurityLogger {
  logEvent(event: SecurityEvent): Promise<void>;
  getEvents(userId: string, limit?: number): Promise<SecurityEvent[]>;
}
```

---

## Medidas de Seguridad para Web App

### 1. Autenticación de Dos Factores (2FA/OTP)

| Medida | Implementación |
|--------|----------------|
| Longitud OTP | 6 dígitos |
| Expiración | 120 segundos (2 minutos) |
| Caracteres | Solo números |
| Intentos máximos | 3 intentos |
| Rate limiting | 5请求/15min por IP |

### 2. Seguridad de Contraseñas

| Requisito | Implementación |
|-----------|----------------|
| Longitud mínima | 8 caracteres |
| Mayúsculas | Al menos 1 |
| Minúsculas | Al menos 1 |
| Números | Al menos 1 |
| Hash | bcrypt con salt |
| Almacenamiento | Nunca en texto plano |

### 3. Gestión de Sesiones

| Aspecto | Implementación |
|---------|----------------|
| Token JWT | short-lived (15 min) |
| Refresh Token | long-lived (7 días) |
| Almacenamiento JWT | sessionStorage |
| Almacenamiento Refresh | localStorage |
| Invalidación | Al cerrar sesión |

### 4. Protección Contra Amenazas

| Amenaza | Protección |
|---------|------------|
| XSS | Sanitización de inputs |
| CSRF | Tokens en headers |
| SQL Injection | ORM/Parameterized queries |
| Brute Force | Rate limiting |
| Session Hijacking | Rotación de tokens |

### 5. Logging de Seguridad

```typescript
interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'otp_verification' | 'profile_update';
  device: string;
  location: string;
  timestamp: string;
  status: 'success' | 'failed';
}
```

Eventos registrados:
- Intentos de login (éxito/fallo)
- Cambios de contraseña
- Verificaciones OTP
- Actualizaciones de perfil
- Cerrar sesión

### 6. Validación de Entrada

```typescript
// Sanitización
sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remover tags HTML
    .substring(0, 1000);   // Límite de longitud
}

// Validación de email
validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validación de teléfono
validatePhone(phone: string): boolean {
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(phone);
}
```

### 7. Headers de Seguridad

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'" }
        ]
      }
    ];
  }
};
```

---

## Mejores Prácticas UX/UI

### 1. Estado Feedback Visual

| | Feedback |
|--------|----------|
| Cargando | Spinner/CircularProgress |
| Éxito | Alert verde, mensaje claro |
| Error | Alert rojo, mensaje específico |
| Validación | HelperText debajo del campo |

### 2. Accesibilidad

- Labels ARIA en todos los campos
- Navegación por teclado
- Contraste de colores AA+
- Textos alternativos

### 3. Diseño Responsivo

- Mobile-first approach
- Breakpoints: 600px, 900px, 1200px
- Touch-friendly (44px mínimo)

### 4. Micro-interacciones

- Transiciones suaves
- Validación en tiempo real
- Botones con estados (hover, active, disabled)

---

## Resumen

| Principio | Beneficio |
|-----------|-----------|
| SRP | Componentes mantenibles y testeables |
| OCP | Sistema extensible sin modificar existente |
| DIP | Bajo acoplamiento, alto testeo |
| LSP | Polimorfismo seguro |
| ISP | Interfaces pequeñas y específicas |

| Medida de Seguridad | Protección |
|---------------------|------------|
| OTP + JWT | Autenticación robusta |
| Sanitización | XSS |
| Rate limiting | Brute force |
| Logging | Auditoría |
| Headers | Ataques web comunes |
