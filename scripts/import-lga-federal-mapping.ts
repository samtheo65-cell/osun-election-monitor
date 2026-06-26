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
    lga: cleanedRow["lga"]?.trim(),
    federalConstituency: cleanedRow["federal_constituency"]?.trim(),
  };
});

console.log(`Loaded ${rows.length} rows.`);

async function importLgaFederalMapping() {
  console.log("Starting LGA → Federal Constituency mapping import...\n");

  // 1. Fetch all LGAs
  const { data: dbLgas, error: lgaError } = await supabase
    .from("lgas")
    .select("id, name");

  if (lgaError) {
    console.log("❌ Error fetching LGAs:", lgaError.message);
    return;
  }

  // 2. Fetch all Federal Constituencies
  const { data: dbFederals, error: federalError } = await supabase
    .from("federal_constituencies")
    .select("id, name");

  if (federalError) {
    console.log("❌ Error fetching Federal Constituencies:", federalError.message);
    return;
  }

  console.log(`✓ Fetched ${dbLgas.length} LGAs from database.`);
  console.log(`✓ Fetched ${dbFederals.length} Federal Constituencies from database.`);

  // Build lookup map for LGAs
const lgaMap = new Map(
  dbLgas.map((lga) => [lga.name.toUpperCase(), lga.id])
);

// Build lookup map for Federal Constituencies
const federalMap = new Map(
  dbFederals.map((federal) => [federal.name, federal.id])
);

console.log("\n✅ Lookup maps created.");
console.log(`LGA Map Size: ${lgaMap.size}`);
console.log(`Federal Map Size: ${federalMap.size}`);

console.log("\nChecking first five LGAs...\n");

rows.slice(0, 5).forEach((row) => {
  console.log({
    excel: row.lga,
    lookup: row.lga.toUpperCase(),
    exists: lgaMap.has(row.lga.toUpperCase()),
  });
});

const recordsToInsert = rows.map((row) => ({
  lga_id: lgaMap.get(row.lga.toUpperCase()),
  federal_constituency_id: federalMap.get(row.federalConstituency),
}));

console.log("\nRecords to insert:");
console.log(recordsToInsert.slice(0, 5));

console.log(`\nTotal records: ${recordsToInsert.length}`);

// Delete existing mappings
const { error: deleteError } = await supabase
  .from("lga_federal_constituencies")
  .delete()
  .neq("id", "00000000-0000-0000-0000-000000000000");

if (deleteError) {
  console.log("Delete failed:");
  console.log(deleteError.message);
  return;
}

const { error: insertError } = await supabase
  .from("lga_federal_constituencies")
  .insert(recordsToInsert);

if (insertError) {
  console.log("Insert failed:");
  console.log(insertError.message);
  return;
}

console.log(`✅ Successfully imported ${recordsToInsert.length} LGA → Federal Constituency mappings.`);

}

importLgaFederalMapping();