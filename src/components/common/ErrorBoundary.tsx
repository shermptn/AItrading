import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // This lifecycle method is called after an error has been thrown by a descendant component.
    // It should return a value to update state.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-center">
          <h3 className="text-red-400 font-semibold">Widget Error</h3>
          <p className="text-red-500 text-sm mt-1">This component failed to load.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
