import { supabase } from "@/lib/supabase";
import { getStateByName } from "@/lib/repositories/states";

export async function getLgasByState(stateName: string) {
  const state = await getStateByName(stateName);

  const { data: lgas, error } = await supabase
    .from("lgas")
    .select("name")
    .eq("state_id", state.id)
    .order("name");

  if (error) {
    throw error;
  }

  return lgas ?? [];
}