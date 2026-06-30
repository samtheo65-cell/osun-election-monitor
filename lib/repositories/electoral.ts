import { supabase } from "@/lib/supabase";
import type { ElectoralGeography } from "@/lib/types";

type NameHolder = { name: string };

function firstOrEmpty<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getElectoralGeography(
  lgaId: string,
  wardId: string
): Promise<ElectoralGeography> {
  const result: ElectoralGeography = {
    senatorialDistrict: "",
    federalConstituency: "",
    stateConstituency: "",
  };

  // 1) Federal Constituency + Senatorial District (via LGA)
  type FederalConstituencyNested = {
    name: string;
    senatorial_districts?: NameHolder | NameHolder[] | null;
  };

  type FederalResponse = {
    federal_constituencies?: FederalConstituencyNested | FederalConstituencyNested[] | null;
  };

  const { data: federalData, error: federalError } = await supabase
    .from("lga_federal_constituencies")
    .select(`
      federal_constituencies (
        name,
        senatorial_districts (
          name
        )
      )
    `)
    .eq("lga_id", lgaId)
    .single();

  if (federalError) {
    console.error("Federal constituency error:", federalError);
    return result;
  }

  const fc = firstOrEmpty(
    (federalData as FederalResponse | null | undefined)?.federal_constituencies
  );

  if (fc) {
    result.federalConstituency = fc.name || "";
    const sd = firstOrEmpty(fc.senatorial_districts);
    result.senatorialDistrict = sd?.name ?? "";
  }

  // 2) State Constituency (via Ward)
  type StateConstituencyNested = { name: string };

  type StateResponse = {
    state_constituencies?: StateConstituencyNested | StateConstituencyNested[] | null;
  };

  const { data: stateData, error: stateError } = await supabase
    .from("ward_state_constituencies")
    .select(`
      state_constituencies (
        name
      )
    `)
    .eq("ward_id", wardId)
    .single();

  if (stateError) {
    console.error("State constituency error:", stateError);
    return result;
  }

  const sc = firstOrEmpty(
    (stateData as StateResponse | null | undefined)?.state_constituencies
  );

  if (sc) {
    result.stateConstituency = sc.name || "";
  }

  return result;
}