import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './index';
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext.types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Unit Tests', () => {
  const mockLogin = vi.fn();
  
  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    logout: vi.fn(),
    checkAuth: vi.fn(),
    ...overrides,
  });

  const renderLoginPage = (authContextValue?: Partial<AuthContextType>) => {
    const contextValue = createMockAuthContext(authContextValue);
    
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Form Rendering
   * Requirements: 1.1
   */
  describe('Form Rendering', () => {
    it('should render login form with all required elements', () => {
      renderLoginPage();

      // Verify title and subtitle
      expect(screen.getByText('nove Admin')).toBeInTheDocument();
      expect(screen.getByText('Personalized Intelligent Education Platform')).toBeInTheDocument();

      // Verify form fields
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

      // Verify submit button
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render username input field', () => {
      renderLoginPage();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).not.toBeDisabled();
    });

    it('should render password input field', () => {
      renderLoginPage();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).not.toBeDisabled();
    });

    it('should not display error message initially', () => {
      renderLoginPage();
      
      expect(screen.queryByText('Login Failed')).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Form Validation
   * Requirements: 1.5
   */
  describe('Form Validation', () => {
    it('should show validation error when username is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for validation message
      await waitFor(() => {
        expect(screen.getByText('Please enter your username')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should show validation error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(usernameInput, 'testuser');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for validation message
      await waitFor(() => {
        expect(screen.getByText('Please enter your password')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should show validation error when username is only whitespace', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, '   ');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for validation message
      await waitFor(() => {
        expect(screen.getByText('Username cannot be empty')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should show validation error when password is only whitespace', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, '   ');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for validation message
      await waitFor(() => {
        expect(screen.getByText('Password cannot be empty')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should not submit form when both fields are empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for validation messages
      await waitFor(() => {
        expect(screen.getByText('Please enter your username')).toBeInTheDocument();
      });

      // Verify login was not called
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Form Submission
   * Requirements: 1.2
   */
  describe('Form Submission', () => {
    it('should call login function with correct credentials on valid submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Verify login was called with correct credentials
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'admin',
          password: 'password123',
        });
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Verify navigation to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle successful login with different credentials', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'user@example.com');
      await user.type(passwordInput, 'securePass!@#');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'user@example.com',
          password: 'securePass!@#',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  /**
   * Test: Error Display
   * Requirements: 1.4
   */
  describe('Error Display', () => {
    it('should display error message when login fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockLogin.mockRejectedValueOnce(new Error(errorMessage));
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'wronguser');
      await user.type(passwordInput, 'wrongpass');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Login Failed')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display generic error message when error has no message', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error());
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpass');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Verify generic error message is displayed
      await waitFor(() => {
        expect(screen.getByText('Login Failed')).toBeInTheDocument();
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('should clear error message when close button is clicked', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpass');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Login Failed')).toBeInTheDocument();
      });

      // Find and click close button
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      // Verify error is removed
      await waitFor(() => {
        expect(screen.queryByText('Login Failed')).not.toBeInTheDocument();
      });
    });

    it('should not navigate to dashboard when login fails', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Authentication failed'));
      
      renderLoginPage();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'testpass');

      const submitButton = screen.getByRole('button', { name: /login/i });
      await user.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Login Failed')).toBeInTheDocument();
      });

      // Verify navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Loading States
   * Requirements: 1.4
   */
  describe('Loading States', () => {
    it('should show loading state on submit button during login', async () => {
      // Render with isLoading true to simulate loading state
      renderLoginPage({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /login/i });
      
      // Verify button shows loading state
      expect(submitButton).toHaveClass('ant-btn-loading');
    });

    it('should disable form fields during loading', () => {
      renderLoginPage({ isLoading: true });

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('should enable form fields when not loading', () => {
      renderLoginPage({ isLoading: false });

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');

      expect(usernameInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    it('should show loading button when isLoading is true', () => {
      renderLoginPage({ isLoading: true });

      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toHaveClass('ant-btn-loading');
    });
  });
});
