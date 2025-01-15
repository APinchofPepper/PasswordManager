declare module 'crypto-js' {
    export function PBKDF2(password: string, salt: string, options: {
      keySize: number;
      iterations: number;
    }): any;
  
    export const AES: {
      encrypt(data: string, key: string): any;
      decrypt(ciphertext: any, key: string): any;
    };
  
    export const enc: {
      Utf8: any;
    };
  }