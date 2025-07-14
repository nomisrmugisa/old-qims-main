import React, { useState, useRef, useEffect } from 'react';
import './LoginModal.css';
import {eventBus, EVENTS} from '../events';
import { Eye, EyeSlash, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

const LoginModal = ({ show, onClose, onLogin }) => {
    const modalRef = useRef();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    // const isValidTwoFactorCode = (code) => {
    //     return /^\d{6}$/.test(code);
    // };

    const openRegistrationForm = () => {
        onClose();
        eventBus.emit(EVENTS.REGISTRATION_FORM_SHOW);
    };

    const clearErrorMessage = () => {
        setErrorMessage('');
    };

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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

    // All 2FA-related code, variables, and useEffects have been removed.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous errors
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "login_form"});
        window.console.log("Login FormSubmitted");
        
        // Validate form inputs
        if (!username.trim()) {
            setErrorMessage('Please enter your email address.');
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "login_form"});
            return;
        }
        
        if (!isValidEmail(username.trim())) {
            setErrorMessage('Please enter a valid email address.');
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "login_form"});
            return;
        }
        
        if (!password.trim()) {
            setErrorMessage('Please enter your password.');
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "login_form"});
            return;
        }



        try {
            const credentials = btoa(`${username}:${password}`);

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Login request timed out. Please check your internet connection and try again.')), 15000)
            );

            // First API call to authenticate
            const authPromise = fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me`, {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    // TEMPORARILY DISABLED 2FA FOR DEVELOPMENT
                    // ...(useTwoFactor && twoFactorCode && { 'X-2FA-Code': twoFactorCode }),
                },
            });

            const response = await Promise.race([authPromise, timeoutPromise]);
            window.console.log(response);

            if (!response.ok) {
                // Handle authentication errors based on status code
                let errorMessage = '';
                // let shouldRetry = false;
                
                switch (response.status) {
                    case 400:
                        errorMessage = 'Invalid request. Please check your email address and password format.';
                        break;
                    case 401:
                        errorMessage = 'Invalid email address or password. Please check your credentials and try again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. Your account may be locked or you don\'t have permission to access this system. Please contact your administrator.';
                        break;
                    case 404:
                        errorMessage = 'Login service not found. Please contact support if this problem persists.';
                        break;
                    case 410:
                        errorMessage = 'Your account has expired. Please contact your administrator to renew your account.';
                        break;
                    case 423:
                        errorMessage = 'Two-factor authentication is required for your account. Please enable 2FA and try again.';
                        break;
                    case 429:
                        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Our team has been notified. Please try again in a few minutes.';
                        break;
                    case 502:
                    case 503:
                    case 504:
                        errorMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
                        break;
                    default:
                        errorMessage = `Login failed (${response.status}). Please try again or contact support if the problem persists.`;
                }
                
                setErrorMessage(errorMessage);
                eventBus.emit(EVENTS.LOADING_HIDE, { source: 'login_modal' });
                onLogin(false); // Indicate login failure to App.jsx
                return; // Stop further execution
            }

            window.console.log("Managed to pass login");
            // If authentication successful, fetch organization units
            const orgUnitsResponse = await fetch(
                `${import.meta.env.VITE_DHIS2_URL}/api/me?fields=organisationUnits[id,displayName]`,
                {
                    headers: {
                        Authorization: `Basic ${credentials}`,
                    },
                }
            );

            if (orgUnitsResponse.ok) {
                const data = await orgUnitsResponse.json();
                if (data.organisationUnits && data.organisationUnits.length > 0) {
                    // Store session data in localStorage
                    localStorage.setItem("userOrgUnitId", data.organisationUnits[0].id);
                    console.log("orgUnitIdStored:", data.organisationUnits[0].id);
                    localStorage.setItem("userOrgUnitName", data.organisationUnits[0].displayName);
                    localStorage.setItem("userCredentials", credentials);
                    console.log("credSetStorage");
                    if (rememberMe) {
                        localStorage.setItem("rememberMe", "true");
                    } else {
                        localStorage.removeItem("rememberMe");
                    }
                    console.log("User Data and Organization Units:", data);
                    onLogin(true); // Login successful
                    onClose(); // Close modal on successful login
                } else {
                    setErrorMessage('No organization units found for this user. Please contact your administrator to assign you to an organization.');
                    onLogin(false); // Login failed
                }
            } else {
                setErrorMessage(`Failed to fetch organization units: ${orgUnitsResponse.statusText}. Please try again or contact support.`);
                onLogin(false); // Login failed
            }
            eventBus.emit(EVENTS.LOADING_HIDE, { source: 'login_modal' });
        } catch (error) {
            console.error("Login error:", error);
            
            let errorMessage = '';
            
            // Handle specific error types
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Please check your internet connection and try again.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'Cross-origin request blocked. Please contact support if this problem persists.';
            } else {
                errorMessage = 'An unexpected error occurred. Please try again or contact support if the problem persists.';
            }
            
            setErrorMessage(errorMessage);
            onLogin(false); // Login failed due to network or other error
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "login_form"});
        }
    };

    if (!show) {
        return null;
    }

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
                    {errorMessage && (
                        <div className="alert alert-danger">
                            {errorMessage}
                            <button type="button" className="btn-close float-end" onClick={clearErrorMessage} aria-label="Close"></button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        {/* Email input */}
                        <div className="login-form-outline mb-4">
                            <input
                                type="email"
                                id="form2Example1"
                                className="login-form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your email address"
                                required
                            />
                            <label className="login-form-label" htmlFor="form2Example1">Email address</label>
                            {username && (
                                <span className={`email-validation-icon ${isValidEmail(username) ? 'valid' : 'invalid'}`}>
                                    {isValidEmail(username) ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                </span>
                            )}
                        </div>

                        {/* Password input */}
                        <div className="login-form-outline mb-4">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="form2Example2"
                                className="login-form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter any password"
                                required
                            />
                            <label className="login-form-label" htmlFor="form2Example2">Password</label>
                            <button
                                type="button"
                                className="login-password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                            </button>
                        </div>



                        {/* Remember me and Forgot password row */}
                        <div className="row mb-4">
                            <div className="col d-flex justify-content-center">
                                {/* Remember me checkbox */}
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Remember me
                                    </label>
                                </div>
                            </div>

                            <div className="col">
                                {/* Forgot password link */}
                                <a href="/main/forgot-password">Forgot password?</a>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="login-btn-primary mb-4"
                            // TEMPORARILY ENABLED FOR DEVELOPMENT
                            // disabled={!useTwoFactor ||
                            //     (!isValidTwoFactorCode(twoFactorCode) || twoFactorError.includes('failed'))}
                        >
                            Sign in
                        </button>

                        {/* Register buttons */}
                        <div className="text-center">
                            <p>Not a member? <a href="#" onClick={openRegistrationForm}>Register</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;