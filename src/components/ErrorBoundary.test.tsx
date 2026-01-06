import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import ErrorBoundary from './ErrorBoundary';
import type { ReactNode } from 'react';

/**
 * Feature: admin-system-foundation, Property 11: Error Boundary Protection
 * 
 * For any unexpected runtime error in React components, the system should catch 
 * the error with an error boundary and display a generic error message instead 
 * of crashing the application.
 * 
 * Validates: Requirements 7.3
 */

// Component that throws an error
const ThrowError = ({ error }: { error: Error }) => {
  throw error;
};

// Component that renders normally
const NormalComponent = ({ children }: { children?: ReactNode }) => {
  return <div data-testid="normal-component">{children || 'Normal content'}</div>;
};

describe('ErrorBoundary - Property-Based Tests', () => {
  afterEach(() => {
    cleanup();
  });

  it('Property 11: Error Boundary Protection - catches any runtime error and displays fallback UI', () => {
    // Suppress console.error for this test since we're intentionally throwing errors
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(
        // Generate arbitrary error messages and names
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        (errorMessage, errorName) => {
          // Create an error with random message and name
          const error = new Error(errorMessage);
          error.name = errorName;

          // Render component that throws error inside ErrorBoundary
          const { container, unmount } = render(
            <ErrorBoundary>
              <ThrowError error={error} />
            </ErrorBoundary>
          );

          // Verify error boundary caught the error and displays fallback UI
          const errorTitle = screen.getAllByText('Something went wrong')[0];
          expect(errorTitle).toBeInTheDocument();
          
          const errorSubtitle = screen.getAllByText(/We're sorry, but something unexpected happened/i)[0];
          expect(errorSubtitle).toBeInTheDocument();

          // Verify interactive buttons are present (Property 12 validation)
          const buttons = screen.getAllByRole('button');
          expect(buttons.length).toBeGreaterThanOrEqual(2);

          // Verify the application didn't crash (container still exists)
          expect(container).toBeInTheDocument();

          // Clean up for next iteration
          unmount();
          consoleError.mockClear();
        }
      ),
      { numRuns: 100 }
    );

    consoleError.mockRestore();
  });

  it('Property 11: Error Boundary Protection - renders children normally when no error occurs', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary content strings
        fc.string({ minLength: 0, maxLength: 100 }),
        (content) => {
          // Render normal component inside ErrorBoundary
          const { unmount } = render(
            <ErrorBoundary>
              <NormalComponent>{content}</NormalComponent>
            </ErrorBoundary>
          );

          // Verify normal component renders without error boundary UI
          const normalComponents = screen.getAllByTestId('normal-component');
          expect(normalComponents.length).toBeGreaterThan(0);
          expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();

          // Clean up for next iteration
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
