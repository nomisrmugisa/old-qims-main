import { readFile, utils } from 'xlsx';

// Constants for facility types (these should match the DHIS2 option codes)
export const FACILITY_TYPES = {
    INDIVIDUAL_PRIVATE_PRACTICE: 'INDIVIDUAL_PRIVATE_PRACTICE',
    NURSE_LED_PRIVATE_PRACTICE: 'NURSE_LED_PRIVATE_PRACTICE',
    OUTREACH_PRACTICE: 'OUTREACH_PRACTICE',
    MULTIPLE_LICENCES: 'MULTIPLE_LICENCES',
    GROUP_PRACTICE: 'GROUP_PRACTICE',
    F_EMS: 'F_EMS',
    PRIVATE_HOSPITAL: 'PRIVATE_HOSPITAL',
    NOT_FOR_PROFIT: 'NOT_FOR_PROFIT'
};

// Column indices in the Excel file (0-based)
const EXCEL_COLUMNS = {
    ID: 0,
    DOCUMENT_NAME: 1,
    INDIVIDUAL_PRIVATE_PRACTICE: 2,
    NURSE_LED_PRIVATE_PRACTICE: 3,
    OUTREACH_PRACTICE: 4,
    MULTIPLE_LICENCES: 5,
    GROUP_PRACTICE: 6,
    F_EMS: 7,
    PRIVATE_HOSPITAL: 8,
    NOT_FOR_PROFIT: 9
};

/**
 * Reads the mapping Excel file and returns a mapping object
 * @returns {Object.<string, string[]>} Mapping of facility type codes to required document IDs
 */
export function getFacilityTypeMapping() {
    try {
        // Read the Excel file
        const workbook = readFile('./src/mapping.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = utils.sheet_to_json(worksheet, { header: 1 });

        // Skip the header row and create mapping
        const mapping = {};
        
        // Initialize empty arrays for each facility type
        Object.values(FACILITY_TYPES).forEach(type => {
            mapping[type] = [];
        });

        // Start from row 1 (skip header)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const documentId = row[EXCEL_COLUMNS.ID];
            
            if (!documentId) continue;

            // Check each facility type column
            Object.entries(FACILITY_TYPES).forEach(([key, value]) => {
                const columnIndex = EXCEL_COLUMNS[key];
                if (row[columnIndex] === '✓') {
                    mapping[value].push(documentId);
                }
            });
        }

        return mapping;
    } catch (error) {
        console.error('Error reading facility type mapping:', error);
        return {};
    }
}

/**
 * Returns the ordered list of document IDs as they appear in the Excel file (skipping header)
 * @returns {string[]} Ordered document IDs
 */
export function getOrderedDocumentIds() {
    try {
        const workbook = readFile('./src/mapping.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = utils.sheet_to_json(worksheet, { header: 1 });
        // Skip header row, return only IDs that are truthy
        return data.slice(1).map(row => row[0]).filter(Boolean);
    } catch (error) {
        console.error('Error reading ordered document IDs:', error);
        return [];
    }
}

// Export the facility type field ID
export const FACILITY_TYPE_FIELD_ID = 'L3XSi86lGBP';

/**
 * Determines if a data element should be shown for a given facility type
 * @param {string} dataElementId - The ID of the data element to check
 * @param {string} selectedFacilityType - The currently selected facility type
 * @param {Object.<string, string[]>} mapping - The facility type mapping object
 * @returns {boolean} - Whether the data element should be shown
 */
export function shouldShowDataElement(dataElementId, selectedFacilityType, mapping = getFacilityTypeMapping()) {
    // If no mapping or no facility type selected, show all fields
    if (!selectedFacilityType || Object.keys(mapping).length === 0) return true;

    // If this facility type isn't in our mapping, show all fields
    if (!mapping[selectedFacilityType]) return true;

    // If the field is required for this facility type, show it
    if (mapping[selectedFacilityType].includes(dataElementId)) return true;

    // If the field isn't in any mapping, show it by default
    const allMappedFields = Object.values(mapping).flat();
    if (!allMappedFields.includes(dataElementId)) return true;

    // Otherwise, hide it
    return false;
} 