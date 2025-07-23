/**
 * Created by fulle on 2025/07/07.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { getFacilityTypeLabel } from '../../../utils/helpers';

const FacilityListItem = ({ facility }) => {
    const {
        facilityName,
        newFacilityCode,
        district,
        facilityType,
        facilityOwner,
        status,
        telephone,
        operationalTimes
    } = facility;

    // Determine status color
    const statusColor = status === 'OPERATIONAL' ? 'success' : 'danger';

    return (
        <div className="card h-100 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="h5 mb-0">{facilityName}</h3>
                <span className={`badge bg-${statusColor}`}>
          {status}
        </span>
            </div>

            <div className="card-body">
                <div className="mb-3">
                    <div className="d-flex mb-1">
                        <span className="text-muted me-2">ID:</span>
                        <span className="fw-bold">{newFacilityCode}</span>
                    </div>
                    <div className="d-flex mb-1">
                        <span className="text-muted me-2">Type:</span>
                        <span>{getFacilityTypeLabel(facilityType?.name)}</span>
                    </div>
                    <div className="d-flex">
                        <span className="text-muted me-2">District:</span>
                        <span>{district?.name || 'N/A'}</span>
                    </div>
                </div>

                <div className="border-top pt-2">
                    <div className="d-flex mb-1">
                        <span className="text-muted me-2">Ownership:</span>
                        <span>{facilityOwner}</span>
                    </div>
                    {telephone && (
                        <div className="d-flex">
                            <span className="text-muted me-2">Phone:</span>
                            <span>{telephone}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-footer bg-white border-top-0">
                <div className="d-flex justify-content-between align-items-center">
                    <Link
                        to={`/facility/${newFacilityCode}`}
                        className="btn btn-sm btn-outline-primary"
                    >
                        View Details
                    </Link>

                    {operationalTimes?.length > 0 && (
                        <small className="text-muted">
                        {operationalTimes.length} operating days
                        </small>
                        )}
                </div>
            </div>
        </div>
    );
};

export default FacilityListItem;