import zxcvbn from 'zxcvbn';
import CryptoJS from 'crypto-js';

export interface PasswordStrength {
  score: number;
  feedback: string;
  entropy: number;
  timeToCrack: string;
}

export class PasswordManager {
  // Use a fallback or throw an error if the key is not set
  private static ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_SECRET || this.generateFallbackKey();

  // Optional method to generate a fallback encryption key
  private static generateFallbackKey(): string {
    if (import.meta.env.DEV) {
      console.warn('No encryption key provided. Generating a temporary key.');
      // Use Web Crypto API for more secure random key generation
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('VITE_ENCRYPTION_SECRET must be set in production');
  }

  /**
   * Analyze password strength using zxcvbn library
   * @param password - The password to analyze
   * @returns Detailed password strength information
   */
  static analyzePasswordStrength(password: string): PasswordStrength {
    const result = zxcvbn(password);
    
    // Map zxcvbn score to more descriptive feedback
    const strengthLabels = [
      'Very Weak',
      'Weak',
      'Moderate',
      'Strong',
      'Very Strong'
    ];

    // Calculate estimated time to crack
    const timeToCrackMap = [
      'Instant',
      'Less than a second',
      'Few seconds',
      'Minutes',
      'Hours',
      'Days',
      'Weeks',
      'Months',
      'Years',
      'Centuries'
    ];

    return {
      score: result.score,
      feedback: result.feedback.suggestions.length > 0 
        ? result.feedback.suggestions.join('. ') 
        : strengthLabels[result.score],
      entropy: result.guesses_log10,
      timeToCrack: timeToCrackMap[Math.min(
        Math.floor(Math.log10(result.guesses)), 
        timeToCrackMap.length - 1
      )]
    };
  }

  /**
   * Generate a strong, random password
   * @param length - Password length (default 16)
   * @returns Generated password
   */
  static generatePassword(length: number = 16): string {
    const charset = 
      'abcdefghijklmnopqrstuvwxyz' + 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
      '0123456789' + 
      '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }

  /**
   * Encrypt sensitive data
   * @param data - Data to encrypt
   * @returns Encrypted string
   */
  static encrypt(data: string): string {
    if (!this.ENCRYPTION_KEY) {
      throw new Error('Encryption key not set');
    }
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  /**
   * Decrypt sensitive data
   * @param encryptedData - Encrypted data to decrypt
   * @returns Decrypted string
   */
  static decrypt(encryptedData: string): string {
    if (!this.ENCRYPTION_KEY) {
      throw new Error('Encryption key not set');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}