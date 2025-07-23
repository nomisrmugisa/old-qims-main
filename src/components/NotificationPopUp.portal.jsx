import ReactDOM from 'react-dom';
import NotificationPopUp from './NotificationPopUp.portal';
import React from 'react';

let container = null;

export function showEmailNotificationModal() {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
  }

  const handleClose = () => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    container = null;
  };

  ReactDOM.render(<NotificationPopUp onClose={handleClose} />, container);
}
