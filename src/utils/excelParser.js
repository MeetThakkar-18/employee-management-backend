const XLSX = require('xlsx');

/**
 * Parse Excel file and extract data.
 * @param {string} filePath - Path to the Excel file.
 * @returns {Array} Parsed data.
 */
const parseExcelFile = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return data;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return null;
  }
};

module.exports = parseExcelFile;
