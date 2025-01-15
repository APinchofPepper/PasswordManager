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
    if (process.env.NODE_ENV === 'development') {
      console.warn('No encryption key provided. Generating a temporary key.');
      return this.generatePassword(32); // Generate a random 32-character key
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

  /**
   * Securely store password in local storage
   * @param key - Storage key
   * @param password - Password to store
   */
  static storePassword(key: string, password: string): void {
    const encryptedPassword = this.encrypt(password);
    localStorage.setItem(key, encryptedPassword);
  }

  /**
   * Retrieve stored password
   * @param key - Storage key
   * @returns Decrypted password
   */
  static retrievePassword(key: string): string | null {
    const encryptedPassword = localStorage.getItem(key);
    return encryptedPassword ? this.decrypt(encryptedPassword) : null;
  }
}