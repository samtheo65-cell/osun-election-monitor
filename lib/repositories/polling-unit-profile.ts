import { supabase } from "@/lib/supabase";

export interface PollingUnitProfileData {
  id: string;
  name: string;
  code: string;

  ward: string;
  lga: string;
  state: string;

  senatorialDistrict: string;
  federalConstituency: string;
  stateConstituency: string;
}

type NameHolder = { name: string };

function firstOrEmpty<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export async function getPollingUnitProfile(
  pollingUnitId: string
): Promise<PollingUnitProfileData | null> {
  // 1) Polling Unit + Ward + LGA + State (through nested relationships)
  type StateNested = NameHolder;
  type LgaNested = {
    id: string;
    name: string;
    states?: StateNested | StateNested[] | null;
  };
  type WardNested = {
    id: string;
    name: string;
    lgas?: LgaNested | LgaNested[] | null;
  };

  type PollingUnitNested = {
    id: string;
    name: string;
    code: string;
    wards?: WardNested | WardNested[] | null;
  };

  const { data: pollingUnit, error: pollingUnitError } = await supabase
    .from("polling_units")
    .select(`
      id,
      name,
      code,
      wards (
        id,
        name,
        lgas (
          id,
          name,
          states (
            name
          )
        )
      )
    `)
    .eq("id", pollingUnitId)
    .single();

  if (pollingUnitError || !pollingUnit) {
    throw pollingUnitError ?? new Error("Polling Unit not found.");
  }

  const pu = pollingUnit as PollingUnitNested;

  const ward = firstOrEmpty(pu.wards);
  const lga = ward ? firstOrEmpty(ward.lgas) : null;
  const state = lga ? firstOrEmpty(lga.states) : null;

  if (!ward || !lga || !state) {
    throw new Error("Polling unit context (ward/lga/state) not found.");
  }

  // 2) Federal Constituency + Senatorial District (via LGA)
  type SenatorialDistrictNested = NameHolder;
  type FederalConstituencyNested = {
    name: string;
    senatorial_districts?: SenatorialDistrictNested | SenatorialDistrictNested[] | null;
  };

  type ElectoralResponse = {
    federal_constituencies?:
      | FederalConstituencyNested
      | FederalConstituencyNested[]
      | null;
  };

  const { data: electoral } = await supabase
    .from("lga_federal_constituencies")
    .select(`
      federal_constituencies (
        name,
        senatorial_districts (
          name
        )
      )
    `)
    .eq("lga_id", lga.id)
    .single();

  const fc = firstOrEmpty((electoral as ElectoralResponse | null)?.federal_constituencies);

  // 3) State Constituency (via Ward)
  type StateConstituencyNested = NameHolder;

  type StateConstituencyResponse = {
    state_constituencies?:
      | StateConstituencyNested
      | StateConstituencyNested[]
      | null;
  };

  const { data: stateConstituency } = await supabase
    .from("ward_state_constituencies")
    .select(`
      state_constituencies (
        name
      )
    `)
    .eq("ward_id", ward.id)
    .single();

  const sc = firstOrEmpty(
    (stateConstituency as StateConstituencyResponse | null)?.state_constituencies
  );

  return {
    id: pu.id,
    name: pu.name,
    code: pu.code,

    ward: ward.name,
    lga: lga.name,
    state: state.name,

    senatorialDistrict: firstOrEmpty(fc?.senatorial_districts)?.name ?? "",
    federalConstituency: fc?.name ?? "",
    stateConstituency: sc?.name ?? "",
  };
}