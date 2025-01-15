import { UserManager } from '@/models/User';
import { PasswordManager } from './passwordManager';

export class CredentialManager {
  static exportCredentials(): string {
    const currentUser = UserManager.getCurrentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    const credentials = currentUser.storedCredentials.map(cred => ({
      ...cred,
      // Decrypt password for export
      password: PasswordManager.decrypt(cred.password)
    }));

    // Create an encrypted export with timestamp
    const exportData = {
      timestamp: new Date().toISOString(),
      credentials: credentials
    };

    // Use strong encryption for export file
    return PasswordManager.encrypt(JSON.stringify(exportData));
  }

  static importCredentials(encryptedData: string): number {
    try {
      // Decrypt import data
      const decryptedData = JSON.parse(
        PasswordManager.decrypt(encryptedData)
      );

      const currentUser = UserManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      let importCount = 0;
      decryptedData.credentials.forEach((cred: any) => {
        // Re-encrypt password before storing
        const encryptedPassword = PasswordManager.encrypt(cred.password);
        
        const success = UserManager.storeApplicationCredential(
          cred.appName, 
          cred.username, 
          PasswordManager.decrypt(encryptedPassword)
        );

        if (success) importCount++;
      });

      return importCount;
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Invalid or corrupted import file');
    }
  }
}