export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export class ValidationService {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  static validatePassword(password: string): ValidationResult {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe tener al menos una mayúscula'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe tener al menos una minúscula'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'La contraseña debe tener al menos un número'
      };
    }

    return { isValid: true };
  }

  static validateName(name: string): ValidationResult {
    if (!name || name.trim().length < 2) {
      return {
        isValid: false,
        message: 'El nombre debe tener al menos 2 caracteres'
      };
    }

    if (name.trim().length > 100) {
      return {
        isValid: false,
        message: 'El nombre no puede exceder 100 caracteres'
      };
    }

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(name.trim())) {
      return {
        isValid: false,
        message: 'El nombre solo puede contener letras y espacios'
      };
    }

    return { isValid: true };
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .substring(0, 1000);
  }

  static validateOTP(otp: string, length: number = 6): ValidationResult {
    if (!otp || otp.length !== length) {
      return {
        isValid: false,
        message: `El código debe tener ${length} dígitos`
      };
    }

    if (!/^\d+$/.test(otp)) {
      return {
        isValid: false,
        message: 'El código solo debe contener números'
      };
    }

    return { isValid: true };
  }
}

export const validationService = {
  validateEmail: ValidationService.validateEmail,
  validatePhone: ValidationService.validatePhone,
  validatePassword: ValidationService.validatePassword,
  validateName: ValidationService.validateName,
  sanitizeInput: ValidationService.sanitizeInput,
  validateOTP: ValidationService.validateOTP
};
