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
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

// Clean the column names and handle Excel blank cells (merged cells simulation)
let currentConstituency = "";
const rows = rawRows.map((row) => {
  const cleaned: Record<string, any> = {};
  Object.keys(row).forEach((key) => {
    cleaned[key.trim()] = row[key];
  });

  // If the constituency column is populated, update our tracker
  const rawConstituency = cleaned["state_constituencies"]?.trim();
  if (rawConstituency) {
    currentConstituency = rawConstituency;
  }

  return {
    stateConstituency: currentConstituency,
    ward: cleaned["ward"]?.trim(),
  };
}).filter(row => !!row.ward); // Skip any completely empty rows

async function importWardStateMapping() {
  console.log(`Loaded ${rows.length} Ward rows from Excel.`);
  console.log("Starting Ward → State Constituency mapping import...\n");

  // 1. Fetch all State Constituencies from database
  const { data: dbConstituencies, error: constituencyError } = await supabase
    .from("state_constituencies")
    .select("id, name");

  if (constituencyError) {
    console.log("❌ Error fetching State Constituencies:", constituencyError.message);
    return;
  }

  // 2. Fetch all Wards along with their LGA name to handle duplicate ward names
  const { data: dbWards, error: wardError } = await supabase
    .from("wards")
    .select(`
      id,
      name,
      lgas (
        name
      )
    `);

  if (wardError || !dbWards) {
    console.log("❌ Error fetching Wards:", wardError?.message);
    return;
  }

  console.log(`✓ Fetched ${dbConstituencies.length} State Constituencies from database.`);
  console.log(`✓ Fetched ${dbWards.length} Wards from database.`);

  // 3. Build Lookup Map for State Constituencies
  const constituencyMap = new Map(
    dbConstituencies.map((sc) => [sc.name.toUpperCase().replace(/\s+/g, " "), sc.id])
  );

  // 4. Build mapping records
  const recordsToInsert: { ward_id: string; state_constituency_id: string }[] = [];
  const unmappedWards: string[] = [];

  for (const row of rows) {
    const excelWardName = row.ward.toUpperCase();
    const excelConstituencyName = row.stateConstituency.toUpperCase().replace(/\s+/g, " ");

    // Get State Constituency ID
    const stateConstituencyId = constituencyMap.get(excelConstituencyName);

    if (!stateConstituencyId) {
      console.log(`❌ State Constituency not found in database: "${row.stateConstituency}"`);
      unmappedWards.push(row.ward);
      continue;
    }

    // Find wards matching this name
    const candidateWards = dbWards.filter(w => w.name.toUpperCase() === excelWardName);

    if (candidateWards.length === 0) {
      console.log(`❌ Ward name not found in database: "${row.ward}"`);
      unmappedWards.push(row.ward);
      continue;
    }

    let matchedWardId: string | null = null;

    if (candidateWards.length === 1) {
      // Unique name, match immediately
      matchedWardId = candidateWards[0].id;
    } else {
      // Duplicate ward names exist! Match by verifying parent LGA name is part of Constituency name
      const matchedWard = candidateWards.find(w => {
        const lgaName = (w.lgas as any)?.name?.toUpperCase();
        return lgaName && excelConstituencyName.includes(lgaName);
      });

      if (matchedWard) {
        matchedWardId = matchedWard.id;
      }
    }

    if (matchedWardId) {
      recordsToInsert.push({
        ward_id: matchedWardId,
        state_constituency_id: stateConstituencyId,
      });
    } else {
      console.log(`❌ Could not uniquely resolve duplicate ward: "${row.ward}" under constituency "${row.stateConstituency}"`);
      unmappedWards.push(row.ward);
    }
  }

  console.log(`\nPrepared ${recordsToInsert.length} mappings.`);
  if (unmappedWards.length > 0) {
    console.log(`⚠️ Unmapped wards: ${unmappedWards.length}. Aborting insertion to preserve data integrity.`);
    return;
  }

  // 5. Clear existing mappings safely (Idempotency)
  console.log("\nClearing old mappings...");
  const { error: deleteError } = await supabase
    .from("ward_state_constituencies")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteError) {
    console.log("❌ Delete failed:", deleteError.message);
    return;
  }

  // 6. Bulk Insert
  console.log("Inserting new mappings...");
  const { error: insertError } = await supabase
    .from("ward_state_constituencies")
    .insert(recordsToInsert);

  if (insertError) {
    console.log("❌ Insert failed:", insertError.message);
    return;
  }

  console.log(`\n🎉 SUCCESS! Mapped ${recordsToInsert.length} Wards to State Constituencies successfully.`);
}

importWardStateMapping();