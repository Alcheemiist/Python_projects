import XLSX from 'xlsx';
import XlsxPopulate  from 'xlsx-populate';


// Path to the source Excel file
const sourceFile = './StudentJobPrediction_NY.xlsx';

// Path to the destination Excel file
const destinationFile = './result_NY.xlsx';

// Columns to extract from the source file
const columnsToExtract = ['Name', 'grades', 'Jobs title']; // Modify as per your requirements

// Map of source column letter to destination column letter
const columnMapping = {
    Name: 'D',
    grades: 'E',
    "Jobs title": 'F',
}; // Modify as per your requirements

// Read the source file
const workbook = XLSX.readFile(sourceFile);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

// Extract data from the specified columns
const extractedData = [];
columnsToExtract.forEach((column) => {
  const cellRange = worksheet[column];
  const columnData = cellRange ? cellRange.map((cell) => cell.v) : [];
  extractedData.push(columnData);
});

// Format the data and put it in the new columns
XlsxPopulate.fromBlankAsync()
  .then((workbook) => {
    const worksheet = workbook.sheet(0);

    // Write the extracted data to the new columns
    extractedData.forEach((columnData, index) => {
      const destinationColumn = columnMapping[columnsToExtract[index]];
      columnData.forEach((value, rowIndex) => {
        worksheet.cell(destinationColumn + (rowIndex + 1)).value(value);
      });
    });

    // Save the destination file
    return workbook.toFileAsync(destinationFile);
  })
  .then(() => {
    console.log('Data extraction and formatting completed.');
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  });
