// @ts-check
/** @type {import("xlsx")} */

import { readFile, utils } from 'xlsx';

// Read the Excel file
try {
    const workbook = readFile('./src/mapping.xlsx');
    const sheetName = workbook.SheetNames[0];  // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const data = utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('Sheet Name:', sheetName);
    console.log('\nFirst 5 rows of data:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
    
    // Print column headers
    console.log('\nColumn Headers:');
    if (data[0]) {
        data[0].forEach((header, index) => {
            console.log(`Column ${index + 1}: ${header}`);
        });
    }
    
} catch (error) {
    console.error('Error reading Excel file:', error.message);
    if (error.code === 'ENOENT') {
        console.error('File not found. Please check if the path is correct.');
    }
} 