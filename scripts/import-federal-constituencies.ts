import dotenv from "dotenv";
import * as XLSX from "xlsx";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config({ path: ".env.local" });



// This script is safe to rerun.
// It deletes the existing Federal Constituencies before importing
// the official records from the Osun Government document.

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Excel file
const filePath = path.join(
  process.cwd(),
  "data",
  "osun-lga-constituency-mapping.xlsx"
);

// Read workbook
const workbook = XLSX.readFile(filePath);

// Read first sheet
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Convert to JSON
const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

// Clean the column names
const rows = rawRows.map((row) => {
  const cleanedRow: Record<string, any> = {};

  Object.keys(row).forEach((key) => {
    cleanedRow[key.trim()] = row[key];
  });

  return {
    state: cleanedRow["state"]?.trim(),
    senatorialDistrict: cleanedRow["senatorial_district"]?.trim(),
    federalConstituency: cleanedRow["federal_constituency"]?.trim(),
  };
});




async function importFederalConstituencies() {
    
  const { data: districts, error: districtError } = await supabase
  .from("senatorial_districts")
  .select("id, name");

if (districtError) {
  console.log("Error:", districtError.message);
  return;
}

// Delete existing Federal Constituencies for these districts
const districtIds = districts.map(d => d.id);

const { error: deleteError } = await supabase
  .from("federal_constituencies")
  .delete()
  .in("senatorial_district_id", districtIds);

if (deleteError) {
  console.log("Delete error:", deleteError.message);
  return;
}

  const districtMap = new Map(
  districts.map((district) => [district.name, district.id])
);


const federalConstituencies = [
  ...new Map(
    rows.map((row) => [
      row.federalConstituency,
      {
        name: row.federalConstituency,
        senatorialDistrict: row.senatorialDistrict,
      },
    ])
  ).values(),
];

const recordsToInsert = federalConstituencies.map((constituency) => ({
  name: constituency.name,
  senatorial_district_id: districtMap.get(
    constituency.senatorialDistrict
  ),
}));

const { error } = await supabase
  .from("federal_constituencies")
  .insert(recordsToInsert);

if (error) {
  console.log("Import failed:");
  console.log(error.message);
  return;
}

console.log(`✅ Successfully imported ${recordsToInsert.length} Federal Constituencies.`);

}

importFederalConstituencies();