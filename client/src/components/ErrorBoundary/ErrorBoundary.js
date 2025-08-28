import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // In production, you could send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo, errorId);
    }
  }

  logErrorToService = (error, errorInfo, errorId) => {
    // Example: Send to Sentry, LogRocket, or your own error tracking service
    try {
      // You can implement your error logging logic here
      console.error('Error logged with ID:', errorId, error, errorInfo);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      componentStack: errorInfo?.componentStack || '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // In production, send this to your error reporting service
    console.log('Error report:', errorReport);
    
    // You could also open a support ticket or send email
    const supportEmail = 'support@jhubafrica.com';
    const subject = `Error Report - ${errorId}`;
    const body = `Please include this error ID: ${errorId}\n\nError details:\n${JSON.stringify(errorReport, null, 2)}`;
    
    window.open(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <h1>Something went wrong</h1>
            <p>We're sorry, but something unexpected happened. Our team has been notified.</p>
            
            {this.state.errorId && (
              <div className="error-id">
                <strong>Error ID:</strong> {this.state.errorId}
              </div>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleReload} className="btn-primary">
                Try Again
              </button>
              <button onClick={this.handleGoHome} className="btn-secondary">
                Go Home
              </button>
              <button onClick={this.handleReportError} className="btn-outline">
                Report Issue
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
