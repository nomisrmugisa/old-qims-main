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
import {FacilityService, UserService} from '../../../services';

const EnrolmentBasic = () => {
    const [facilities, setFacilities] = useState([]);
    const [userFacilitiesInfo, setUserFacilitiesInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [canApply, setCanApply] = useState(true);
    const [listEnrollmentApplications, setListEnrollmentApplications] = useState(null);

    const getUserFacilities = async () => {

        try {
            const response = await UserService.getFacilities();
            window.console.log("userFacilities", response);
            setUserFacilitiesInfo(setUserFacilitiesInfo);
        }catch (err) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: err.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }


    };

    const getAuthEnrollmentApplications = async() => {

        try {
            const response = await FacilityService.listAuthPendingEnrolmentRequest();
            setListEnrollmentApplications(response);
        }
        catch(error) {
            eventBus.emit(EVENTS.NOTIFICATION_SHOW, {
                title: 'Error',
                message: error.message || 'Operation failed. Please try again.',
                type: 'error'
            });
        }

    };

    // Reset states when switching tabs
    useEffect(() => {
        getAuthEnrollmentApplications();
        getUserFacilities();
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

            //Find facility using MFL Codes
            let response = await FacilityService.findByMFLCodes(facility);
            window.console.log("findByMFLCodes", response);
            let facilityInfo = null;
            if(response && response.length>0) {
                facilityInfo = response[0];
            }
            else {
                response = await FacilityService.addToMFLDistrict(facility);
                facilityInfo = {
                    id: response.uid,
                    name: facility.facilityName,
                    description: `${facility.newFacilityCode}/${facility.oldFacilityCode}`
                }
            }
            window.console.log("Got facilityInfo", facilityInfo);

            response = await FacilityService.enrolmentRequest(facilityInfo);
            window.console.log("enrolmentRequest", response);

            /*response = await UserService.deleteOldSettings();
            window.console.log("deleteOldSettings", response);

            response = await UserService.refreshMe();
            window.console.log("refreshMe", response);*/

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

            {(listEnrollmentApplications<= 0 && canApply) ? (
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
                        We are waiting on your enrollment application, you can only apply after it has been resolved.
                    </Alert>
                </div>
            )}

        </div>
    );
};

export default EnrolmentBasic;