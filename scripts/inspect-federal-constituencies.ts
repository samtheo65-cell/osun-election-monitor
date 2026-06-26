import * as XLSX from "xlsx";
import path from "path";

const filePath = path.join(
  process.cwd(),
  "data",
  "osun-lga-constituency-mapping.xlsx"
);

const workbook = XLSX.readFile(filePath);

// Show all sheet names
console.log("Sheets:");
console.log(workbook.SheetNames);

// Read the first sheet
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

const rows = rawRows.map((row) => ({
  state: row["state"]?.trim(),
  senatorial_district: row["senatorial_district"]?.trim(),
  federal_constituency: row["federal_constituency"]?.trim(),
  state_constituency: row["state_constituency"]?.trim(),
  lga: row["lga"]?.trim(),
}));

console.log("\nTotal Rows:");
console.log(rows.length);

console.log("\nFirst 5 Rows:");
console.log(rows.slice(0, 5));

const uniqueFederalConstituencies = [
  ...new Set(rows.map((row) => row.federal_constituency)),
];

console.log("\nUnique Federal Constituencies:");
console.log(uniqueFederalConstituencies);

console.log("\nTotal Unique Federal Constituencies:");
console.log(uniqueFederalConstituencies.length);