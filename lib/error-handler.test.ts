// Mock react-native Alert before importing error-handler
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

import { Alert } from 'react-native';
import {
  DatabaseError,
  logError,
  showErrorAlert,
  handleQueryError,
} from './error-handler';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('error-handler', () => {
  describe('DatabaseError', () => {
    it('should create database error with message', () => {
      const error = new DatabaseError('Test error');

      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Test error');
      expect(error.cause).toBeUndefined();
    });

    it('should create database error with cause', () => {
      const cause = new Error('Original error');
      const error = new DatabaseError('Test error', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');

      logError(error, 'Test Context');

      expect(console.error).toHaveBeenCalledWith('[Test Context]', error);
    });

    it('should handle unknown error types', () => {
      logError('String error', 'Test Context');

      expect(console.error).toHaveBeenCalledWith('[Test Context]', 'String error');
    });
  });

  describe('showErrorAlert', () => {
    it('should show alert with error message', () => {
      showErrorAlert('Test error message');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Test error message',
        [{ text: 'OK' }]
      );
    });
  });

  describe('handleQueryError', () => {
    it('should log error and show alert', () => {
      const error = new Error('Query failed');

      handleQueryError(error, 'Failed to load data');

      expect(console.error).toHaveBeenCalledWith('[Query Error]', error);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to load data',
        [{ text: 'OK' }]
      );
    });
  });
});
