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
  "osun-lga-constituency-mapping.xlsx"
);

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<any>(sheet);

console.log(`Loaded ${rows.length} rows.`);

async function testMapping() {
  const row = rows[0];

  console.log(row);

  const lgaName = row.lga.trim();
  const federalName = row.federal_constituency.trim();
  const stateConstituencyName = row.state_constituency.trim();

  const normalizedFederalName = federalName
  .split("/")
  .map((part: string) => part.trim())
  .join(" / ");

  // Find the LGA
  const { data: lga } = await supabase
    .from("lgas")
    .select("id, name")
    .eq("name", lgaName.toUpperCase().trim())
    .single();

  
    // Find the Federal Constituency
  const { data: federal } = await supabase
    .from("federal_constituencies")
    .select("id, name")
    .eq("name", normalizedFederalName)
    .single();

  // Find the State Constituency
  const { data: stateConstituency } = await supabase
    .from("state_constituencies")
    .select("id, name")
    .eq("name", stateConstituencyName)
    .single();

  console.log("LGA:", lga);
  console.log("Federal:", federal);
  console.log("State Constituency:", stateConstituency);
}

testMapping();