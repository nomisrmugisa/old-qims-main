/**
 * Created by fulle on 2025/07/07.
 */
export const getFacilityTypeLabel = (type) => {
    const typeMap = {
        'Individual practitioner': 'Private Practice',
        'Clinic': 'Medical Clinic',
        'Poly Clinic': 'Polyclinic',
        'Health Post': 'Health Post',
        'Group practice': 'Group Practice',
        'Day care center': 'Day Care Center',
        'Private Hospital': 'Private Hospital'
    };

    return typeMap[type] || type || 'Unknown Facility Type';
};

export const formatOperationalHours = (hours) => {
    if (!hours.timeFrom && !hours.breakTo) return `${hours.day}: Closed`;

    let timeString = `${hours.day}: `;

    if (hours.timeFrom && hours.breakTo) {
        timeString += `${hours.timeFrom} to ${hours.breakTo}`;
    } else if (hours.timeFrom) {
        timeString += `Opens at ${hours.timeFrom}`;
    }

    return timeString;
};

export const getStatusColor = (status) => {
    return status === 'OPERATIONAL' ? 'success' : 'danger';
};