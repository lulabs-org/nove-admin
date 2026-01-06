import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as authService from './services/auth';
import { StorageService } from './utils/storage';
import type { LoginResponse, User } from './types/auth';

/**
 * Integration Test: Complete Login Flow
 * Requirements: 1.1, 1.2, 1.3, 4.1
 * 
 * Test Flow: unauthenticated → login page → submit credentials → dashboard
 */
describe('Integration Test: Complete Login Flow', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
  };

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token-12345',
    user: mockUser,
    expiresIn: 3600,
  };

  beforeEach(() => {
    // Clear all storage before each test
    StorageService.clear();
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock: { [key: string]: string } = {};
    
    Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    Storage.prototype.removeItem = vi.fn((key: string) => {
      delete localStorageMock[key];
    });
    Storage.prototype.clear = vi.fn(() => {
      Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test: Complete login flow from unauthenticated to dashboard
   * Requirements: 1.1, 1.2, 1.3, 4.1
   */
  it('should complete full login flow: unauthenticated → login page → submit credentials → dashboard', async () => {
    const user = userEvent.setup();

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(mockLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(mockUser);

    // Step 1: Render app (should show login page for unauthenticated user)
    render(<App />);

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    // Step 2: Verify login page is displayed (Requirement 1.1)
    expect(screen.getByText('nove Admin')).toBeInTheDocument();
    expect(screen.getByText('Personalized Intelligent Education Platform')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Step 3: Fill in login credentials
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    // Verify inputs are filled
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');

    // Step 4: Submit login form (Requirement 1.2)
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Verify login API was called with correct credentials
    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });

    // Step 5: Verify redirect to dashboard after successful login (Requirement 1.3, 4.1)
    await waitFor(() => {
      // Dashboard should be visible
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify dashboard layout components are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Active Courses')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();

    // Verify user information is displayed in header
    expect(screen.getByText('testuser')).toBeInTheDocument();

    // Verify login page is no longer visible
    expect(screen.queryByPlaceholderText('Username')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();

    // Verify authentication token was stored
    expect(localStorage.setItem).toHaveBeenCalledWith('nove_admin_token', mockLoginResponse.token);
    expect(localStorage.setItem).toHaveBeenCalledWith('nove_admin_user', JSON.stringify(mockUser));

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
  });

  /**
   * Test: Login flow with different credentials
   * Requirements: 1.1, 1.2, 1.3, 4.1
   */
  it('should handle login flow with different user credentials', async () => {
    const user = userEvent.setup();

    const differentUser: User = {
      id: '2',
      username: 'adminuser',
      email: 'admin@example.com',
      role: 'superadmin',
    };

    const differentLoginResponse: LoginResponse = {
      token: 'different-jwt-token-67890',
      user: differentUser,
      expiresIn: 7200,
    };

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(differentLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(differentUser);

    // Render app
    render(<App />);

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    // Fill in different credentials
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'adminuser');
    await user.type(passwordInput, 'adminpass456');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Verify login was called with correct credentials
    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        username: 'adminuser',
        password: 'adminpass456',
      });
    });

    // Verify dashboard is displayed with correct user
    await waitFor(() => {
      expect(screen.getByText('Welcome back, adminuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('adminuser')).toBeInTheDocument();

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
  });

  /**
   * Test: Failed login does not navigate to dashboard
   * Requirements: 1.2, 1.4
   */
  it('should remain on login page when login fails', async () => {
    const user = userEvent.setup();

    // Mock login to fail
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockRejectedValue(
      new Error('Invalid credentials')
    );

    // Render app
    render(<App />);

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    // Verify we're on login page
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();

    // Fill in credentials
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Login Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Verify we're still on login page (not navigated to dashboard)
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument();

    // Clean up
    loginSpy.mockRestore();
  });

  /**
   * Test: Unauthenticated user accessing root redirects to login
   * Requirements: 1.1
   */
  it('should redirect unauthenticated user from root to login page', async () => {
    // Mock getCurrentUser to fail (no valid token)
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockRejectedValue(
      new Error('Unauthorized')
    );

    // Render app
    render(<App />);

    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    // Verify login page is displayed
    expect(screen.getByText('nove Admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Clean up
    getCurrentUserSpy.mockRestore();
  });
});

/**
 * Integration Test: Session Persistence
 * Requirements: 2.2
 * 
 * Test Flow: login → refresh page → still authenticated
 */
describe('Integration Test: Session Persistence', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
  };

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token-12345',
    user: mockUser,
    expiresIn: 3600,
  };

  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear all storage before each test
    localStorageMock = {};
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock localStorage with persistent storage across renders
    Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    Storage.prototype.removeItem = vi.fn((key: string) => {
      delete localStorageMock[key];
    });
    Storage.prototype.clear = vi.fn(() => {
      Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test: Session persists after page refresh
   * Requirements: 2.2
   */
  it('should maintain login state after page refresh', async () => {
    const user = userEvent.setup();

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(mockLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(mockUser);

    // Step 1: Initial render and login
    const { unmount } = render(<App />);

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    // Verify login page is displayed
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();

    // Fill in login credentials
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    // Submit login form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Wait for successful login and redirect to dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify token and user are stored in localStorage
    expect(localStorageMock['nove_admin_token']).toBe(mockLoginResponse.token);
    expect(localStorageMock['nove_admin_user']).toBe(JSON.stringify(mockUser));

    // Step 2: Simulate page refresh by unmounting and re-rendering
    unmount();

    // Re-render the app (simulating page refresh)
    render(<App />);

    // Step 3: Verify user is still authenticated after refresh
    // The app should call getCurrentUser with the stored token
    await waitFor(() => {
      expect(getCurrentUserSpy).toHaveBeenCalled();
    });

    // Wait for dashboard to be displayed (user should still be authenticated)
    await waitFor(() => {
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify dashboard is displayed (not login page)
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Username')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();

    // Verify token and user are still in localStorage
    expect(localStorageMock['nove_admin_token']).toBe(mockLoginResponse.token);
    expect(localStorageMock['nove_admin_user']).toBe(JSON.stringify(mockUser));

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
  });

  /**
   * Test: Session persistence with different users
   * Requirements: 2.2
   */
  it('should maintain correct user session after page refresh', async () => {
    const user = userEvent.setup();

    const differentUser: User = {
      id: '2',
      username: 'adminuser',
      email: 'admin@example.com',
      role: 'superadmin',
    };

    const differentLoginResponse: LoginResponse = {
      token: 'different-jwt-token-67890',
      user: differentUser,
      expiresIn: 7200,
    };

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(differentLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(differentUser);

    // Step 1: Login with different user
    const { unmount } = render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'adminuser');
    await user.type(passwordInput, 'adminpass456');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, adminuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify correct token and user are stored
    expect(localStorageMock['nove_admin_token']).toBe(differentLoginResponse.token);
    expect(localStorageMock['nove_admin_user']).toBe(JSON.stringify(differentUser));

    // Step 2: Simulate page refresh
    unmount();
    render(<App />);

    // Step 3: Verify correct user is still authenticated
    await waitFor(() => {
      expect(screen.getByText('Welcome back, adminuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('adminuser')).toBeInTheDocument();
    expect(localStorageMock['nove_admin_token']).toBe(differentLoginResponse.token);

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
  });

  /**
   * Test: Invalid token after refresh redirects to login
   * Requirements: 2.2, 2.3
   */
  it('should redirect to login if stored token is invalid after refresh', async () => {
    // Pre-populate localStorage with an invalid token
    localStorageMock['nove_admin_token'] = 'invalid-token';
    localStorageMock['nove_admin_user'] = JSON.stringify(mockUser);

    // Mock getCurrentUser to fail (invalid token)
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockRejectedValue(
      new Error('Unauthorized')
    );

    // Render app (simulating page load with invalid token)
    render(<App />);

    // Wait for auth check to complete and login page to appear
    await waitFor(() => {
      expect(screen.getByText('nove Admin')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify user is redirected to login page
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Verify dashboard is not displayed
    expect(screen.queryByText('Welcome back')).not.toBeInTheDocument();

    // Verify localStorage was cleared (invalid session cleanup)
    // StorageService.clear() calls removeItem for token and user
    expect(localStorage.removeItem).toHaveBeenCalledWith('nove_admin_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('nove_admin_user');

    // Clean up
    getCurrentUserSpy.mockRestore();
  });
});

/**
 * Integration Test: Logout Flow
 * Requirements: 2.4, 4.4
 * 
 * Test Flow: authenticated → dashboard → logout → login page
 */
describe('Integration Test: Logout Flow', () => {
  const mockUser: User = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
  };

  const mockLoginResponse: LoginResponse = {
    token: 'mock-jwt-token-12345',
    user: mockUser,
    expiresIn: 3600,
  };

  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear all storage before each test
    localStorageMock = {};
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock localStorage with persistent storage
    Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
    Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    Storage.prototype.removeItem = vi.fn((key: string) => {
      delete localStorageMock[key];
    });
    Storage.prototype.clear = vi.fn(() => {
      Object.keys(localStorageMock).forEach(key => delete localStorageMock[key]);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test: Complete logout flow from authenticated dashboard to login page
   * Requirements: 2.4, 4.4
   */
  it('should complete full logout flow: authenticated → dashboard → logout → login page', async () => {
    const user = userEvent.setup();

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(mockLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(mockUser);
    const logoutSpy = vi.spyOn(authService.authApi, 'logout').mockResolvedValue(undefined);

    // Step 1: Login to get to authenticated state
    render(<App />);

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    // Fill in login credentials
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    // Submit login form
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Step 2: Verify we're on the dashboard (authenticated state)
    await waitFor(() => {
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify dashboard is displayed
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();

    // Verify token and user are stored in localStorage
    expect(localStorageMock['nove_admin_token']).toBe(mockLoginResponse.token);
    expect(localStorageMock['nove_admin_user']).toBe(JSON.stringify(mockUser));

    // Step 3: Click user dropdown to reveal logout option (Requirement 4.4)
    const userDropdown = screen.getByText('testuser');
    expect(userDropdown).toBeInTheDocument();
    
    await user.click(userDropdown);

    // Wait for dropdown menu to appear and click logout
    await waitFor(() => {
      const logoutMenuItem = screen.getByText('Logout');
      expect(logoutMenuItem).toBeInTheDocument();
    });

    const logoutMenuItem = screen.getByText('Logout');
    await user.click(logoutMenuItem);

    // Verify logout API was called
    await waitFor(() => {
      expect(logoutSpy).toHaveBeenCalled();
    });

    // Step 4: Verify redirect to login page after logout (Requirement 2.4)
    await waitFor(() => {
      expect(screen.getByText('nove Admin')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify dashboard is no longer visible
    expect(screen.queryByText('Welcome back, testuser!')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    // Verify authentication information was cleared from localStorage (Requirement 2.4)
    expect(localStorage.removeItem).toHaveBeenCalledWith('nove_admin_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('nove_admin_user');
    expect(localStorageMock['nove_admin_token']).toBeUndefined();
    expect(localStorageMock['nove_admin_user']).toBeUndefined();

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
    logoutSpy.mockRestore();
  });

  /**
   * Test: Logout flow with different user
   * Requirements: 2.4, 4.4
   */
  it('should handle logout flow for different users', async () => {
    const user = userEvent.setup();

    const differentUser: User = {
      id: '2',
      username: 'adminuser',
      email: 'admin@example.com',
      role: 'superadmin',
    };

    const differentLoginResponse: LoginResponse = {
      token: 'different-jwt-token-67890',
      user: differentUser,
      expiresIn: 7200,
    };

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(differentLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(differentUser);
    const logoutSpy = vi.spyOn(authService.authApi, 'logout').mockResolvedValue(undefined);

    // Step 1: Login with different user
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'adminuser');
    await user.type(passwordInput, 'adminpass456');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Step 2: Verify dashboard with correct user
    await waitFor(() => {
      expect(screen.getByText('Welcome back, adminuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('adminuser')).toBeInTheDocument();
    expect(localStorageMock['nove_admin_token']).toBe(differentLoginResponse.token);

    // Step 3: Click user dropdown and logout
    const userDropdown = screen.getByText('adminuser');
    await user.click(userDropdown);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    const logoutMenuItem = screen.getByText('Logout');
    await user.click(logoutMenuItem);

    // Step 4: Verify redirect to login page
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.queryByText('Welcome back, adminuser!')).not.toBeInTheDocument();
    expect(localStorageMock['nove_admin_token']).toBeUndefined();
    expect(localStorageMock['nove_admin_user']).toBeUndefined();

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
    logoutSpy.mockRestore();
  });

  /**
   * Test: Logout clears all authentication data
   * Requirements: 2.4
   */
  it('should clear all authentication information on logout', async () => {
    const user = userEvent.setup();

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(mockLoginResponse);
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockResolvedValue(mockUser);
    const logoutSpy = vi.spyOn(authService.authApi, 'logout').mockResolvedValue(undefined);

    // Login first
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify data is stored
    expect(localStorageMock['nove_admin_token']).toBeTruthy();
    expect(localStorageMock['nove_admin_user']).toBeTruthy();

    // Logout - click user dropdown first
    const userDropdown = screen.getByText('testuser');
    await user.click(userDropdown);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    const logoutMenuItem = screen.getByText('Logout');
    await user.click(logoutMenuItem);

    // Verify all authentication data is cleared
    await waitFor(() => {
      expect(localStorageMock['nove_admin_token']).toBeUndefined();
      expect(localStorageMock['nove_admin_user']).toBeUndefined();
    });

    // Verify removeItem was called for both token and user
    expect(localStorage.removeItem).toHaveBeenCalledWith('nove_admin_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('nove_admin_user');

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
    logoutSpy.mockRestore();
  });

  /**
   * Test: Cannot access dashboard after logout
   * Requirements: 2.4, 3.1
   */
  it('should prevent access to dashboard after logout', async () => {
    const user = userEvent.setup();

    // Mock the auth API calls
    const loginSpy = vi.spyOn(authService.authApi, 'login').mockResolvedValue(mockLoginResponse);
    let getCurrentUserCallCount = 0;
    const getCurrentUserSpy = vi.spyOn(authService.authApi, 'getCurrentUser').mockImplementation(() => {
      getCurrentUserCallCount++;
      // First call succeeds (after login), subsequent calls fail (after logout)
      if (getCurrentUserCallCount === 1) {
        return Promise.resolve(mockUser);
      }
      return Promise.reject(new Error('Unauthorized'));
    });
    const logoutSpy = vi.spyOn(authService.authApi, 'logout').mockResolvedValue(undefined);

    // Login first
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });

    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Logout - click user dropdown first
    const userDropdown = screen.getByText('testuser');
    await user.click(userDropdown);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    const logoutMenuItem = screen.getByText('Logout');
    await user.click(logoutMenuItem);

    // Wait for redirect to login page
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify dashboard is not accessible
    expect(screen.queryByText('Welcome back, testuser!')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    // Verify user is on login page
    expect(screen.getByText('nove Admin')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Clean up
    loginSpy.mockRestore();
    getCurrentUserSpy.mockRestore();
    logoutSpy.mockRestore();
  });
});
