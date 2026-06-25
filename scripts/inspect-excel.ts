import * as XLSX from "xlsx";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "data",
  "osun-election-geography.xlsx"
);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets["Sheet2"];

const data = XLSX.utils.sheet_to_json<any>(sheet);

// Get all LGAs
const lgas = [...new Set(data.map(row => row.LGA))];

// Get all Wards
const wards = [...new Set(data.map(row => `${row.LGA} - ${row.WARD}`))];

console.log("Total LGAs:", lgas.length);

console.log("Total Wards:", wards.length);

console.log("\nFirst 10 LGAs:");

console.log(lgas.slice(0,10));