/**
 * Created by fulle on 2025/07/07.
 */
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import FacilityDetails from '../../components/Facility/Details';
import { fetchFacilityById } from '../../services/mfl.service';

const FacilityDetailPage = () => {
    const { facilityId } = useParams();
    const [facility, setFacility] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadFacility = async () => {
            try {
                setIsLoading(true);
                const data = await fetchFacilityById(facilityId);
                setFacility(data);
            } catch (err) {
                setError('Facility not found or failed to load details.');
                console.error('Facility fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (facilityId) loadFacility();
    }, [facilityId]);

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Facility Details</h1>
                <Link to="/facilities" className="btn btn-outline-primary">
                    <i className="bi bi-arrow-left me-1"></i> Back to List
                </Link>
            </div>

            {isLoading && (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger">{error}</div>
            )}

            {facility && <FacilityDetails facility={facility} />}
        </div>
    );
};

export default FacilityDetailPage;