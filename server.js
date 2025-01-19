const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer();
const filePath = path.join(__dirname, 'data.xlsx');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize or Load Existing Excel File
if (!fs.existsSync(filePath)) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filePath);
}

// Save Data to Excel
app.post('/save', upload.none(), (req, res) => {
    const inputData = req.body;

    // Read the existing workbook
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets['Sheet1'];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Append new data
    jsonData.push(inputData);
    const updatedSheet = XLSX.utils.json_to_sheet(jsonData);
    workbook.Sheets['Sheet1'] = updatedSheet;

    // Write back to file
    XLSX.writeFile(workbook, filePath);
    res.json({ message: 'Data saved successfully!' });
});

// Serve the Excel File
app.get('/download', (req, res) => {
    res.download(filePath, 'data.xlsx');
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
