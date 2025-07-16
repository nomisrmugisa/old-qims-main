/**
 * Created by fulle on 2025/07/16.
 */

// Add this helper function
export const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};

// Updated mapping function
export const mapInspectionsToEvents = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];

    const events = [];

    apiData.forEach((schedule) => {
        const { startDate, endDate, facilityId, facilityName, assignments } = schedule;

        // Process each day in the inspection range
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAssignments = assignments.filter(ass =>
                new Date(ass.startDate || startDate) <= currentDate &&
                new Date(ass.endDate || endDate) >= currentDate
            );

            if (dayAssignments.length > 0) {
                events.push({
                    id: `${facilityId}-${dateStr}`,
                    title: facilityName,
                    start: dateStr,
                    end: addOneDay(dateStr),
                    allDay: true,
                    extendedProps: {
                        date: dateStr,
                        facilityId,
                        facilityName,
                        assignments: dayAssignments
                    }
                });
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    });

    return events;
};

export const extractFacilityOptions = (apiData) => {
    if (!apiData) return [];
    const facilities = new Map();

    apiData.forEach(item => {
        if (!facilities.has(item.facilityId)) {
            facilities.set(item.facilityId, {
                value: item.facilityId,
                label: item.facilityName
            });
        }
    });

    return Array.from(facilities.values());
};

// Updated extractInspectorOptions
export const extractInspectorOptions = (apiData) => {
    if (!apiData) return [];
    const inspectors = new Map();

    apiData.forEach(item => {
        item.assignments.forEach(ass => {
            if (ass.inspectorId && !inspectors.has(ass.inspectorId)) {
                inspectors.set(ass.inspectorId, {
                    value: ass.inspectorId,
                    label: ass.inspectorName
                });
            }
        });
    });

    return Array.from(inspectors.values());
};

export const formatInclusiveEnd = (endExclusiveStr) => {
    if (!endExclusiveStr) return '';
    const d = new Date(endExclusiveStr);
    if (isNaN(d)) return endExclusiveStr;
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
};

export const subtractOneDay = (isoDate) => {
    const d = new Date(isoDate);
    if (isNaN(d)) return isoDate;
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
};


