/**
 * Created by fulle on 2025/07/10.
 */
import React, { useState, useEffect } from 'react';
import {
    Alert,
} from 'react-bootstrap';
import FacilitySearchForm from '../../Facility/Search/Form';
import FacilitySearchResults from '../../Facility/Search/Results';
import {lookupFacilities} from '../helpers';
import { eventBus, EVENTS } from '../../../events';
import {FacilityService} from '../../../services';

const EnrolmentBasic = () => {
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [canApply, setCanApply] = useState(true);

    // Reset states when switching tabs
    useEffect(() => {
        setFacilities([]);
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

        try {
            const response = await FacilityService.enrolmentRequest(facility);
            window.console.log(response);
            setCanApply(false);
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Success',
                message: `Enrolment requested for ${facility.facilityName}`,
                type: 'success'
            });
        } catch (err) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: err.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="mt-4">
            <h4>Facility User Enrolment</h4>
            <p className="text-muted">
                Search for a facility and request to gain access.
            </p>

            {canApply ? (
                <>
                <FacilitySearchForm
                    onSearch={handleFacilitySearch}
                    placeholder="Search facilities by name or address"
                />

                <FacilitySearchResults
                    items={facilities}
                    onAction={(facility) => handleEnrolmentAction(facility)}
                    actionText="Request for Enrolment"
                    isLoading={isLoading}
                />
                </>
            ) : (
                <div>
                    <Alert variant="danger">
                        We are waiting on your enrolment application, you can only proceed apply again if it was not successful.
                    </Alert>
                </div>
            )}

        </div>
    );
};

export default EnrolmentBasic;