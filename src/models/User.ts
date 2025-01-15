import CryptoJS from 'crypto-js';
import { PasswordManager } from '@/utils/passwordManager';
import zxcvbn from 'zxcvbn';

// Define and export interfaces
export interface StoredCredential {
  id: string;
  appName: string;
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  hashedPassword: string;
  salt: string;
  storedCredentials: StoredCredential[];
}

export class UserManager {
  private static USERS_KEY = 'password_manager_users';
  private static CURRENT_USER_KEY = 'current_logged_in_user';

  // Generate a secure random salt
  static generateSalt(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((x) => charset[x % charset.length])
      .join('');
  }

  // Hash password with salt
  static hashPassword(password: string, salt: string): string {
    return CryptoJS.PBKDF2(password, salt, { 
      keySize: 256/32, 
      iterations: 1000 
    }).toString();
  }

  // Delete a stored credential
  static deleteCredential(credentialId: string): boolean {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const users = this.getAllUsers();
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      
      if (userIndex === -1) return false;

      // Find and remove the credential
      const credentialIndex = users[userIndex].storedCredentials.findIndex(
        (cred: StoredCredential) => cred.id === credentialId
      );

      if (credentialIndex === -1) return false;

      users[userIndex].storedCredentials.splice(credentialIndex, 1);

      // Update storage
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(users[userIndex]));

      return true;
    } catch (error) {
      console.error('Error deleting credential:', error);
      return false;
    }
  }

  // Update a stored credential
  static updateCredential(
    credentialId: string,
    updates: {
      appName?: string;
      username?: string;
      password?: string;
    }
  ): boolean {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const users = this.getAllUsers();
      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      
      if (userIndex === -1) return false;

      // Find the credential
      const credentialIndex = users[userIndex].storedCredentials.findIndex(
        (cred: StoredCredential) => cred.id === credentialId
      );

      if (credentialIndex === -1) return false;

      // Update the credential
      const currentCred = users[userIndex].storedCredentials[credentialIndex];
      users[userIndex].storedCredentials[credentialIndex] = {
        ...currentCred,
        appName: updates.appName?.trim() || currentCred.appName,
        username: updates.username?.trim() || currentCred.username,
        password: updates.password ? PasswordManager.encrypt(updates.password) : currentCred.password
      };

      // Update storage
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(users[userIndex]));

      return true;
    } catch (error) {
      console.error('Error updating credential:', error);
      return false;
    }
  }

  // Password strength validation for registration
  static validatePasswordStrength(password: string): boolean {
    const result = zxcvbn(password);
    // Require a score of 3 or 4 (strong or very strong)
    return result.score >= 3;
  }

  // Get all registered users with error handling
  static getAllUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      if (!usersJson) return [];
      
      const users = JSON.parse(usersJson);
      return Array.isArray(users) ? users.map(user => ({
        ...user,
        storedCredentials: Array.isArray(user.storedCredentials) ? user.storedCredentials : []
      })) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Register a new user with strong password requirement
  static registerUser(username: string, password: string): string | null {
    try {
      // Check password strength
      if (!this.validatePasswordStrength(password)) {
        return "Password is too weak. Please use a stronger password.";
      }

      const existingUsers = this.getAllUsers();
      
      // Check if username already exists
      if (existingUsers.some((user: User) => user.username === username)) {
        return "Username already exists.";
      }

      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(password, salt);
      
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        hashedPassword,
        salt,
        storedCredentials: []
      };

      existingUsers.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(existingUsers));
      return null; // Successful registration
    } catch (error) {
      console.error('Error registering user:', error);
      return "Registration failed. Please try again.";
    }
  }

  // Login user with error handling
  static loginUser(username: string, password: string): User | null {
    try {
      const users = this.getAllUsers();
      const user = users.find((u: User) => u.username === username);

      if (!user) return null;

      const hashedInputPassword = this.hashPassword(password, user.salt);
      
      if (hashedInputPassword === user.hashedPassword) {
        // Ensure storedCredentials is initialized
        const userWithCredentials = {
          ...user,
          storedCredentials: Array.isArray(user.storedCredentials) ? user.storedCredentials : []
        };
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithCredentials));
        return userWithCredentials;
      }

      return null;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  }

  // Get currently logged-in user with error handling
  static getCurrentUser(): User | null {
    try {
      const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
      if (!userJson) return null;
      
      const user = JSON.parse(userJson);
      return {
        ...user,
        storedCredentials: Array.isArray(user.storedCredentials) ? user.storedCredentials : []
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Store application credentials with error handling
  static storeApplicationCredential(
    appName: string, 
    username: string, 
    password: string
  ): boolean {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;

      const users = this.getAllUsers();
      if (!Array.isArray(users)) return false;

      const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
      if (userIndex === -1) return false;

      // Initialize storedCredentials if it doesn't exist
      if (!Array.isArray(users[userIndex].storedCredentials)) {
        users[userIndex].storedCredentials = [];
      }

      const encryptedPassword = PasswordManager.encrypt(password);
      
      const newCredential: StoredCredential = {
        id: crypto.randomUUID(),
        appName: appName.trim(),
        username: username.trim(),
        password: encryptedPassword
      };

      // Check if credential for this app already exists
      const existingCredentialIndex = users[userIndex].storedCredentials.findIndex(
        (cred: StoredCredential) => cred.appName.toLowerCase() === appName.toLowerCase()
      );

      if (existingCredentialIndex !== -1) {
        // Update existing credential
        users[userIndex].storedCredentials[existingCredentialIndex] = newCredential;
      } else {
        // Add new credential
        users[userIndex].storedCredentials.push(newCredential);
      }

      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(users[userIndex]));

      return true;
    } catch (error) {
      console.error('Error storing credential:', error);
      return false;
    }
  }

  // Get all stored credentials with error handling
  static getAllCredentials(): StoredCredential[] {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return [];
      
      return Array.isArray(currentUser.storedCredentials) 
        ? currentUser.storedCredentials 
        : [];
    } catch (error) {
      console.error('Error getting credentials:', error);
      return [];
    }
  }

  // Search through stored credentials with error handling
  static searchCredentials(query: string): StoredCredential[] {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return [];

      const credentials = Array.isArray(currentUser.storedCredentials) 
        ? currentUser.storedCredentials 
        : [];

      const lowercaseQuery = query.toLowerCase();
      return credentials.filter(
        (cred: StoredCredential) => 
          cred.appName.toLowerCase().includes(lowercaseQuery) ||
          cred.username.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching credentials:', error);
      return [];
    }
  }

  // Retrieve a specific credential with error handling
  static getCredentialById(id: string): StoredCredential | null {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser || !Array.isArray(currentUser.storedCredentials)) return null;

      const credential = currentUser.storedCredentials.find(
        (cred: StoredCredential) => cred.id === id
      );
      
      if (credential) {
        // Decrypt password
        const decryptedPassword = PasswordManager.decrypt(credential.password);
        return {
          ...credential,
          password: decryptedPassword
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting credential by ID:', error);
      return null;
    }
  }

  // Logout current user
  static logout(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }
}