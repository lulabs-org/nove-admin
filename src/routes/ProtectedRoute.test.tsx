import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext.types';
import type { User } from '../types/auth';

describe('ProtectedRoute Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Feature: admin-system-foundation, Property 7: Unauthenticated Route Protection
   * Validates: Requirements 3.1
   * 
   * For any protected route, when an unauthenticated user (no valid token) attempts to access it,
   * the route guard should block access and redirect to the Login page.
   */
  it('should redirect unauthenticated users to login page', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/dashboard', '/students', '/courses', '/settings', '/profile', '/admin'),
        fc.string({ minLength: 2 }).filter(s => s.trim().length > 0), // Non-whitespace strings
        (protectedPath, protectedContent) => {
          // Setup: Create unauthenticated context
          const mockAuthContext: AuthContextType = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            checkAuth: vi.fn(),
          };

          // Render with unauthenticated user trying to access protected route
          const { unmount } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthContext.Provider value={mockAuthContext}>
                <Routes>
                  <Route
                    path="/login"
                    element={<div data-testid="login-page">Login Page</div>}
                  />
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{protectedContent}</div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthContext.Provider>
            </MemoryRouter>
          );

          // Verify: User is redirected to login page
          expect(screen.getByTestId('login-page')).toBeInTheDocument();
          
          // Verify: Protected content is not rendered
          expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
          
          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: admin-system-foundation, Property 8: Authenticated Route Access
   * Validates: Requirements 3.2
   * 
   * For any protected route, when an authenticated user (with valid token) attempts to access it,
   * the route guard should allow access and render the target page.
   */
  it('should allow authenticated users to access protected routes', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/dashboard', '/students', '/courses', '/settings', '/profile', '/admin'),
        fc.string({ minLength: 2 }).filter(s => s.trim().length > 0), // Non-whitespace strings
        fc.record({
          id: fc.string({ minLength: 1 }),
          username: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          countryCode: fc.constant('+86'),
          phone: fc.string({ minLength: 11, maxLength: 11 }),
          emailVerified: fc.boolean(),
          phoneVerified: fc.boolean(),
          lastLoginAt: fc.string(),
          createdAt: fc.string(),
          profile: fc.record({
            name: fc.string(),
            bio: fc.string(),
            firstName: fc.string(),
            lastName: fc.string(),
            gender: fc.string(),
          }),
        }),
        (protectedPath, protectedContent, user) => {
          // Setup: Create authenticated context
          const mockAuthContext: AuthContextType = {
            user: user as User,
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            checkAuth: vi.fn(),
          };

          // Render with authenticated user accessing protected route
          const { unmount, container } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthContext.Provider value={mockAuthContext}>
                <Routes>
                  <Route
                    path="/login"
                    element={<div data-testid="login-page">Login Page</div>}
                  />
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{protectedContent}</div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthContext.Provider>
            </MemoryRouter>
          );

          try {
            // Verify: Protected content is rendered
            const protectedElement = container.querySelector('[data-testid="protected-content"]');
            expect(protectedElement).toBeInTheDocument();
            
            // Verify: User is not redirected to login page
            expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
          } finally {
            // Cleanup after each iteration
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Loading state display
   * Validates that loading spinner is shown while authentication is being checked
   */
  it('should show loading spinner while checking authentication', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/dashboard', '/students', '/courses', '/settings'),
        fc.string({ minLength: 2 }).filter(s => s.trim().length > 0), // Non-whitespace strings
        (protectedPath, protectedContent) => {
          // Setup: Create loading context
          const mockAuthContext: AuthContextType = {
            user: null,
            isAuthenticated: false,
            isLoading: true,
            login: vi.fn(),
            logout: vi.fn(),
            checkAuth: vi.fn(),
          };

          // Render with loading state
          const { unmount, container } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthContext.Provider value={mockAuthContext}>
                <Routes>
                  <Route
                    path="/login"
                    element={<div data-testid="login-page">Login Page</div>}
                  />
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{protectedContent}</div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthContext.Provider>
            </MemoryRouter>
          );

          try {
            // Verify: Loading spinner is displayed (check for aria-busy attribute)
            const spinner = container.querySelector('[aria-busy="true"]');
            expect(spinner).toBeInTheDocument();
            
            // Verify: Protected content is not rendered yet
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
            
            // Verify: Login page is not rendered yet
            expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
          } finally {
            // Cleanup after each iteration
            unmount();
            cleanup();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Custom redirect path
   * Validates that custom redirect paths work correctly
   */
  it('should redirect to custom path when specified', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/dashboard', '/students', '/courses'),
        fc.constantFrom('/custom-login', '/auth', '/signin'),
        fc.string({ minLength: 2 }).filter(s => s.trim().length > 0), // Non-whitespace strings
        (protectedPath, customRedirect, protectedContent) => {
          // Setup: Create unauthenticated context
          const mockAuthContext: AuthContextType = {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            checkAuth: vi.fn(),
          };

          // Render with custom redirect path
          const { unmount } = render(
            <MemoryRouter initialEntries={[protectedPath]}>
              <AuthContext.Provider value={mockAuthContext}>
                <Routes>
                  <Route
                    path={customRedirect}
                    element={<div data-testid="custom-login-page">Custom Login Page</div>}
                  />
                  <Route
                    path={protectedPath}
                    element={
                      <ProtectedRoute redirectTo={customRedirect}>
                        <div data-testid="protected-content">{protectedContent}</div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthContext.Provider>
            </MemoryRouter>
          );

          // Verify: User is redirected to custom login page
          expect(screen.getByTestId('custom-login-page')).toBeInTheDocument();
          
          // Verify: Protected content is not rendered
          expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
          
          // Cleanup
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
