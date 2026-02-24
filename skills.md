# Skills del Proyecto

## Tecnologías Principales
- Next.js 14+ (App Router)
- TypeScript
- Material UI v5
- React Hooks

## Principios de Diseño Aplicados

### SRP - Single Responsibility Principle
- Cada componente tiene una única responsabilidad
- RegisterForm: Solo maneja registro de usuarios
- LoginOTP: Solo maneja autenticación con OTP
- UserProfile: Solo maneja el perfil de usuario

### OCP - Open/Closed Principle
- authService es extensible sin modificar código existente
- Nuevos proveedores de autenticación implementan IAuthProvider
- Nuevos métodos de notificación implementan INotificationService

### DIP - Dependency Inversion Principle
- Depender de abstracciones (interfaces), no de implementaciones concretas
- AuthService recibe dependencias por constructor
- Fácil mocking para testing

### LSP - Liskov Substitution Principle
- Las implementaciones de interfaces son intercambiables
- DefaultAuthProvider puede ser reemplazado por cualquier IAuthProvider

### ISP - Interface Segregation Principle
- Interfaces pequeñas y específicas
- IAuthProvider, ITokenStorage, INotificationService separadas

## Medidas de Seguridad Implementadas

1. **Autenticación de Dos Factores (2FA/OTP)**
   - Código de 6 dígitos
   - Expiración de 120 segundos
   - Límite de intentos

2. **Protección de Contraseñas**
   - Validación de complejidad
   - Hash seguro (bcrypt)
   - No almacenar en texto plano

3. **Protección de Sesión**
   - Tokens en sessionStorage (no persistentes)
   - Refresh tokens en localStorage
   - Rotación de tokens

4. **Validación de Entrada**
   - Sanitización de inputs
   - Validación de formatos
   - Rate limiting

5. **Logging de Seguridad**
   - Registro de eventos de autenticación
   - Historial de dispositivos
   - Alertas de seguridad

## Patrones de UI/UX

- **Diseño Responsivo**: Mobile-first con breakpoints
- **Feedback Visual**: Estados de carga, éxito, error
- **Accesibilidad**:ARIA labels, keyboard navigation
- **Consistencia**: Material Design guidelines
