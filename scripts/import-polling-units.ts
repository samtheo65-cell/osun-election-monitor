import dotenv from "dotenv";
import * as XLSX from "xlsx";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Read the Excel file
const filePath = path.join(
  process.cwd(),
  "data",
  "osun-election-geography.xlsx"
);

const workbook = XLSX.readFile(filePath);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json<any>(sheet);

console.log(`Loaded ${rows.length} polling unit rows.`);

async function importPollingUnits() {
  let inserted = 0;
  let skipped = 0;

  console.log("Starting polling unit import...");

for (const row of rows) {
  const lgaName = row.LGA.trim();
  const wardName = row.WARD.trim();
  const pollingUnitName = row["Polling Unit Name"].trim();
  const pollingUnitCode = row["Polling Unit Delimeter"].trim();
  const remark = row.Remark?.trim() ?? "";
  // Extract the LGA code from the polling unit code
const lgaCode = pollingUnitCode.split("-")[1];

// Find the LGA
const { data: lga, error: lgaError } = await supabase
  .from("lgas")
  .select("id, name")
  .eq("code", lgaCode)
  .single();

if (lgaError || !lga) {
  console.log("LGA not found");
  continue;
}

// Find the Ward
const { data: ward, error: wardError } = await supabase
  .from("wards")
  .select("id, name")
  .eq("lga_id", lga.id)
  .eq("name", wardName)
  .single();

if (wardError || !ward) {
  console.log("Ward not found");
  continue;
}

// console.log("LGA Found:", lga.name);
// console.log("Ward Found:", ward.name);
// Check whether the polling unit already exists
const { data: existingPollingUnit } = await supabase
  .from("polling_units")
  .select("id")
  .eq("code", pollingUnitCode)
  .maybeSingle();

if (existingPollingUnit) {
  skipped++;
  continue;
}

// Insert one polling unit
const { error: insertError } = await supabase
  .from("polling_units")
  .insert({
    ward_id: ward.id,
    name: pollingUnitName,
    code: pollingUnitCode,
    remark: remark,
  });

if (insertError) {
  console.log("Insert Error:", insertError.message);
  continue;
}

inserted++;

if (inserted % 100 === 0) {
  console.log(`✅ Inserted ${inserted} polling units...`);
}

 // console.log({
   // lgaName,
    //wardName,
    //pollingUnitName,
    //pollingUnitCode,
    //remark,
  //});


  
}

console.log("\n--------------------------------");
console.log("Polling Unit Import Complete");
console.log("--------------------------------");
console.log(`Inserted: ${inserted}`);
console.log(`Skipped : ${skipped}`);

}

importPollingUnits();



