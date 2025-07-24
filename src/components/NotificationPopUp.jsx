import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const NotificationPopUp = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 15000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        width: '400px',
        maxWidth: '90%',
      }}>
        <div style={{ fontSize: '48px', color: '#4caf50', marginBottom: '16px' }}>✓</div>
        <h3 style={{ marginBottom: '12px', color: '#333' }}>Email Sent</h3>
        <p style={{ color: '#666' }}>Your documents have been sent to MOH  for review. We Will contact you with the results!</p>
        <button
          onClick={onClose}
          style={{
            marginTop: '24px',
            padding: '10px 24px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

// Function to show the notification popup
export function showEmailNotificationModal() {
  // Create container div
  const container = document.createElement('div');
  container.id = 'notification-popup-root';
  document.body.appendChild(container);

  // Create root and render
  const root = createRoot(container);
  
  // Handle close function
  const handleClose = () => {
    root.unmount();
    container.remove();
  };

  // Render the popup
  root.render(<NotificationPopUp onClose={handleClose} />);
}

export default NotificationPopUp;