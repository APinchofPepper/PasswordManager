/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENCRYPTION_SECRET: string
    // Add other environment variables here if needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }