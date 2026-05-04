import React, { Component } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'var(--color-danger-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <FaExclamationTriangle size={32} style={{ color: 'var(--color-danger)' }} />
          </div>
          
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '0.5rem'
          }}>
            حدث خطأ غير متوقع
          </h2>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '1.5rem',
            maxWidth: '400px'
          }}>
            حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.
          </p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              maxWidth: '600px',
              textAlign: 'left',
              overflow: 'auto'
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--color-danger)',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                Error Details:
              </p>
              <pre style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
