import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch React errors
 * Displays fallback UI instead of crashing the application
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you would send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            padding: '24px',
          }}
        >
          <Result
            status="error"
            title="Something went wrong"
            subTitle="We're sorry, but something unexpected happened. Please try again."
            extra={[
              <Button type="primary" key="reload" onClick={() => window.location.reload()}>
                Reload Page
              </Button>,
              <Button key="reset" onClick={this.handleReset}>
                Try Again
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
