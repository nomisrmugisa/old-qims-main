/**
 * Created by fulle on 2025/07/07.
 */
import React from 'react';
import { formatOperationalHours } from '../../../utils/helpers';

const FacilityDetails = ({ facility }) => {
    if (!facility) return (
        <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    const {
        facilityName,
        newFacilityCode,
        oldFacilityCode,
        district,
        facilityType,
        facilityOwner,
        status,
        telephone,
        physicalAddress,
        operationalTimes,
        facilityServices = [],
        lat,
        lng
    } = facility;

    const statusColor = status === 'OPERATIONAL' ? 'success' : 'danger';

    return (
        <div className="card shadow-sm">
            <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className="h3 mb-0">{facilityName}</h1>
                    <div>
            <span className={`badge bg-${statusColor} me-2`}>
              {status}
            </span>
                        <span className="badge bg-secondary">
              ID: {newFacilityCode} {oldFacilityCode && `(${oldFacilityCode})`}
            </span>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div className="row">
                    <div className="col-md-8">
                        <section className="mb-4">
                            <h2 className="h5 mb-3 border-bottom pb-2">Basic Information</h2>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <div className="fw-bold text-muted">Type</div>
                                    <div>{facilityType?.name || 'N/A'}</div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="fw-bold text-muted">Ownership</div>
                                    <div>{facilityOwner}</div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="fw-bold text-muted">District</div>
                                    <div>{district?.name || 'N/A'}</div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="fw-bold text-muted">Phone</div>
                                    <div>{telephone || 'Not available'}</div>
                                </div>
                            </div>
                        </section>

                        {physicalAddress && (
                            <section className="mb-4">
                                <h2 className="h5 mb-3 border-bottom pb-2">Address</h2>
                                <address className="mb-0">
                                    {[
                                        physicalAddress.plotNumber,
                                        physicalAddress.streetName,
                                        physicalAddress.buildingName,
                                        physicalAddress.ward,
                                        physicalAddress.cityTown
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </address>
                            </section>
                        )}

                        {operationalTimes?.length > 0 && (
                            <section className="mb-4">
                            <h2 className="h5 mb-3 border-bottom pb-2">Operating Hours</h2>
                            <div className="row">
                            {operationalTimes.map((hours, index) => (
                                <div key={index} className="col-md-6 mb-2">
                                    {formatOperationalHours(hours)}
                                </div>
                            ))}
                            </div>
                            </section>
                            )}

                        {facilityServices.length > 0 && (
                            <section>
                                <h2 className="h5 mb-3 border-bottom pb-2">Services Offered</h2>
                                <div className="d-flex flex-wrap gap-2">
                                    {facilityServices.map(service => (
                                        <span key={service.id} className="badge bg-info text-dark">
                      {service.name}
                    </span>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="col-md-4">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="h6 mb-0">Location</h3>
                            </div>
                            <div className="card-body">
                                {lat && lng ? (
                                    <div className="bg-light rounded p-3 text-center">
                                        <div className="mb-2">
                                            <i className="bi bi-geo-alt-fill text-danger fs-4"></i>
                                        </div>
                                        <p className="mb-2">Lat: {lat}</p>
                                        <p className="mb-0">Lng: {lng}</p>
                                        <button className="btn btn-sm btn-outline-primary mt-3">
                                            View on Map
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-3">
                                        <i className="bi bi-geo-alt-slash fs-1"></i>
                                        <p className="mt-2 mb-0">Location data not available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card mt-3">
                            <div className="card-header">
                                <h3 className="h6 mb-0">Contact Information</h3>
                            </div>
                            <div className="card-body">
                                {telephone ? (
                                    <div>
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="bi bi-telephone me-2"></i>
                                            <a href={`tel:${telephone}`}>{telephone}</a>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-envelope me-2"></i>
                                            <a href={`mailto:info@${facilityName.replace(/\s+/g, '').toLowerCase()}.bw`}>
                                                info@{facilityName.replace(/\s+/g, '').toLowerCase()}.bw
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted mb-0">Contact information not available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacilityDetails;