export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  emailVerified: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  sessionToken?: string;
  user?: User;
}

export interface OTPRequest {
  email: string;
  password: string;
  deviceInfo?: {
    browser: string;
    os: string;
    location: string;
  };
}

export interface OTPVerificationRequest {
  sessionToken: string;
  code: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'otp_verification' | 'profile_update';
  device: string;
  location: string;
  timestamp: string;
  status: 'success' | 'failed';
}
