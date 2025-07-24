/**
 * Created by fulle on 2025/07/15.
 */
import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { eventBus, EVENTS } from '../../../events';
import { AuthService, OTPApiService, StorageService } from '../../../services';
import { validateEmail } from '../../../utils/validators';

const LoginForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCredentialsVerified, setIsCredentialsVerified] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log('changed name: ', name);
        if(['email', 'password'].indexOf(name)>=0)
            setIsCredentialsVerified(false);
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.otp) newErrors.otp = 'OTP is required';
        else if (formData.otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetStep1 = () => {
        setUserData(null);
        setIsCredentialsVerified(false);
    };

    const getForgotPasswordLink = () => {
        return `${import.meta.env.VITE_DHIS2_URL}/dhis-web-commons/security/login.action`;
    };

    const handleVerifyCredentials = async (e) => {
        e.preventDefault();
        resetStep1();
        if (!validateStep1()) return;

        setIsSubmitting(true);
        try {

            await AuthService.clear2StepCredentials();
            let response = await AuthService.me2Step({
                username: formData.email,
                password: formData.password
            });

            setIsCredentialsVerified(true);
            window.console.log("Verify-Creds-RESPONSE---");
            window.console.log(response);
            setUserData(response);
            window.console.log("***---");

            response = await OTPApiService.requestOtp({
                emails: [formData.email],
            });

            window.console.log("RESPONSE---");
            window.console.log(response);
            window.console.log("***---");


            setStep(2);

            window.console.log("Send-OTP-RESPONSE---");
            window.console.log(response);
            //await StorageService.setUserData(response);
            window.console.log("***---");

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'OTP Sent',
                message: 'Verification code sent to your email, please note that it expires after 5 minutes.',
                type: 'success'
            });

        } catch (error) {
            window.console.error('Login error:', error);
            resetStep1();
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: error.message,
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteLogin = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsSubmitting(true);
        try {
            const result = await AuthService.verify2StepCredentials(formData.email, formData.password);
            if(!result)
                throw new Error("Access Denied");

            let response = await OTPApiService.verifyOtp({
                email: formData.email,
                otp: formData.otp
            });

            window.console.log("verify-otp-response", response);

            await AuthService.success2StepAuth();
            await StorageService.setUserData(userData);
            
            // Set userCredentials for dashboard authentication using helper
            const authorization_creds = btoa(`${formData.email}:${formData.password}`);
            await import('../../../utils/credentialHelper').then(module => 
              module.setCredentials(authorization_creds)
            );
            
            // Update the login state in App.jsx
            eventBus.emit(EVENTS.LOGIN_SUCCESS, true);
            
            console.log('✅ 2FA Login: Credentials set successfully');
            
            console.log('🔀 2FA Login: About to redirect to /dashboards/facility-ownership');
            
            // Show success notification
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Login Successful',
                message: 'Welcome back!',
                type: 'success'
            });
            
            // Direct redirect after a short delay to ensure notification shows
            setTimeout(() => {
                console.log('🔀 2FA Login: Executing redirect to /dashboards/facility-ownership');
                console.log('🔀 2FA Login: navigate function available:', !!navigate);
                try {
                    console.log('🔀 2FA Login: Trying navigate with /dashboards/facility-ownership');
                    navigate('/dashboards/facility-ownership');
                    console.log('🔀 2FA Login: navigate() called successfully');
                } catch (error) {
                    console.error('🔀 2FA Login: navigate() failed, trying window.location:', error);
                    console.log('🔀 2FA Login: Trying window.location with /main/dashboards/facility-ownership');
                    window.location.href = '/main/dashboards/facility-ownership';
                }
            }, 1000);

        } catch (error) {
            /*eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: error.message,
                type: 'error'
            });*/

          console.error('Registration error:', error);

          if (error.status === 400 || error.code === 'ERR_BAD_REQUEST') {
            // Handle 400 Bad Request - likely Invalid OTP
            setErrors({
              otp: 'The verification code you entered is incorrect or has expired. Please check and try again.'
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Invalid Verification Code',
              message: 'The verification code is incorrect or has expired. Please try again.',
              type: 'error'
            });
          } else if (error.error === 'Invalid OTP' || error.message === 'Invalid OTP') {
            // Handle Invalid OTP error (fallback)
            setErrors({
              otp: 'The verification code you entered is incorrect. Please check and try again.'
            });

            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Invalid Verification Code',
              message: 'The verification code is incorrect. Please check and try again.',
              type: 'error'
            });
          } else {
            // Handle all other errors (keep your existing logic)
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
              title: 'Error',
              message: error.message || error.error || 'An unexpected error occurred.',
              type: 'error'
            });
          }

          // Scroll to top on error as well
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            {step === 1 ? (
                <Form onSubmit={handleVerifyCredentials}>
                    <Form.Group className="mb-3">
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            variant="outlined"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            autoFocus
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-end mb-3">
                        {/*<Link to="/forgot-password" className="text-decoration-none">
                            Forgot password?
                        </Link>*/}
                        <Link to={getForgotPasswordLink()} target="_blank" className="text-decoration-none">
                            Forgot password?
                        </Link>
                    </div>
                    <Button
                        variant="primary"
                        type="submit"
                        className="w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify'}
                    </Button>
                </Form>
            ): (
                <Form onSubmit={handleCompleteLogin}>
                    <Form.Group className="mb-3">
                        <TextField
                            fullWidth
                            label="Verification Code (OTP)"
                            name="otp"
                            variant="outlined"
                            value={formData.otp}
                            onChange={handleChange}
                            error={!!errors.otp}
                            helperText={errors.otp}
                            autoFocus
                            inputProps={{ maxLength: 6 }}
                        />
                    </Form.Group>
                    <div className="d-flex justify-content-between mt-4">
                        <Button
                            variant="outline-secondary"
                            onClick={() => setStep(1)}
                            disabled={isSubmitting}
                        >
                            Back
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </div>
                </Form>
            )}

        </div>
    );
};

export default LoginForm;