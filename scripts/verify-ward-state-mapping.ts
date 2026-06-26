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
  "osun-ward-state-constituencies.xlsx"
);

// Read workbook
const workbook = XLSX.readFile(filePath);

// First sheet
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Read rows
const rawRows = XLSX.utils.sheet_to_json<any>(sheet);


// Clean column names
const rows = rawRows.map((row) => {
  const cleaned: Record<string, any> = {};

  Object.keys(row).forEach((key) => {
    cleaned[key.trim()] = row[key];
  });

  return {
  stateConstituency: cleaned["state_constituencies"]?.trim(),
  ward: cleaned["ward"]?.trim(),
};
});

async function verifyWardNames() {
  console.log(`Loaded ${rows.length} Excel rows.\n`);

  const emptyRows = rows.filter((row) => !row.ward);

    console.log(`Empty Ward Rows: ${emptyRows.length}\n`);

  // Read all wards
  const { data: dbWards, error } = await supabase
    .from("wards")
    .select("name");

  if (error) {
    console.log(error.message);
    return;
  }

  // Build lookup
  const wardSet = new Set(
    dbWards.map((w) => w.name.toUpperCase())
  );

  let matched = 0;
  const missing: string[] = [];

 for (const row of rows) {

  // Skip completely empty rows
  if (!row.ward) {
    continue;
  }

  const wardName = row.ward.toUpperCase();

  if (wardSet.has(wardName)) {
    matched++;
  } else {
    missing.push(row.ward);
  }

}

  console.log("-----------------------------------");
  console.log(`Matched : ${matched}`);
  console.log(`Missing : ${missing.length}`);
  console.log("-----------------------------------");

  if (missing.length > 0) {

    console.log("\nMissing Wards:\n");

    missing.forEach((ward) => console.log(ward));

  } else {

    console.log("\n✅ Every ward matches the database.");

  }

}

verifyWardNames();