import React, { useState } from 'react';
import './ClientPortal.css';

const ClientPortal = () => {
    const [activeTab, setActiveTab] = useState('facility-ownership');

    const renderContent = () => {
        switch (activeTab) {
            case 'facility-ownership':
                return <div>
                            <h2>Facility Ownership</h2>
                            <p>Content for Facility Ownership goes here.</p>
                       </div>;
            case 'employee-registration':
                return <div>
                            <h2>Employee Registration</h2>
                            <p>Content for Employee Registration goes here.</p>
                       </div>;
            case 'services-offered':
                return <div>
                            <h2>Services Offered</h2>
                            <p>Content for Services Offered goes here.</p>
                       </div>;
            case 'inspection-schedule':
                return <div>
                                    <h2>Pre-Inspection</h2>
        <p>Content for Pre-Inspection goes here.</p>
                       </div>;
            default:
                return null;
        }
    };

    return (
        <div className="client-portal-container">
            <div className="tabs">
                <button
                    className={activeTab === 'facility-ownership' ? 'active' : ''}
                    onClick={() => setActiveTab('facility-ownership')}
                >
                    Facility Ownership
                </button>
                <button
                    className={activeTab === 'employee-registration' ? 'active' : ''}
                    onClick={() => setActiveTab('employee-registration')}
                >
                    Employee Registration
                </button>
                <button
                    className={activeTab === 'services-offered' ? 'active' : ''}
                    onClick={() => setActiveTab('services-offered')}
                >
                    Services Offered
                </button>
                <button
                    className={activeTab === 'inspection-schedule' ? 'active' : ''}
                    onClick={() => setActiveTab('inspection-schedule')}
                >
                    Pre-Inspection
                </button>
            </div>
            <div className="tab-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default ClientPortal; 