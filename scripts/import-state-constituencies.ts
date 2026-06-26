import dotenv from "dotenv";
import * as XLSX from "xlsx";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const filePath = path.join(
  process.cwd(),
  "data",
  "osun-state-constituencies.xlsx"
);

const workbook = XLSX.readFile(filePath);

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json<any>(sheet);

console.log(`Loaded ${rows.length} rows.`);

async function importStateConstituencies() {
  const { data: state, error } = await supabase
    .from("states")
    .select("id, name")
    .eq("code", "OS")
    .single();

  if (error || !state) {
    console.log("❌ Osun State not found.");
    return;
  }

  console.log("✅ State Found:", state.name);
// Take only the first row for testing

let inserted = 0;
let skipped = 0;

for (const row of rows) {
  const constituencyName = row.state_constituency.trim();

  // Check if it already exists
  const { data: existing } = await supabase
    .from("state_constituencies")
    .select("id")
    .eq("state_id", state.id)
    .eq("name", constituencyName)
    .maybeSingle();

  if (existing) {
    skipped++;
    continue;
  }

  const { error: insertError } = await supabase
    .from("state_constituencies")
    .insert({
      state_id: state.id,
      name: constituencyName,
    });

  if (insertError) {
    console.log(`❌ ${constituencyName}: ${insertError.message}`);
    continue;
  }

  inserted++;

  if (inserted % 5 === 0) {
    console.log(`✅ Inserted ${inserted} state constituencies...`);
  }
}

console.log("\n--------------------------------");
console.log("State Constituency Import Complete");
console.log("--------------------------------");
console.log(`Inserted: ${inserted}`);
console.log(`Skipped : ${skipped}`);


// Check if it already exists
const { data: existing } = await supabase
  .from("state_constituencies")
  .select("id")
  .eq("state_id", state.id)
  .eq("name", constituencyName)
  .maybeSingle();

if (existing) {
  console.log("⚠️ State Constituency already exists.");
  return;
}

// Insert it
const { error: insertError } = await supabase
  .from("state_constituencies")
  .insert({
    state_id: state.id,
    name: constituencyName,
  });

if (insertError) {
  console.log("❌ Insert Error:", insertError.message);
  return;
}

console.log(`✅ Inserted: ${constituencyName}`);

}

importStateConstituencies();