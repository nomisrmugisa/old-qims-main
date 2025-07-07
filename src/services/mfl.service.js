/**
 * Created by fulle on 2025/07/07.
 */
// Mock implementation - replace with actual API calls
import axios from 'axios';
import facilitiesData from './mfl_all_facilities_response.json';
import {eventBus, EVENTS } from '../events';

// Simulate API delay
const simulateDelay = () =>
    new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));

export const fetchFacilities = async () => {
    await simulateDelay();
    return facilitiesData;
};

export const fetchFacilityById = async (id) => {

    await simulateDelay();
    const facility = facilitiesData.find(
        f => f.newFacilityCode === id || f.oldFacilityCode === id
    );

    if (!facility) throw new Error('Facility not found');
    return facility;
};

const mflService = axios.create({
    baseURL: `${import.meta.env.REACT_APP_MFL_API_URL}/api/v1`,
    timeout: parseInt(`${import.meta.env.REACT_APP_API_TIMEOUT}`) || 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization' : `${import.meta.env.REACT_APP_MFL_API_KEY}`
    },
});

const MFLApiService = {
    allFacilities: async () => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "MFLApiService", method: "allFacilities"});
        try {
            const response = await mflService.get(`mfl/facility/all`);
            window.console.log(response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "MFLApiService", method: "allFacilities"});
        }
    },
    fetchFacilities: async () => {
        try {
            await simulateDelay();
            return facilitiesData;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "MFLApiService", method: "allFacilities"});
        }
    }
};

export default MFLApiService;
