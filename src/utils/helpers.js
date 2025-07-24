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

export const getInitials = (name) => {
    if (!name) return '';
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .join('');
};

export const toggle = (val, selected, onChange) => {
    if (selected.includes(val)) {
        onChange(selected.filter(v => v !== val));
    } else {
        onChange([...selected, val]);
    }
};

export const extractDataElementValues = (events, dataElementId) => {
    return events.map(event => {
        const dataValue = event.dataValues.find(
            dv => dv.dataElement === dataElementId
        );
        return dataValue ? dataValue.value : null;
    });
};

export const findIdByName = (obj, targetName) => {
    // Loop through each key in the object
    for (const key in obj) {
        const value = obj[key];

        // If the current value has a 'NAME' property and it matches the target
        if (value?.NAME === targetName) {
            return value.ID; // Return the corresponding ID
        }

        // If the value is an object, recursively search inside it
        if (typeof value === 'object' && value !== null) {
            const foundId = findIdByName(value, targetName);
            if (foundId) return foundId; // Return if found in nested objects
        }
    }

    return null; // Return null if no match is found
};

export const findNameById = (obj, targetId) => {
    // Loop through each key in the object
    for (const key in obj) {
        const value = obj[key];

        // If the current value has a 'NAME' property and it matches the target
        if (value?.ID === targetId) {
            return value.ID; // Return the corresponding ID
        }

        // If the value is an object, recursively search inside it
        if (typeof value === 'object' && value !== null) {
            const foundId = findNameById(value, targetId);
            if (foundId) return foundId; // Return if found in nested objects
        }
    }

    return null; // Return null if no match is found
};