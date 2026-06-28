import { supabase } from "@/lib/supabase";

export async function getLgasByState(stateId: string) {
  const { data, error } = await supabase
    .from("lgas")
    .select("id, name")
    .eq("state_id", stateId)
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}