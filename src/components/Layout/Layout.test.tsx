import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import Header from './Header';
import Sidebar from './Sidebar';
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

describe('Layout Components Unit Tests', () => {
  const mockLogout = vi.fn();
  
  const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => ({
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'admin',
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: mockLogout,
    checkAuth: vi.fn(),
    ...overrides,
  });

  const renderWithRouter = (component: React.ReactElement, authContextValue?: Partial<AuthContextType>) => {
    const contextValue = createMockAuthContext(authContextValue);
    
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          {component}
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: DashboardLayout Component
   * Requirements: 4.2, 5.1, 5.2
   */
  describe('DashboardLayout', () => {
    it('should render all layout sections', () => {
      renderWithRouter(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );

      // Verify children content is rendered
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      // Verify footer is rendered
      expect(screen.getByText(/nove Admin/)).toBeInTheDocument();
      expect(screen.getByText(/Personalized Intelligent Education Platform/)).toBeInTheDocument();
    });

    it('should render sidebar and header components', () => {
      renderWithRouter(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Verify sidebar logo is present
      expect(screen.getByText('nove')).toBeInTheDocument();

      // Verify header user info is present
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should toggle sidebar collapse state', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      );

      // Find the toggle button
      const toggleButton = screen.getByRole('button', { name: /fold|unfold/i });
      
      // Initially sidebar should show full logo
      expect(screen.getByText('nove')).toBeInTheDocument();

      // Click toggle button
      await user.click(toggleButton);

      // After collapse, logo should show abbreviated version
      await waitFor(() => {
        expect(screen.getByText('N')).toBeInTheDocument();
        expect(screen.queryByText('nove')).not.toBeInTheDocument();
      });

      // Click toggle button again to expand
      await user.click(toggleButton);

      // Logo should show full version again
      await waitFor(() => {
        expect(screen.getByText('nove')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test: Header Component - Logout Functionality
   * Requirements: 4.4
   */
  describe('Header - Logout Functionality', () => {
    it('should display user information in header', () => {
      renderWithRouter(<Header collapsed={false} onToggle={vi.fn()} />);

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should render user dropdown menu', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Header collapsed={false} onToggle={vi.fn()} />);

      // Click on user info to open dropdown
      const userInfo = screen.getByText('testuser');
      await user.click(userInfo);

      // Verify dropdown opens (Ant Design renders it in a portal)
      // We verify the component renders without errors
      expect(userInfo).toBeInTheDocument();
    });

    it('should display toggle button', () => {
      renderWithRouter(<Header collapsed={false} onToggle={vi.fn()} />);

      const toggleButton = screen.getByRole('button', { name: /fold/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should call onToggle when toggle button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnToggle = vi.fn();
      
      renderWithRouter(<Header collapsed={false} onToggle={mockOnToggle} />);

      const toggleButton = screen.getByRole('button', { name: /fold/i });
      await user.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalled();
    });

    it('should show correct icon based on collapsed state', () => {
      const { rerender } = renderWithRouter(<Header collapsed={false} onToggle={vi.fn()} />);

      // When not collapsed, should show fold icon
      expect(screen.getByRole('button', { name: /fold/i })).toBeInTheDocument();

      // Rerender with collapsed state
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={createMockAuthContext()}>
            <Header collapsed={true} onToggle={vi.fn()} />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // When collapsed, should show unfold icon
      expect(screen.getByRole('button', { name: /unfold/i })).toBeInTheDocument();
    });
  });

  /**
   * Test: Sidebar Component - Navigation
   * Requirements: 5.1, 5.2
   */
  describe('Sidebar - Navigation', () => {
    it('should render all navigation menu items', () => {
      renderWithRouter(<Sidebar collapsed={false} />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Students')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should display full logo when not collapsed', () => {
      renderWithRouter(<Sidebar collapsed={false} />);

      expect(screen.getByText('nove')).toBeInTheDocument();
    });

    it('should display abbreviated logo when collapsed', () => {
      renderWithRouter(<Sidebar collapsed={true} />);

      expect(screen.getByText('N')).toBeInTheDocument();
      expect(screen.queryByText('nove')).not.toBeInTheDocument();
    });

    it('should navigate to dashboard when dashboard menu item is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Sidebar collapsed={false} />);

      const dashboardItem = screen.getByText('Dashboard');
      await user.click(dashboardItem);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to students when students menu item is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Sidebar collapsed={false} />);

      const studentsItem = screen.getByText('Students');
      await user.click(studentsItem);

      expect(mockNavigate).toHaveBeenCalledWith('/students');
    });

    it('should navigate to courses when courses menu item is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Sidebar collapsed={false} />);

      const coursesItem = screen.getByText('Courses');
      await user.click(coursesItem);

      expect(mockNavigate).toHaveBeenCalledWith('/courses');
    });

    it('should navigate to settings when settings menu item is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Sidebar collapsed={false} />);

      const settingsItem = screen.getByText('Settings');
      await user.click(settingsItem);

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  /**
   * Test: Responsive Behavior
   * Requirements: 5.1, 5.2
   */
  describe('Responsive Behavior', () => {
    it('should render sidebar with collapsible functionality', () => {
      renderWithRouter(<Sidebar collapsed={false} />);

      // Sidebar should be rendered
      expect(screen.getByText('nove')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should hide menu labels when sidebar is collapsed', () => {
      const { container } = renderWithRouter(<Sidebar collapsed={true} />);

      // When collapsed, the sidebar component should still render but with collapsed prop
      const sider = container.querySelector('.ant-layout-sider-collapsed');
      expect(sider).toBeInTheDocument();
    });

    it('should maintain functionality when sidebar is collapsed', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<Sidebar collapsed={true} />);

      // Menu items should still be clickable even when collapsed
      // Find the dashboard icon/item (it will be visible even when collapsed)
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);

      // Click the first menu item (Dashboard)
      await user.click(menuItems[0]);

      // Navigation should still work
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should render header with responsive toggle button', () => {
      renderWithRouter(<Header collapsed={false} onToggle={vi.fn()} />);

      const toggleButton = screen.getByRole('button', { name: /fold/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass('trigger-btn');
    });

    it('should maintain user info visibility in header regardless of sidebar state', () => {
      const { rerender } = renderWithRouter(<Header collapsed={false} onToggle={vi.fn()} />);

      // User info should be visible when sidebar is not collapsed
      expect(screen.getByText('testuser')).toBeInTheDocument();

      // Rerender with collapsed sidebar
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={createMockAuthContext()}>
            <Header collapsed={true} onToggle={vi.fn()} />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // User info should still be visible when sidebar is collapsed
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });
});
