# Design Document: Admin System Foundation

## Overview

The nove-admin backend management system is a React-based single-page application (SPA) that provides a modern, secure interface for managing the nove education platform. The system implements a clean architecture with clear separation between UI components, business logic, and data access layers.

The design leverages React 18+ with TypeScript for type safety, React Router v6 for navigation, Context API for state management, and Ant Design as the UI component library. The application communicates with the nove-api backend via RESTful APIs using axios for HTTP requests.

Key architectural principles:
- Component-based architecture with reusable UI elements
- Context-based state management for authentication and global state
- Protected routing with authentication guards
- Responsive design supporting desktop and mobile devices
- Environment-based configuration for different deployment targets

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     nove-admin (React SPA)                   │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Login Page   │  │  Dashboard   │  │ Other Pages  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Context │  │ Route Guards │  │  API Client  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Local Storage│  │ HTTP Client  │  │ Router Config│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │   nove-api       │
                  │  (NestJS Backend)│
                  └──────────────────┘
```

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Sidebar, Footer)
│   └── common/         # Common components (Button, Input, etc.)
├── pages/              # Page components
│   ├── Login/          # Login page
│   └── Dashboard/      # Dashboard page
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication context
├── types/              # TypeScript type definitions
│   ├── auth.ts         # Authentication types
│   └── api.ts          # API response types
├── services/           # API service layer
│   ├── api.ts          # Axios instance configuration
│   └── auth.ts         # Authentication API calls
├── utils/              # Utility functions
│   ├── storage.ts      # Local storage helpers
│   └── validators.ts   # Form validation helpers
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── routes/             # Route configuration
│   ├── index.tsx       # Route definitions
│   └── ProtectedRoute.tsx # Route guard component
├── App.tsx             # Root application component
└── main.tsx            # Application entry point
```

## Components and Interfaces

### 1. Authentication Context

The AuthContext provides global authentication state and methods throughout the application.

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// Provider component wraps the entire application
const AuthProvider: React.FC<{ children: React.ReactNode }> => JSX.Element
```

### 2. API Service Layer

The API service layer handles all HTTP communication with the nove-api backend.

```typescript
// Axios instance with interceptors
interface ApiConfig {
  baseURL: string;
  timeout: number;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: User;
  expiresIn: number;
}

interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// API methods
const authApi = {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
  refreshToken: () => Promise<{ token: string }>;
}
```

### 3. Protected Route Component

The ProtectedRoute component guards routes that require authentication.

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> => JSX.Element
```

Implementation logic:
- Check if user is authenticated via AuthContext
- If authenticated, render children components
- If not authenticated, redirect to login page
- Show loading state while checking authentication

### 4. Login Page Component

```typescript
interface LoginFormData {
  username: string;
  password: string;
}

interface LoginPageState {
  isSubmitting: boolean;
  error: string | null;
}

const LoginPage: React.FC => JSX.Element
```

Features:
- Form with username and password fields
- Client-side validation (required fields, format checks)
- Loading state during submission
- Error message display
- Redirect to dashboard on success

### 5. Dashboard Layout Component

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> => JSX.Element
```

Structure:
- Header: Logo, user info, logout button
- Sidebar: Navigation menu (collapsible on mobile)
- Content: Main content area
- Footer: Copyright and links

### 6. Storage Utility

```typescript
interface StorageService {
  setToken: (token: string) => void;
  getToken: () => string | null;
  removeToken: () => void;
  setUser: (user: User) => void;
  getUser: () => User | null;
  removeUser: () => void;
  clear: () => void;
}
```

## Data Models

### User Model

```typescript
interface User {
  id: string;              // Unique user identifier
  username: string;        // Username for login
  email: string;           // User email address
  role: string;            // User role (admin, manager, etc.)
  createdAt?: string;      // Account creation timestamp
  lastLoginAt?: string;    // Last login timestamp
}
```

### Authentication Token

```typescript
interface AuthToken {
  token: string;           // JWT token string
  expiresIn: number;       // Token expiration time in seconds
  refreshToken?: string;   // Optional refresh token
}
```

### API Response Wrapper

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
  timestamp: string;
}
```

