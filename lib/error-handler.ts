import { Alert } from 'react-native';

export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Layer 1: Silent logging
export function logError(error: unknown, context: string) {
  console.error(`[${context}]`, error);
  // TODO: Add crash reporting (Sentry, etc.) later
}

// Layer 2: User-facing toast/alert
export function showErrorAlert(message: string) {
  Alert.alert('Error', message, [{ text: 'OK' }]);
}

// Layer 3: Error handler for TanStack Query
export function handleQueryError(error: unknown, userMessage: string) {
  logError(error, 'Query Error');
  showErrorAlert(userMessage);
}
