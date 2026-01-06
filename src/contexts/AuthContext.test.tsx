import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import React, { type ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { AuthContext } from './AuthContext.types';
import { authApi } from '../services/auth';
import { StorageService } from '../utils/storage';
import type { User, LoginRequest } from '../types/auth';

// Mock the auth API
vi.mock('../services/auth', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
}));

describe('AuthContext Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  /**
   * Feature: admin-system-foundation, Property 2: Login Validation Failure Handling
   * Validates: Requirements 1.4
   * 
   * For any login attempt with invalid credentials, the system should display an error message,
   * not create a session, and not store any authentication token.
   */
  it('should not store token or create session on login failure', () => {
    fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string(),
          password: fc.string(),
        }),
        fc.constantFrom(
          'Invalid credentials',
          'User not found',
          'Authentication failed',
          'Unauthorized'
        ),
        async (credentials, errorMessage) => {
          // Setup: Mock login to fail
          const loginError = new Error(errorMessage);
          vi.mocked(authApi.login).mockRejectedValueOnce(loginError);

          // Render the hook with AuthProvider
          const wrapper = ({ children }: { children: ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
          );

          const { result } = renderHook(() => {
            const context = React.useContext(AuthContext);
            if (!context) throw new Error('AuthContext not found');
            return context;
          }, { wrapper });

          // Wait for initial loading to complete
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Action: Attempt login with invalid credentials
          let errorThrown = false;
          try {
            await result.current.login(credentials as LoginRequest);
          } catch {
            errorThrown = true;
          }

          // Verify: Error was thrown
          expect(errorThrown).toBe(true);

          // Verify: No token stored in localStorage
          expect(StorageService.getToken()).toBeNull();

          // Verify: No user stored in localStorage
          expect(StorageService.getUser()).toBeNull();

          // Verify: User is not authenticated
          expect(result.current.isAuthenticated).toBe(false);
          expect(result.current.user).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: admin-system-foundation, Property 4: Session Persistence Across Page Refresh
   * Validates: Requirements 2.2
   * 
   * For any valid authentication token stored in local storage, when the page is refreshed,
   * the system should maintain the login state and display the Dashboard without requiring re-authentication.
   */
  it('should maintain login state after page refresh with valid token', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10 }), // Generate valid token
        fc.record({
          id: fc.string({ minLength: 1 }),
          username: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('admin', 'manager', 'user'),
        }),
        async (token, user) => {
          // Setup: Store valid token and user (simulating previous login)
          StorageService.setToken(token);
          StorageService.setUser(user as User);

          // Mock getCurrentUser to return the stored user (token is valid)
          vi.mocked(authApi.getCurrentUser).mockResolvedValueOnce(user as User);

          // Action: Render AuthProvider (simulating page refresh)
          const wrapper = ({ children }: { children: ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
          );

          const { result } = renderHook(() => {
            const context = React.useContext(AuthContext);
            if (!context) throw new Error('AuthContext not found');
            return context;
          }, { wrapper });

          // Wait for authentication check to complete
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify: User is authenticated
          expect(result.current.isAuthenticated).toBe(true);
          expect(result.current.user).toEqual(user);

          // Verify: Token is still in storage
          expect(StorageService.getToken()).toBe(token);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: admin-system-foundation, Property 5: Invalid Session Cleanup
   * Validates: Requirements 2.3
   * 
   * For any expired or invalid authentication token, the system should clear all authentication
   * information from local storage and redirect the user to the Login page.
   */
  it('should clear storage when token is invalid or expired', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10 }), // Generate token (will be invalid)
        fc.record({
          id: fc.string({ minLength: 1 }),
          username: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('admin', 'manager', 'user'),
        }),
        async (invalidToken, user) => {
          // Setup: Store invalid/expired token and user
          StorageService.setToken(invalidToken);
          StorageService.setUser(user as User);

          // Verify data is stored initially
          expect(StorageService.getToken()).toBe(invalidToken);
          expect(StorageService.getUser()).toEqual(user);

          // Mock getCurrentUser to fail (token is invalid/expired)
          const authError = new Error('Token expired');
          vi.mocked(authApi.getCurrentUser).mockRejectedValueOnce(authError);

          // Action: Render AuthProvider (simulating page refresh with invalid token)
          const wrapper = ({ children }: { children: ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
          );

          const { result } = renderHook(() => {
            const context = React.useContext(AuthContext);
            if (!context) throw new Error('AuthContext not found');
            return context;
          }, { wrapper });

          // Wait for authentication check to complete
          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          // Verify: All authentication data is cleared from storage
          expect(StorageService.getToken()).toBeNull();
          expect(StorageService.getUser()).toBeNull();

          // Verify: User is not authenticated
          expect(result.current.isAuthenticated).toBe(false);
          expect(result.current.user).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
