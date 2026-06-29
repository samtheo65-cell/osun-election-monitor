import { supabase } from "@/lib/supabase";
import { ElectoralGeography } from "@/lib/types";

export async function getElectoralGeography(
  lgaId: string,
  wardId: string
): Promise<ElectoralGeography> {
  const result: ElectoralGeography = {
    senatorialDistrict: "",
    federalConstituency: "",
    stateConstituency: "",
  };

  // 1. Get Federal Constituency and Senatorial District
  const { data: federalData, error: federalError } = await supabase
    .from("lga_federal_constituencies")
    .select(`
      federal_constituency_id,
      federal_constituencies!inner (
        name,
        senatorial_district_id,
        senatorial_districts!inner (
          name
        )
      )
    `)
    .eq("lga_id", lgaId)
    .single();

  if (federalError) {
    console.error("Federal constituency error:", federalError);
  }

  if (federalData?.federal_constituencies) {
    const fc = federalData.federal_constituencies as any;
    result.federalConstituency = fc.name || "";
    
    if (fc.senatorial_districts) {
      result.senatorialDistrict = fc.senatorial_districts.name || "";
    }
  }

  // 2. Get State Constituency
  const { data: stateData, error: stateError } = await supabase
    .from("ward_state_constituencies")
    .select(`
      state_constituency_id,
      state_constituencies!inner (
        name
      )
    `)
    .eq("ward_id", wardId)
    .single();

  if (stateError) {
    console.error("State constituency error:", stateError);
  }

  if (stateData?.state_constituencies) {
    const sc = stateData.state_constituencies as any;
    result.stateConstituency = sc.name || "";
  }

  return result;
}