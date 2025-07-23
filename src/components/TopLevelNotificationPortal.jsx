// components/TopLevelNotificationPortal.jsx
import { createPortal } from 'react-dom';
import { useEffect } from 'react';

const TopLevelNotificationPortal = ({ children, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20000, // 👈 must be higher than ModalPortal
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }}>
      {children}
    </div>,
    document.body
  );
};

export default TopLevelNotificationPortal;