### Form Validation

```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
```

## Error Handling

### Error Types

1. **Network Errors**: Connection failures, timeouts
2. **Authentication Errors**: Invalid credentials, expired tokens
3. **Authorization Errors**: Insufficient permissions
4. **Validation Errors**: Invalid input data
5. **Server Errors**: 5xx status codes

### Error Handling Strategy

```typescript
interface ErrorHandler {
  handleNetworkError: (error: Error) => void;
  handleAuthError: (error: ApiError) => void;
  handleValidationError: (errors: Record<string, string>) => void;
  handleServerError: (error: ApiError) => void;
}
```

Implementation approach:
- Axios interceptors catch HTTP errors globally
- Authentication errors trigger automatic logout and redirect
- User-friendly error messages displayed via Ant Design notifications
- Error logging for debugging (console in dev, external service in prod)
- Retry mechanism for transient network failures

### Error Display

- Use Ant Design's `message` component for temporary notifications
- Use `notification` component for important errors requiring user action
- Display inline validation errors in forms
- Show error boundaries for unexpected React errors

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Unit Testing

Unit tests will verify specific examples, edge cases, and integration points:

- **Component Tests**: Test individual components render correctly with various props
- **Hook Tests**: Test custom hooks like useAuth with different states
- **Service Tests**: Test API service methods with mocked responses
- **Utility Tests**: Test validation functions, storage helpers with specific inputs
- **Integration Tests**: Test user flows like login → dashboard navigation

Testing tools:
- Vitest as test runner
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using fast-check library. Each test will run a minimum of 100 iterations to ensure comprehensive input coverage.

Test configuration:
- Library: fast-check
- Minimum iterations: 100 per property
- Each test tagged with: `Feature: admin-system-foundation, Property {N}: {description}`


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Successful Login Token Storage and Redirection

*For any* successful login with valid credentials, the system should store the authentication token in local storage and redirect the user to the Dashboard page.

**Validates: Requirements 1.3, 2.1**

### Property 2: Login Validation Failure Handling

*For any* login attempt with invalid credentials, the system should display an error message, not create a session, and not store any authentication token.

**Validates: Requirements 1.4**

### Property 3: Input Validation Before Submission

*For any* login form input that is empty or invalid format (e.g., whitespace-only strings), the system should display validation error messages and prevent form submission.

**Validates: Requirements 1.5**

### Property 4: Session Persistence Across Page Refresh

*For any* valid authentication token stored in local storage, when the page is refreshed, the system should maintain the login state and display the Dashboard without requiring re-authentication.

**Validates: Requirements 2.2**

### Property 5: Invalid Session Cleanup

*For any* expired or invalid authentication token, the system should clear all authentication information from local storage and redirect the user to the Login page.

**Validates: Requirements 2.3**

### Property 6: Logout Cleanup

*For any* authenticated user who initiates logout, the system should clear all authentication information from local storage and redirect to the Login page.

**Validates: Requirements 2.4**

### Property 7: Unauthenticated Route Protection

*For any* protected route, when an unauthenticated user (no valid token) attempts to access it, the route guard should block access and redirect to the Login page.

**Validates: Requirements 3.1**

### Property 8: Authenticated Route Access

*For any* protected route, when an authenticated user (with valid token) attempts to access it, the route guard should allow access and render the target page.

**Validates: Requirements 3.2**

### Property 9: Network Error Display

*For any* network request that fails (timeout, connection error, etc.), the system should display a user-friendly error message to the user.

**Validates: Requirements 7.1**

### Property 10: API Error Parsing and Display

*For any* API response with an error status code (4xx, 5xx), the system should parse the error information and display it to the user in a readable format.

**Validates: Requirements 7.2**

### Property 11: Error Boundary Protection

*For any* unexpected runtime error in React components, the system should catch the error with an error boundary and display a generic error message instead of crashing the application.

**Validates: Requirements 7.3**

### Property 12: Error Message Interactivity

*For any* error message displayed to the user, the system should provide interactive options to either close the message or retry the failed operation.

**Validates: Requirements 7.4**
