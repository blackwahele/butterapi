import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import fs from 'fs';
import APIError from './APIError.js';
import APIResponse from './APIResponse.js';
import ServerError from './ServerError.js';

const GetExcelData = async function(req, res) {
    try {
        if (req.files && typeof req.files === 'object' && Object.keys(req.files).length > 0) {
            const filesArray = Array.isArray(req.files) ? req.files : [req.files];
            const file = filesArray[0];
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                const filePath = file.path;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(filePath);
                const data = [];

                workbook.eachSheet((worksheet, sheetId) => {
                    const headerRow = worksheet.getRow(1);  // Get the header row
                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber !== 1) {  // Skip the header row
                            const rowData = {};

                            // Iterate over all columns based on header row length
                            headerRow.eachCell((headerCell, colNumber) => {
                                const key = headerCell.value.toString().trim();
                                // Get the cell in the current row for this column
                                const cell = row.getCell(colNumber);

                                // If the cell exists and has a value, get the value; otherwise, leave it undefined or set it to null/empty string
                                const value = cell.value && typeof cell.value === 'object' ? cell.value.text : cell.value || null;

                                rowData[key] = value;
                            });

                            data.push(rowData);
                        }
                    });
                });
                return data;
                // return res.status(200).json(new APIResponse(200, 'Get Excel Data Request!', data, "Fetch Data Detail Successfully."));
            } else {
                return res.status(400).json(new APIError(400, "Get Excel Data Request!", "Unsupported file format. Please upload an Excel or CSV file."));
            }
        } else {
            return res.status(400).json(new APIError(400, "Get Excel Data Request!", "No File Uploaded."));
        }
    } catch (error) {
        return ServerError(res, error, "Get Excel Data Request!");
    }
};

/* 
const GetExcelDataOLD = async function(req,res) {
    try {
        if(req.files && typeof req.files === 'object' && Object.keys(req.files).length > 0){
            const filesArray = Array.isArray(req.files) ? req.files : [req.files];
            const file = filesArray[0];
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                const filePath = file.path;
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.readFile(filePath);
                const data = [];             
                workbook.eachSheet((worksheet, sheetId) => {                   
                    let isFirstRow = true;
                    worksheet.eachRow((row, rowNumber) => {                       
                        if (!isFirstRow) {
                            const rowData = {};
                            row.eachCell((cell, colNumber) => {
                                //here headerCell get Header Value
                                console.log("headerCell-->",colNumber)
                                const headerCell = worksheet.getRow(1).getCell(colNumber); // first row first col, first row second coll, ...... 
                                const key = headerCell.value.toString().trim();  // in key contain header value

                                const value = cell.value && typeof cell.value === 'object' ? cell.value.text : cell.value;
                                rowData[key] = value;
                               
                            });
                            data.push(rowData);
                        }
                        isFirstRow = false;
                    });
                });
                
                return data;             

            } else {                
                return res.status(400).json(new APIError(400,"Get Excel Data Request!","Unsupported file format. Please upload an Excel or CSV file"));
            }
           
        }else{
            return res.status(400).json(new APIError(400,"Get Excel Data Request!","No File Uploaded."));
        }
    } catch (error) {
        ServerError(res,error,"Get Excel Data Request!");        
    }
} */

export default GetExcelData;