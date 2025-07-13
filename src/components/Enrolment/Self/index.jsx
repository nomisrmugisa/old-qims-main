/**
 * Created by fulle on 2025/07/10.
 */
/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import FacilitySearchForm from '../../Facility/Search/Form';
import FacilitySearchResults from '../../Facility/Search/Results';
import {lookupFacilities} from '../helpers';
import { eventBus, EVENTS } from '../../../events';
import OTPVerification from '../../OTPVerification';

const EnrolmentSelf = () => {
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);

    // Reset states when switching tabs
    useEffect(() => {
        setFacilities([]);
        setSuccess('');
        setShowOTP(false);
    }, []);

    const handleFacilitySearch = async (query) => {
        try {
            const results = await lookupFacilities(query);
            window.console.log("results");
            window.console.log(results);
            setFacilities(results);
        }
        catch(error) {

        }

    };

    const handleEnrolmentAction = async (facility) => {
        setIsLoading(true);
        setSuccess('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSelectedFacility(facility);
            setShowOTP(true);
            setSuccess(`OTP sent to ${facility.contact}`);
        } catch (err) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: 'Operation failed. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPVerify = (otp) => {
        // In real app, verify OTP with backend
        setSuccess(`OTP verified! Enrolled in ${selectedFacility.name}`);
        setShowOTP(false);
    };

    return (
        <div className="mt-4">
            <h4>Self-Service Enrolment</h4>
            <p className="text-muted">
                Enrol yourself using OTP verification
            </p>

            <FacilitySearchForm
                onSearch={handleFacilitySearch}
                placeholder="Search facilities for self-enrolment"
            />

            {success && <Alert variant="success">{success}</Alert>}

            <FacilitySearchResults
                items={facilities}
                onAction={(facility) => handleEnrolmentAction(facility)}
                actionText="Self Enrol"
                isLoading={isLoading}
            />

            <OTPVerification
                show={showOTP}
                onHide={() => setShowOTP(false)}
                onVerify={handleOTPVerify}
                facility={selectedFacility}
            />
        </div>
    );
};

export default EnrolmentSelf;