import React from 'react';
import './Loading.css';

const Loading = ({ 
  type = 'spinner', 
  size = 'medium', 
  fullScreen = false, 
  overlay = false,
  text = 'Loading...',
  className = ''
}) => {
  const loadingClass = `loading loading-${type} loading-${size} ${fullScreen ? 'loading-fullscreen' : ''} ${overlay ? 'loading-overlay' : ''} ${className}`;

  const renderLoadingContent = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'bar':
        return (
          <div className="loading-bar">
            <div className="bar-fill"></div>
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-content">
          {renderLoadingContent()}
          {text && <p className="loading-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={loadingClass}>
      {renderLoadingContent()}
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// Specialized loading components
export const PageLoading = ({ text = 'Loading page...' }) => (
  <Loading type="spinner" size="large" fullScreen text={text} />
);

export const ButtonLoading = ({ text = 'Loading...' }) => (
  <Loading type="spinner" size="small" text={text} />
);

export const TableLoading = ({ text = 'Loading data...' }) => (
  <Loading type="dots" size="medium" text={text} />
);

export const ModalLoading = ({ text = 'Loading...' }) => (
  <Loading type="spinner" size="medium" overlay text={text} />
);

export default Loading;
