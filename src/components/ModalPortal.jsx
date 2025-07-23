import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const ModalPortal = ({ children, open, onClose }) => {
  useEffect(() => {
    if (open) {
      // Disable scrolling when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle escape key press to close modal
      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Cleanup: re-enable scrolling and remove event listener
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [open, onClose]);
  
  // If not open, don't render anything
  if (!open) return null;
  
  // Create portal to render modal outside the normal DOM hierarchy
  return createPortal(
    <div 
      className="modal-portal-overlay" 
      onClick={(e) => {
        // Close modal when clicking overlay (not content)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        padding: 0,
        margin: 0,
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div 
        className="modal-portal-content"
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 10001,
          maxHeight: '90vh',
          width: '95%',
          maxWidth: '1400px', 
          overflow: 'auto',
          margin: '20px',
          padding: '20px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body // Render directly into body element
  );
};

export default ModalPortal; 