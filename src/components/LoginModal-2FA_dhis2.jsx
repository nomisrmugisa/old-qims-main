// components/LoginModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import './LoginModal.css';

const LoginModal = ({ show, onClose, onLogin }) => {
  const modalRef = useRef();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  // Clean up blob URLs when component unmounts or qrCodeData changes
  useEffect(() => {
    return () => {
      if (qrCodeData && qrCodeData.qrCode && qrCodeData.qrCode.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeData.qrCode);
      }
    };
  }, [qrCodeData]);

  const check2FAStatus = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to check 2FA status');
      
      const data = await response.json();
      return data.twoFactorEnabled || false;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  };

  const get2FASetup = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/40/2fa/qrCode`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'image/png, image/jpeg, image/*, */*', // Accept multiple image formats
          'Cache-Control': 'no-cache'
        },
        mode: 'cors', // Ensure CORS is handled
        credentials: 'omit' // Don't send cookies
      });

      console.log('QR Code Response status:', response.status);
      console.log('QR Code Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check what content type we actually got
      const contentType = response.headers.get('content-type');
      console.log('QR Code Content-Type:', contentType);

      if (contentType && contentType.startsWith('image/')) {
        // It's an image - convert to blob and create object URL
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        return {
          qrCode: imageUrl,
          contentType: contentType
        };
      } else if (contentType && contentType.includes('json')) {
        // It's JSON - parse normally
        const data = await response.json();
        return data;
      } else {
        // Unknown format - try to handle as image anyway
        console.log('Unknown content type, treating as image');
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        return {
          qrCode: imageUrl,
          contentType: 'unknown'
        };
      }

    } catch (error) {
      console.error('Error getting 2FA setup:', error);
      throw error;
    }
  };

  // Alternative method if the primary method fails
  const get2FASetupWithFormat = async (credentials) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/40/2fa/qrCode?format=png`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'image/png'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      return {
        qrCode: imageUrl,
        contentType: 'image/png'
      };
    } catch (error) {
      console.error('Error getting 2FA setup with format:', error);
      throw error;
    }
  };

  // Fallback method using direct image loading
  const get2FASetupAlternative = async (credentials) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Create a temporary canvas to handle the authenticated request
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = function() {
        try {
          // Draw image to canvas and convert to data URL
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/png');
          resolve({
            qrCode: dataUrl,
            contentType: 'image/png'
          });
        } catch (error) {
          reject(new Error('Failed to process QR code image'));
        }
      };
      
      img.onerror = function() {
        reject(new Error('Failed to load QR code image'));
      };
      
      // Set crossOrigin before src
      img.crossOrigin = 'anonymous';
      img.src = `${import.meta.env.VITE_DHIS2_URL}/api/40/2fa/qrCode?t=${Date.now()}`;
    });
  };

  const verify2FACode = async (credentials, code) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/40/2fa/enabled`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) throw new Error('Failed to verify 2FA code');
      return true;
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      throw error;
    }
  };

  const handleSetup2FA = async () => {
    const credentials = btoa(`public:Public@123$$$`);
    setIsSettingUp2FA(true);
    setErrorMessage('');

    try {
      // First check if 2FA is already enabled
      const isEnabled = await check2FAStatus(credentials);
      if (isEnabled) {
        setErrorMessage('Two-factor authentication is already enabled for this account.');
        setIsSettingUp2FA(false);
        return;
      }

      let setupData;
      
      // Try primary method first
      try {
        console.log('Trying primary QR code method...');
        setupData = await get2FASetup(credentials);
        console.log('Primary method successful:', setupData);
      } catch (error1) {
        console.log('Primary method failed, trying method with format parameter...');
        
        // Try method with format parameter
        try {
          setupData = await get2FASetupWithFormat(credentials);
          console.log('Format method successful:', setupData);
        } catch (error2) {
          console.log('Format method failed, trying direct image loading...');
          
          // Try direct image loading (might not work due to CORS)
          try {
            setupData = await get2FASetupAlternative(credentials);
            console.log('Alternative method successful:', setupData);
          } catch (error3) {
            console.error('All methods failed:', { error1, error2, error3 });
            throw new Error('Unable to load QR code. Please check your connection and try again.');
          }
        }
      }
      
      setQrCodeData(setupData);
      console.log('QR Code data set:', setupData);

    } catch (error) {
      console.error('Setup 2FA failed:', error);
      setErrorMessage(`Failed to get QR code: ${error.message}`);
      setIsSettingUp2FA(false);
    } finally {
      if (!qrCodeData) {
        setIsSettingUp2FA(false);
      }
    }
  };

  const handleVerify2FA = async () => {
    const credentials = btoa(`public:Public@123$$$`);
    setIsSettingUp2FA(true);
    setErrorMessage('');

    try {
      await verify2FACode(credentials, twoFactorCode);
      setIs2FAEnabled(true);
      setErrorMessage('Two-factor authentication has been successfully enabled!');
      
      // Clean up QR code data
      if (qrCodeData && qrCodeData.qrCode && qrCodeData.qrCode.startsWith('blob:')) {
        URL.revokeObjectURL(qrCodeData.qrCode);
      }
      setQrCodeData(null);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const credentials = btoa(`public:Public@123$$$`);

      // First check if 2FA is required
      const is2FARequired = await check2FAStatus(credentials);
      if (is2FARequired && !twoFactorCode) {
        setErrorMessage('Two-factor authentication code is required');
        return;
      }

      // Authenticate with DHIS2
      const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`,
          ...(is2FARequired && { 'X-2FA-Code': twoFactorCode })
        }
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      // On successful authentication...
      const data = await response.json();
      if (data.organisationUnits?.length > 0) {
        localStorage.setItem("userOrgUnitId", data.organisationUnits[0].id);
        console.log("orgUnitIdStored:", data.organisationUnits[0].id);
        localStorage.setItem("userOrgUnitName", data.organisationUnits[0].displayName);
        localStorage.setItem("userCredentials", credentials);
        console.log("credSetStorage");
        if (rememberMe) localStorage.setItem("rememberMe", "true");
        
        onLogin(true);
        onClose();
      } else {
        setErrorMessage('No organization units found for this user.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed');
    }
  };

  if (!show) return null;

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content" ref={modalRef}>
        <div className="login-modal-header">
          <h5 className="login-modal-title">Login</h5>
          <button type="button" className="login-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="login-modal-body">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          
          <form onSubmit={handleSubmit}>
            {/* Username and password fields */}
            <div className="login-form-outline mb-4">
              <input
                type="text"
                className="login-form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
              <label className="login-form-label">Username</label>
            </div>

            <div className="login-form-outline mb-4">
              <input
                type="password"
                className="login-form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <label className="login-form-label">Password</label>
            </div>

            {/* 2FA Section */}
            {qrCodeData ? (
              <div className="mb-4">
                <p>Scan this QR code with your authenticator app:</p>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <img 
                    src={qrCodeData.qrCode} 
                    alt="2FA QR Code" 
                    style={{ 
                      maxWidth: '200px', 
                      maxHeight: '200px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '10px',
                      backgroundColor: 'white'
                    }} 
                    onError={(e) => {
                      console.error('QR Code image failed to load:', e);
                      setErrorMessage('Failed to display QR code. Please try again.');
                    }}
                  />
                </div>
                <div className="login-form-outline mt-3">
                  <input
                    type="text"
                    className="login-form-control"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                  <label className="login-form-label">Verification Code</label>
                </div>
                <button
                  type="button"
                  className="btn btn-primary mt-2"
                  onClick={handleVerify2FA}
                  disabled={!twoFactorCode || twoFactorCode.length !== 6 || isSettingUp2FA}
                >
                  {isSettingUp2FA ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary mt-2 ms-2"
                  onClick={() => {
                    // Clean up and reset
                    if (qrCodeData && qrCodeData.qrCode && qrCodeData.qrCode.startsWith('blob:')) {
                      URL.revokeObjectURL(qrCodeData.qrCode);
                    }
                    setQrCodeData(null);
                    setTwoFactorCode('');
                  }}
                  disabled={isSettingUp2FA}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {is2FAEnabled && (
                  <div className="login-form-outline mb-4">
                    <input
                      type="text"
                      className="login-form-control"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="Enter 2FA code"
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                    <label className="login-form-label">Two-factor Code</label>
                  </div>
                )}

                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleSetup2FA}
                    disabled={!username || !password || isSettingUp2FA}
                  >
                    {isSettingUp2FA ? 'Setting Up...' : 'Setup Two-factor Authentication'}
                  </button>
                </div>
              </>
            )}

            {/* Remember me section */}
            <div className="row mb-4">
              <div className="col d-flex justify-content-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label">Remember me</label>
                </div>
              </div>
              <div className="col">
                <a href="#!">Forgot password?</a>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="login-btn-primary mb-4"
              disabled={isSettingUp2FA}
            >
              Sign in
            </button>
          </form>

          {/* Registration links */}
          <div className="text-center">
            <p>Not a member? <a href="#!">Register</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;