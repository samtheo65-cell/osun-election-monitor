import dotenv from "dotenv";
import * as XLSX from "xlsx";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
dotenv.config({ path: ".env.local" });

console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? "Service key loaded ✅" : "Service key missing ❌");

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Excel file path
const filePath = path.join(
  process.cwd(),
  "data",
  "osun-election-geography.xlsx"
);

// Read Excel
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets["Sheet2"];
const rows = XLSX.utils.sheet_to_json<any>(sheet);

async function importWards() {
  console.log("Starting ward import...\n");

  // Keep track of wards we've already processed
  const processed = new Set<string>();

  let inserted = 0;
  let skipped = 0;

  const missingLgas = new Set<string>();

  for (const row of rows) {
    const lgaName = row.LGA.trim();
    const lgaCode = row["Polling Unit Delimeter"].split("-")[1];
    const wardName = row.WARD.trim();

    // Prevent duplicate wards in the Excel file
    const uniqueKey = `${lgaName}|${wardName}`;

    if (processed.has(uniqueKey)) {
      skipped++;
      continue;
    }

    processed.add(uniqueKey);

    // Find the LGA in the database
    const { data: lga, error: lgaError } = await supabase
  .from("lgas")
  .select("id, name, code")
  .eq("code", lgaCode)
  .single();

    if (lgaError || !lga) {
  if (!missingLgas.has(lgaCode)) {
    console.log(`❌ LGA not found: ${lgaName} (Code: ${lgaCode})`);
    missingLgas.add(lgaCode);
  }
  continue;
}

    // Check whether the LGA name matches
if (lga.name.toUpperCase() !== lgaName.toUpperCase()) {
  console.log(
    `⚠️ Name mismatch: Excel = "${lgaName}", Database = "${lga.name}"`
  );
}

    // Check whether the ward already exists
    const { data: existingWard } = await supabase
      .from("wards")
      .select("id")
      .eq("lga_id", lga.id)
      .eq("name", wardName)
      .maybeSingle();

    if (existingWard) {
      skipped++;
      continue;
    }

    // Insert ward
    const { error: insertError } = await supabase
      .from("wards")
      .insert({
        lga_id: lga.id,
        name: wardName,
      });

    if (insertError) {
      console.log(`❌ Error inserting ${wardName}:`, insertError.message);
      continue;
    }

    inserted++;
    console.log(`✅ ${wardName}`);
  }

  console.log("\n--------------------------------");
  console.log("Ward Import Complete");
  console.log("--------------------------------");
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped : ${skipped}`);
}

importWards();