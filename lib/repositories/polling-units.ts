import { supabase } from "@/lib/supabase";
import { GeographyOption } from "@/lib/types";

export async function getPollingUnitsByWard(
  wardId: string
): Promise<GeographyOption[]> {
  const { data, error } = await supabase
    .from("polling_units")
    .select("id, name")
    .eq("ward_id", wardId)
    .order("name");

  if (error) throw error;

  return data ?? [];
}