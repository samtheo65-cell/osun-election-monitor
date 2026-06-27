import { supabase } from "@/lib/supabase";
import { getStateByName } from "@/lib/repositories/states";

export async function getLgasByState(stateName: string) {
  // Get the state ID
  const state = await getStateByName(stateName);

  // Get LGAs
  const { data: lgas, error: lgaError } = await supabase
    .from("lgas")
    .select("name")
    .eq("state_id", state.id)
    .order("name");

  if (lgaError) {
    throw lgaError;
  }

  return lgas ?? [];
}