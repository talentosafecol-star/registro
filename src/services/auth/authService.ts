import {
  AuthResult,
  OTPRequest,
  OTPVerificationRequest,
  RegisterData,
  User,
  SecurityEvent
} from './IAuthService';

export interface IAuthProvider {
  login(credentials: { email: string; password: string }): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  verifyOTP(request: OTPVerificationRequest): Promise<AuthResult>;
  refreshToken(token: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getProfile(): Promise<User>;
  updateProfile(data: Partial<User>): Promise<AuthResult>;
}

export interface ITokenStorage {
  setToken(token: string): void;
  getToken(): string | null;
  removeToken(): void;
  setRefreshToken(token: string): void;
  getRefreshToken(): string | null;
  removeRefreshToken(): void;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class AuthService {
  private provider: IAuthProvider;
  private tokenStorage: ITokenStorage;
  private notificationService: INotificationService;
  private securityLogger: ISecurityLogger;

  constructor(
    provider: IAuthProvider,
    tokenStorage: ITokenStorage,
    notificationService: INotificationService,
    securityLogger: ISecurityLogger
  ) {
    this.provider = provider;
    this.tokenStorage = tokenStorage;
    this.notificationService = notificationService;
    this.securityLogger = securityLogger;
  }

  static createDefault(): AuthService {
    return new AuthService(
      new DefaultAuthProvider(),
      new LocalStorageTokenService(),
      new EmailNotificationService(),
      new SecurityLoggerService()
    );
  }

  setProvider(provider: IAuthProvider): void {
    this.provider = provider;
  }

  setTokenStorage(storage: ITokenStorage): void {
    this.tokenStorage = storage;
  }

  setNotificationService(service: INotificationService): void {
    this.notificationService = service;
  }

  setSecurityLogger(logger: ISecurityLogger): void {
    this.securityLogger = logger;
  }

  async register(data: RegisterData): Promise<AuthResult> {
    const result = await this.provider.register(data);

    if (result.success && result.user) {
      await this.notificationService.sendWelcomeEmail(
        result.user.email,
        result.user.name
      );
    }

    return result;
  }

  async requestOTP(request: OTPRequest): Promise<AuthResult> {
    const loginResult = await this.provider.login({
      email: request.email,
      password: request.password
    });

    if (loginResult.success && loginResult.sessionToken) {
      const otpCode = this.generateOTP();
      await this.notificationService.sendOTP(request.email, otpCode);
      await this.securityLogger.logEvent({
        id: crypto.randomUUID(),
        type: 'otp_verification',
        device: request.deviceInfo?.browser || 'Unknown',
        location: request.deviceInfo?.location || 'Unknown',
        timestamp: new Date().toISOString(),
        status: 'success'
      });

      return {
        success: true,
        sessionToken: loginResult.sessionToken,
        message: 'Código OTP enviado'
      };
    }

    return loginResult;
  }

  async verifyOTP(request: OTPVerificationRequest): Promise<AuthResult> {
    const result = await this.provider.verifyOTP(request);

    if (result.success && result.token) {
      this.tokenStorage.setToken(result.token);
      if (result.refreshToken) {
        this.tokenStorage.setRefreshToken(result.refreshToken);
      }
    }

    return result;
  }

  async logout(): Promise<void> {
    this.tokenStorage.removeToken();
    this.tokenStorage.removeRefreshToken();
    await this.provider.logout();
  }

  async getProfile(): Promise<User | null> {
    const token = this.tokenStorage.getToken();
    if (!token) return null;

    try {
      return await this.provider.getProfile();
    } catch {
      this.tokenStorage.removeToken();
      return null;
    }
  }

  async updateProfile(data: Partial<User>): Promise<AuthResult> {
    return this.provider.updateProfile(data);
  }

  async getSecurityEvents(limit: number = 10): Promise<SecurityEvent[]> {
    return this.securityLogger.getEvents('', limit);
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getToken();
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

class DefaultAuthProvider implements IAuthProvider {
  async login(credentials: { email: string; password: string }): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Credenciales inválidas'
        };
      }

      return {
        success: true,
        sessionToken: data.sessionToken,
        message: 'OTP enviado'
      };
    } catch {
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Error al registrar'
        };
      }

      return {
        success: true,
        user: result.user,
        message: 'Registro exitoso'
      };
    } catch {
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  async verifyOTP(request: OTPVerificationRequest): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Código inválido'
        };
      }

      return {
        success: true,
        token: data.token,
        refreshToken: data.refreshToken,
        user: data.user
      };
    } catch {
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  async refreshToken(token: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: 'Token expirado' };
      }

      return {
        success: true,
        token: data.token,
        refreshToken: data.refreshToken
      };
    } catch {
      return { success: false, message: 'Error de conexión' };
    }
  }

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getProfile(): Promise<User> {
    const token = LocalStorageTokenService.getTokenStatic();
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error al obtener perfil');
    }

    return response.json();
  }

  async updateProfile(data: Partial<User>): Promise<AuthResult> {
    const token = LocalStorageTokenService.getTokenStatic();
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message };
    }

    return { success: true, user: result.user };
  }
}

class LocalStorageTokenService implements ITokenStorage {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.TOKEN_KEY);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  removeRefreshToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static getTokenStatic(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_token');
    }
    return null;
  }
}

class EmailNotificationService implements INotificationService {
  async sendOTP(email: string, code: string): Promise<void> {
    await fetch(`${API_BASE_URL}/notifications/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await fetch(`${API_BASE_URL}/notifications/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
  }

  async sendSecurityAlert(email: string, event: SecurityEvent): Promise<void> {
    await fetch(`${API_BASE_URL}/notifications/security`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, event })
    });
  }
}

class SecurityLoggerService implements ISecurityLogger {
  private events: SecurityEvent[] = [];

  async logEvent(event: SecurityEvent): Promise<void> {
    this.events.push(event);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('security_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      localStorage.setItem('security_events', JSON.stringify(events.slice(-100)));
    }
  }

  async getEvents(userId: string, limit: number = 10): Promise<SecurityEvent[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('security_events');
      const events = stored ? JSON.parse(stored) : [];
      return events.slice(-limit).reverse();
    }
    return this.events.slice(-limit).reverse();
  }
}

export const authService = AuthService.createDefault();
