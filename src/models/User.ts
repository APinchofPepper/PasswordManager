import CryptoJS from 'crypto-js';
import { PasswordManager } from '@/utils/passwordManager';

export interface User {
    id: string;
    username: string;
    hashedPassword: string;
    salt: string;
    storedPasswords: Record<string, string>;
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
  
    // Register a new user
    static registerUser(username: string, password: string): boolean {
      const existingUsers = this.getAllUsers();
      
      // Check if username already exists
      if (existingUsers.some(user => user.username === username)) {
        return false;
      }
  
      const salt = this.generateSalt();
      const hashedPassword = this.hashPassword(password, salt);
      
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        hashedPassword,
        salt,
        storedPasswords: {}
      };
  
      existingUsers.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(existingUsers));
      return true;
    }
  
    // Login user
    static loginUser(username: string, password: string): User | null {
      const users = this.getAllUsers();
      const user = users.find(u => u.username === username);
  
      if (!user) return null;
  
      const hashedInputPassword = this.hashPassword(password, user.salt);
      
      if (hashedInputPassword === user.hashedPassword) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        return user;
      }
  
      return null;
    }
  
    // Get currently logged-in user
    static getCurrentUser(): User | null {
      const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    }
  
    // Logout current user
    static logout(): void {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  
    // Get all registered users
    static getAllUsers(): User[] {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    }
  
    // Store application password for a user
    static storeApplicationPassword(appName: string, password: string): boolean {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return false;
  
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) return false;
  
      // Encrypt the password before storing
      const encryptedPassword = PasswordManager.encrypt(password);
      users[userIndex].storedPasswords[appName] = encryptedPassword;
  
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
  
      return true;
    }
  
    // Retrieve application password
    static getApplicationPassword(appName: string): string | null {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;
  
      const encryptedPassword = currentUser.storedPasswords[appName];
      return encryptedPassword ? PasswordManager.decrypt(encryptedPassword) : null;
    }
  }