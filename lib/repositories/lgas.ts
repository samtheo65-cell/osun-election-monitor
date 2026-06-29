import { supabase } from "@/lib/supabase";
import { GeographyOption } from "@/lib/types";

export async function getLgasByState(
  stateId: string
): Promise<GeographyOption[]> {
  const { data, error } = await supabase
    .from("lgas")
    .select("id, name")
    .eq("state_id", stateId)
    .order("name");

  if (error) throw error;

  return data ?? [];
}