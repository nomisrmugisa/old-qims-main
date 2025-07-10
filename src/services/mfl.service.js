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

/*const mflService = axios.create({
    baseURL: `${import.meta.env.VITE_MFL_API_URL}/api/v1`,
    timeout: parseInt(`${import.meta.env.VITE_API_TIMEOUT}`) || 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization' : `${import.meta.env.VITE_MFL_API_KEY}`
    },
});*/

const mflService = axios.create({
    baseURL: `https://mfldit.gov.org.bw/api`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization' : "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJxaW1zLm1vaEBnbWFpbC5jb20iLCJjcmVhdGVkIjoxNzUxNDY1MzUzMzQ1LCJyb2xlcyI6W3siY3JlYXRvciI6bnVsbCwiY3JlYXRlZCI6bnVsbCwidXBkYXRlciI6bnVsbCwidXBkYXRlZCI6bnVsbCwiaWQiOiJkYTJmZDkxNi1kMTEzLTQ2MDItOTFjYS0zZTVmMzMxZjFiMDYiLCJyZWZlcmVuY2UiOm51bGwsIm5hbWUiOiJEZXZlbG9wZXIiLCJkZXNjcmlwdGlvbiI6IkRldmVsb3BlciwgYWNjZXNzIE1GTCBvcGVuIGFwaSBmb3IgaW50ZXJvcGVyYWJpbGl0eSIsImF1dGhvcml0eUdyb3VwcyI6W3siY3JlYXRvciI6bnVsbCwiY3JlYXRlZCI6bnVsbCwidXBkYXRlciI6bnVsbCwidXBkYXRlZCI6bnVsbCwiaWQiOiJlZjg4MTQ3YS04ODU1LTQ4OGQtYThhNS1iZTRkZTkxNzE0MjgiLCJyZWZlcmVuY2UiOm51bGwsIm5hbWUiOiJERVZFTE9QRVJfQUxMIiwiZGVzY3JpcHRpb24iOiJDYW4gYWNjZXNzIGFsbCB0aGUgb3BlbiBNRkwgQXBpcyJ9XX1dLCJleHAiOjM1NDE3NDY1MzUzLCJqdGkiOiI0NzNkYTJiMi01MmMyLTExZjAtYjE2NS1iYjc4MGZlNTc2MDcifQ.6Evlm7wpaRdM6sUVwcv4CFNhSDqXTnKq-bketbO6gRERhQEsu6NxGpNRbEwmWllYrH46r438rY4AgYJPqxjT-w"
    },
});

const MFLApiService = {
    allFacilities: async () => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "MFLApiService", method: "allFacilities"});
        try {
            const response = await mflService.get(`v1/mfl/facility/all`);
            window.console.log(response);
            return response;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "MFLApiService", method: "allFacilities"});
        }
    },
    searchFacilities: async(keyword) => {
        eventBus.emit(EVENTS.LOADING_SHOW, { source: "MFLApiService", method: "searchFacilities"});
        window.console.log("search facility with: "+ keyword);
        try {
            const response = await mflService.get(`facility/v1/search/?term=${keyword}`);
            window.console.log(response);
            return response.data;
        } catch (error) {
            throw error;
        }
        finally {
            eventBus.emit(EVENTS.LOADING_HIDE, { source: "MFLApiService", method: "searchFacilities"});
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
