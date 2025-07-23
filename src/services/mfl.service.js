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

export const filterFacilities = async(keyword) => {
    return await facilitiesData.filter((item) => {
        return item.facilityName.contains(keyword.toLowerCase());
    });
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
            /*return [{
                facilityName:"Princess Marina Hospital",
                newFacilityCode:"950899-5",
                oldFacilityCode:"00-01",
                "practiceName":"",
                "practitionerCode":"",
                "district":{"id":"1","name":"Greater Gaborone","code":"GC"},
                "isUrbanOrRural":"Urban",
                "operationalTimes":[{"day":"MONDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"TUESDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"WEDNESDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"THURSDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"FRIDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"SUNDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"HOLIDAY","timeFrom":"00:01","breakTo":"23:59","selected":false},{"day":"SATURDAY","timeFrom":"00:01","breakTo":"23:59","selected":false}],
                status:"OPERATIONAL",
                facilityStatus:"PUBLISHED",
                telephone:"+267 3621400",
                lat:-24.656991,
                lng:25.923933,
                "otherInformation":"",
                "facilityType":{"name":"Referral Hospital","score":7},
                "dhmt":{"id":"8b80f6fb-50b2-4e0d-829c-539245970f52","name":"Greater Gaborone"},
                "constituency":{"id":"ea901c30-716b-415c-8703-638243128f4c","name":"GABORONE CENTRAL"},
                facilityOwner:"GOVERNMENT",
                "facilityServices":[{"id":"6f7a8b3f-b127-4082-9ec8-2c7b3e59abf0","name":"Sexual Reproductive Health"},{"id":"e658a8ad-4d66-4ab6-a794-94e0d85af069","name":"Ear Nose Throat"},{"id":"5f4b3312-a5f2-4d01-832c-26650598c963","name":"Ante Natal Care"},{"id":"ededd3d8-293c-4413-96e9-60e09ace7c04","name":"Child Welfare Clinic"},{"id":"159426be-12d9-4d60-afe7-45eaaa97ffc6","name":"Post Natal Care"},{"id":"5557e2f6-d823-4019-b163-fd3eabef48c1","name":"Maternity"},{"id":"058594a4-d543-4d1f-b573-948062ec2be3","name":"Laboratory"},{"id":"9c6da025-4c6a-4de1-8b00-187564db54d1","name":"Inpatient Care Services"},{"id":"bf06beb6-c72f-47ec-8173-ae0be88b328c","name":"Dental"},{"id":"77cf9c44-fb9b-49d1-957d-166ea8de12c9","name":"Eye Clinic"},{"id":"76fb66f0-76a7-4518-9f74-f9f86c19f5e7","name":"General Consultation"},{"id":"0493c135-a267-4443-9b56-dfc09d874c49","name":"Surgery"},{"id":"d04a478f-0e3b-4b23-90fe-924c30c67210","name":"Pharmacy"},{"id":"e1f7ce03-c13c-4c43-8164-766306e5ef33","name":"X-Ray"},{"id":"c159abe6-c667-45e9-98e8-85e6ed89fc11","name":"Dressings And Injection"},{"id":"9f7c36ee-4327-40a0-8ed7-0cac8bd07d31","name":"Ophthalmology Consultations"},{"id":"c2d3c240-c15c-46cc-b5e5-757c2a50b43f","name":"Emergency Obstetric Care"},{"id":"dc2d5029-8f58-487d-9c97-a08b9b42c319","name":"Pediatrics"},{"id":"01a3a7dc-2c2c-4f2e-be11-87135ec052d8","name":"Gynaecology"},{"id":"e84ab01d-006c-403b-bb03-86992b1bb88b","name":"Orthopedic"},{"id":"83ebfe5b-baae-42f5-ab90-e52558b11438","name":"Neurology"},{"id":"8cf63024-f310-40f6-b909-437c30ee1573","name":"Urology"},{"id":"9538951e-62bf-4e08-90ba-54790414c29e","name":"Nephrology"},{"id":"dc1927be-130b-428c-8abf-0adcc6c859a5","name":"Oncology"},{"id":"5d126c70-f050-4abb-8014-e8d15bd0230c","name":"Dermatology"},{"id":"8f7761b4-cce5-4cc0-a9f5-b57db7e69ecc","name":"Primary Health Care"},{"id":"d47f079d-2aee-4103-9ec4-5ca9e9c5f122","name":"Domiciliary"},{"id":"13704fd8-c10d-4e1e-ab49-afc87e722f92","name":"Anesthesiology"},{"id":"e119fca4-829c-483e-ba4e-a6b0b910b8aa","name":"HIV Testing and Counselling"},{"id":"dc1927be-130b-428c-8abf-0adcc6c859a","name":"Oncology"},{"id":"8d07e00c-3fa6-43b9-9cc6-77ff88e6ef8d","name":"Cardiology"},{"id":"0531cc5c-f707-4128-8abc-a8f671ed5090","name":"Gastroenterology"}],"physicalAddress":{"cityTown":"Gaborone","ward":"Ext 11","district":{"id":"1","name":"Greater Gaborone","code":"GC"}},"knownYesNoInfrastructures":[{"id":"b63811ba-50f4-4d00-b909-99d94c575146","type":"Electricity","quantity":0,"isAvailable":true,"available":true},{"id":"24a51401-737c-4240-8648-4e429b1c00b5","type":"Toilets","quantity":0,"isAvailable":true,"available":true},{"id":"31bdab02-80aa-4edf-926e-ae9f0839153a","type":"Running Water","quantity":0,"isAvailable":true,"available":true},{"id":"3dce25bf-8660-4792-aee1-ec525e409e21","type":"Internet","quantity":0,"isAvailable":true,"available":true},{"id":"5db91ec2-4fa2-4dbd-8b78-e941c970ba9f","type":"Laboratory","quantity":0,"isAvailable":true,"available":true},{"id":"1fc10dfa-26fb-40d4-911e-4c7dc9aa8e8f","type":"Pharmacy","quantity":0,"isAvailable":true,"available":true},{"id":"22f30086-9ca5-43d8-a99b-2f0f8f0ad1a9","type":"Public Wi-fi","quantity":0,"isAvailable":true,"available":true},{"id":"8351809e-fa62-43f2-a264-ed83cb0afcde","type":"Cafeteria","quantity":0,"isAvailable":true,"available":true}]}];*/
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
