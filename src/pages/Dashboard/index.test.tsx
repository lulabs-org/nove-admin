import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './index';
import { AuthContext, type AuthContextType } from '../../contexts/AuthContext.types';

/**
 * Dashboard Page Unit Tests
 * Requirements: 4.2
 */
describe('Dashboard Page Unit Tests', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    countryCode: '+86',
    phone: '13800138000',
    emailVerified: true,
    phoneVerified: true,
    lastLoginAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    profile: {
      name: 'Test User',
      bio: 'Test bio',
      firstName: 'Test',
      lastName: 'User',
      gender: 'male',
    },
  };

  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
    ...overrides,
  });

  const renderDashboard = (authContextValue?: Partial<AuthContextType>) => {
    const contextValue = createMockAuthContext(authContextValue);
    
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <Dashboard />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Dashboard renders with layout components
   * Requirements: 4.2
   */
  describe('Layout Components', () => {
    it('should render dashboard with DashboardLayout wrapper', () => {
      renderDashboard();

      // Verify the layout structure is present
      // DashboardLayout includes header, sidebar, content, and footer
      expect(screen.getByText(/nove Admin ©/)).toBeInTheDocument();
    });

    it('should render header component within layout', () => {
      renderDashboard();

      // Header should contain user information
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should render sidebar navigation within layout', () => {
      renderDashboard();

      // Sidebar should contain navigation menu items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render footer within layout', () => {
      renderDashboard();

      // Footer should contain copyright text
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`nove Admin ©${currentYear} - Personalized Intelligent Education Platform`)).toBeInTheDocument();
    });

    it('should render main content area within layout', () => {
      renderDashboard();

      // Main content should include welcome message
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    });
  });

  /**
   * Test: Dashboard content rendering
   * Requirements: 4.2
   */
  describe('Dashboard Content', () => {
    it('should display welcome message with username', () => {
      renderDashboard();

      expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    });

    it('should display statistics cards', () => {
      renderDashboard();

      // Verify all statistic cards are present
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      expect(screen.getByText('Active Courses')).toBeInTheDocument();
      expect(screen.getByText('Instructors')).toBeInTheDocument();
      expect(screen.getByText('Growth Rate')).toBeInTheDocument();
    });

    it('should display recent activity section', () => {
      renderDashboard();

      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('should display quick actions section', () => {
      renderDashboard();

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should render with different user', () => {
      const differentUser = {
        id: '2',
        username: 'adminuser',
        email: 'admin@example.com',
        countryCode: '+86',
        phone: '13900139000',
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: '2024-01-02T00:00:00Z',
        createdAt: '2024-01-02T00:00:00Z',
        profile: {
          name: 'Admin User',
          bio: 'Admin bio',
          firstName: 'Admin',
          lastName: 'User',
          gender: 'male',
        },
      };

      renderDashboard({ user: differentUser });

      expect(screen.getByText('Welcome back, adminuser!')).toBeInTheDocument();
    });
  });
});
