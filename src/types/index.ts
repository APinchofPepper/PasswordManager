// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Notification type
export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}
