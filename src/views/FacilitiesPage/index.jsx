/**
 * Created by fulle on 2025/07/07.
 */
import React, { useEffect, useState } from 'react';
import FacilityList from '../../components/Facility/List';
import MFLApiService, { fetchFacilities } from '../../services/mfl.service';

const FacilitiesPage = () => {
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {
        const loadFacilities = async () => {
            try {
                setIsLoading(true);
                const data = await MFLApiService.fetchFacilities();
                setFacilities(data);
            } catch (err) {
                setError('Failed to load facilities. Please try again later.');
                console.error('Facilities fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };


        const getFacilitiesList = async () => {
            try {
                MFLApiService.allFacilities();
            }
            catch(error) {
                window.console.log(error);
            }

        };

        loadFacilities();
        //getFacilitiesList();
    }, []);

    if (isLoading) return <div className="loading-indicator">Loading facilities...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="mb-0">Healthcare Facilities Directory</h1>
                <div className="d-flex">
                    <button className="btn btn-outline-primary me-2">
                        <i className="bi bi-funnel me-1"></i> Filter
                    </button>
                    <div className="input-group" style={{ width: '300px' }}>
                        <input type="text" className="form-control" placeholder="Search facilities..." />
                        <button className="btn btn-primary">
                            <i className="bi bi-search"></i>
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : error ? (
                <div className="alert alert-danger">{error}</div>
            ) : (
                <FacilityList facilities={facilities} />
            )}
        </div>
    );
};

export default FacilitiesPage;