import React, { useState, useRef, useEffect } from 'react';
import './LoginModal.css';
import {eventBus, EVENTS } from '../events';

const LoginModal = ({ show, onClose, onLogin }) => {
    const modalRef = useRef();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [useTwoFactor, setUseTwoFactor] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [codeId, setCodeId] = useState('');
    const [twoFactorError, setTwoFactorError] = useState('');
    const [isTwoFactorInitialized, setIsTwoFactorInitialized] = useState(false);

    const isValidTwoFactorCode = (code) => {
        return /^\d{6}$/.test(code);
    };

    const openRegistrationForm = () => {
        onClose();
        eventBus.emit(EVENTS.REGISTRATION_FORM_SHOW);
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

    // Handle when user checks/unchecks the 2FA checkbox
    // Replace your useEffect with this simplified version
    useEffect(() => {
        if (useTwoFactor && username && password) {
            const initialize2FA = async () => {
                try {
                    setTwoFactorError('Initializing 2FA...');

                    // Step 1: Acquire Token
                    const username = 'nomisrmugisa@gmail.com';
                    const password = 'Nomisr123$';
                    const credentials = btoa(`${username}:${password}`);
                    const tokenResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/Token/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${credentials}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            token: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJXbzJIajRrbERZTXlyOEZrR0NPcXcwOGtRZ2ZpZk9DVUE1RHo3cUlFLU5JIn0.eyJleHAiOjE3NDk5NzIzNTAsImlhdCI6MTc0OTg4NTk1MCwianRpIjoiNGEyNjYzYWEtOWMwYi00MWU1LTgzOTQtMTZmMDA3OTM0NGRjIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmUucGx5ZG90LmNvbS9hdXRoL3JlYWxtcy9hdXRob3JpemUiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYzYwZGI0NjQtZDg2Zi00ZWZlLWE4YTctNjQ4MzdmYWQ3ZDgxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZmx5dGUiLCJzZXNzaW9uX3N0YXRlIjoiMjViOTUyZDYtMWI0OC00ZjJhLThjOWItZTUzMTY0YTFmMDU5IiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWZseXRlIGNvbW11bmljYXRpb25zIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZmx5dGUiOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjI1Yjk1MmQ2LTFiNDgtNGYyYS04YzliLWU1MzE2NGExZjA1OSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJ1c2VyX3JlYWxtX3JvbGUiOlsiZGVmYXVsdC1yb2xlcy1mbHl0ZSBjb21tdW5pY2F0aW9ucyIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJuYW1lIjoiV2lsc29uIFdoaXBwZXQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ3aGlwcGV0QHBseWRvdC5jb20iLCJnaXZlbl9uYW1lIjoiV2lsc29uIiwiZmFtaWx5X25hbWUiOiJXaGlwcGV0IiwiZW1haWwiOiJ3aGlwcGV0QHBseWRvdC5jb20ifQ.CgqG8ijEgr1Yvlvro5Q37doWX4JkZ4my1ndAexB4xBSuxBmj860JxOdgxrztMV1GZNXjjqcKraC4497zS7LvmlnYvze0KCZTOJ_87buuOySsSWwk5Is27zH3Iv9riCazhuwAP_AY18divJRfY0DYBVdtMimXNze09nmSLv3r9lyOwxx0pOS6O1HGEJ7umUOB7HofAjN0GUHfUm1J-zAtzIklFIKXNFmPmxt3VQOq5q6dmxlSTnjigfA4Tcka_vSpjxd5kFIqrEfSyD0quNZRTZPbOfHV5mjS7MwbJ1KP4cR7eBnDOJ6YNt1Ru6X-RsUOdo6vluga7II73--F0Bi1iw", // your token here
                            expiration: "86400"
                        }),
                        credentials: 'include'
                    });

                    if (!tokenResponse.ok) {
                        throw new Error(`Token request failed with status ${tokenResponse.status}`);
                    }

                    const tokenData = await tokenResponse.json();
                    const extractedToken = tokenData.token;
                    setTwoFactorToken(extractedToken);

                    // Step 2: Initialize 2FA - send OTP
                    const initResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/SMS2FA/init/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${extractedToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            authorityEmail: username,
                            recipient: "256778512260",
                            sender: "Plydot"
                        })
                    });

                    if (!initResponse.ok) {
                        throw new Error(`Init request failed with status ${initResponse.status}`);
                    }

                    const initData = await initResponse.json();
                    setCodeId(initData.codeId);
                    setIsTwoFactorInitialized(true);
                    setTwoFactorError('OTP sent to your phone. Please enter the code.');
                } catch (error) {
                    console.error('2FA initialization error:', error);
                    setTwoFactorError(`2FA setup failed: ${error.message}`);
                    // Keep the checkbox checked so user can try again
                }
            };

            initialize2FA();
        }
    }, [useTwoFactor]); // Only depend on useTwoFactor

    const initializeTwoFactor = async () => {
        try {
            setTwoFactorError('Initializing 2FA...');

            // Step 1: Acquire Token
            const credentials = btoa(`${username}:${password}`);
            const tokenResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/Token/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJXbzJIajRrbERZTXlyOEZrR0NPcXcwOGtRZ2ZpZk9DVUE1RHo3cUlFLU5JIn0.eyJleHAiOjE3NDk5NzIzNTAsImlhdCI6MTc0OTg4NTk1MCwianRpIjoiNGEyNjYzYWEtOWMwYi00MWU1LTgzOTQtMTZmMDA3OTM0NGRjIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmUucGx5ZG90LmNvbS9hdXRoL3JlYWxtcy9hdXRob3JpemUiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiYzYwZGI0NjQtZDg2Zi00ZWZlLWE4YTctNjQ4MzdmYWQ3ZDgxIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZmx5dGUiLCJzZXNzaW9uX3N0YXRlIjoiMjViOTUyZDYtMWI0OC00ZjJhLThjOWItZTUzMTY0YTFmMDU5IiwiYWNyIjoiMSIsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLWZseXRlIGNvbW11bmljYXRpb25zIiwib2ZmbGluZV9hY2Nlc3MiLCJhZG1pbiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZmx5dGUiOnsicm9sZXMiOlsiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjI1Yjk1MmQ2LTFiNDgtNGYyYS04YzliLWU1MzE2NGExZjA1OSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJ1c2VyX3JlYWxtX3JvbGUiOlsiZGVmYXVsdC1yb2xlcy1mbHl0ZSBjb21tdW5pY2F0aW9ucyIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJuYW1lIjoiV2lsc29uIFdoaXBwZXQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ3aGlwcGV0QHBseWRvdC5jb20iLCJnaXZlbl9uYW1lIjoiV2lsc29uIiwiZmFtaWx5X25hbWUiOiJXaGlwcGV0IiwiZW1haWwiOiJ3aGlwcGV0QHBseWRvdC5jb20ifQ.CgqG8ijEgr1Yvlvro5Q37doWX4JkZ4my1ndAexB4xBSuxBmj860JxOdgxrztMV1GZNXjjqcKraC4497zS7LvmlnYvze0KCZTOJ_87buuOySsSWwk5Is27zH3Iv9riCazhuwAP_AY18divJRfY0DYBVdtMimXNze09nmSLv3r9lyOwxx0pOS6O1HGEJ7umUOB7HofAjN0GUHfUm1J-zAtzIklFIKXNFmPmxt3VQOq5q6dmxlSTnjigfA4Tcka_vSpjxd5kFIqrEfSyD0quNZRTZPbOfHV5mjS7MwbJ1KP4cR7eBnDOJ6YNt1Ru6X-RsUOdo6vluga7II73--F0Bi1iw",
                    expiration: "86400"
                })
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to acquire 2FA token');
            }

            const tokenData = await tokenResponse.json();
            const extractedToken = tokenData.token;
            setTwoFactorToken(extractedToken);

            // Step 2: Initialize 2FA - send OTP
            const initResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/SMS2FA/init/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${extractedToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authorityEmail: username,
                    recipient: "256778512260", // This should ideally come from user profile or input
                    sender: "Plydot"
                })
            });

            if (!initResponse.ok) {
                throw new Error('Failed to initialize 2FA');
            }

            const initData = await initResponse.json();
            if (initData.status === 'otp_sent') {
                setCodeId(initData.codeId);
                setIsTwoFactorInitialized(true);
                setTwoFactorError('OTP sent to your phone. Please enter the code.');
            } else {
                throw new Error('Failed to send OTP');
            }
        } catch (error) {
            console.error('2FA initialization error:', error);
            setTwoFactorError(`2FA setup failed: ${error.message}`);
            setUseTwoFactor(false);
        }
    };

    const verifyTwoFactorCode = async () => {
        try {
            if (!twoFactorCode || !codeId) {
                setTwoFactorError('Please enter the 2FA code');
                return false;
            }

            // Step 3: Verify OTP code
            const username = 'nomisrmugisa@gmail.com';
            const verifyResponse = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/SMS2FA/verify/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${twoFactorToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authorityEmail: username,
                    code: twoFactorCode,
                    codeId: codeId
                })
            });

            // if (!verifyResponse.ok) {
            //     throw new Error('Verification failed');
            // }

            // const verificationResult = await verifyResponse.text();
            if (verifyResponse.ok) {
                setTwoFactorError('');
                return true;
            } else {
                throw new Error('Invalid verification code');
            }
        } catch (error) {
            console.error('2FA verification error:', error);
            setTwoFactorError(`2FA verification failed: ${error.message}`);
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous errors
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "login_form"});
        window.console.log("Login FormSubmitted");
        // TEMPORARILY DISABLED 2FA FOR DEVELOPMENT
        // if (useTwoFactor) {
        //     if (!twoFactorCode.trim()) {
        //         setTwoFactorError('2FA code is required');
        //         return;
        //     }

        //     const isVerified = await verifyTwoFactorCode();
        //     if (!isVerified) {
        //         return;
        //     }
        // }

        try {
            const credentials = btoa(`${username}:${password}`);

            // First API call to authenticate
            const response = await fetch(`${import.meta.env.VITE_DHIS2_URL}/api/me`, {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    // TEMPORARILY DISABLED 2FA FOR DEVELOPMENT
                    // ...(useTwoFactor && twoFactorCode && { 'X-2FA-Code': twoFactorCode }),
                },
            });
            window.console.log(response);

            if (!response.ok) {
                // Handle authentication errors based on status code
                switch (response.status) {
                    case 401:
                        setErrorMessage('Invalid credentials. Please check your email and password.');
                        break;
                    case 403:
                        setErrorMessage('Account locked. Please contact support.');
                        break;
                    case 410:
                        setErrorMessage('Account expired. Please renew your account.');
                        break;
                    case 423:
                        setErrorMessage('Two factor authentication required.');
                        break;
                    case 429:
                        setErrorMessage('Too many login attempts. Please try again later.');
                        break;
                    case 500:
                        setErrorMessage('Server error. Please try again later.');
                        break;
                    default:
                        setErrorMessage(`Authentication failed: ${response.statusText}`);
                }
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
                    setErrorMessage('No organization units found for this user.');
                    onLogin(false); // Login failed
                }
            } else {
                setErrorMessage(`Failed to fetch organization units: ${orgUnitsResponse.statusText}`);
                onLogin(false); // Login failed
            }
            eventBus.emit(EVENTS.LOADING_HIDE, { source: 'login_modal' });
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage('Network error or unexpected issue. Please try again.');
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
                    <div style={{ color: 'green', fontSize: '12px', fontWeight: 'bold' }}>DEV MODE: 2FA DISABLED</div>
                    <button type="button" className="login-modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="login-modal-body">
                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                    <form onSubmit={handleSubmit}>
                        {/* Username input */}
                        <div className="login-form-outline mb-4">
                            <input
                                type="text"
                                id="form2Example1"
                                className="login-form-control"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                            <label className="login-form-label" htmlFor="form2Example1">Username</label>
                        </div>

                        {/* Password input */}
                        <div className="login-form-outline mb-4">
                            <input
                                type="password"
                                id="form2Example2"
                                className="login-form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter any password"
                                required
                            />
                            <label className="login-form-label" htmlFor="form2Example2">Password</label>
                        </div>

                        {/* 2FA Checkbox - appears above the input field */}
                        <div className="mb-3">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="useTwoFactor"
                                    checked={useTwoFactor}
                                    onChange={(e) => {
                                        const shouldUse2FA = e.target.checked;
                                        setUseTwoFactor(shouldUse2FA);
                                        if (!shouldUse2FA) {
                                            setIsTwoFactorInitialized(false);
                                            setTwoFactorError('');
                                        }
                                    }}
                                    disabled={!username || !password}
                                />
                                <label className="form-check-label" htmlFor="useTwoFactor">
                                    Login using two factor authentication
                                    {useTwoFactor && !isTwoFactorInitialized && (
                                        <span className="ms-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* 2FA Code input - conditionally rendered */}
                        {useTwoFactor && (
                            <>
                                <div className="login-form-outline mb-2">
                                    <input
                                        type="text"
                                        id="twoFactorCode"
                                        className={`login-form-control ${twoFactorError ? 'is-invalid' : ''}`}
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        required
                                        disabled={!isTwoFactorInitialized}
                                    />
                                    <label className="login-form-label" htmlFor="twoFactorCode">
                                        Two factor authentication code
                                    </label>
                                </div>
                                {twoFactorError && (
                                    <div className={`mb-3 small ${twoFactorError.includes('OTP sent') ? 'text-info' : 'text-danger'}`}>
                                        {twoFactorError}
                                    </div>
                                )}
                            </>
                        )}

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
                            <p>Not a member? <a href="javascript:void(0);" onClick={openRegistrationForm}>Register</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;