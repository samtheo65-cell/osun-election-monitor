import { supabase } from "@/lib/supabase";
import { GeographyOption } from "@/lib/types";

export async function getWardsByLga(
  lgaId: string
): Promise<GeographyOption[]> {
  const { data, error } = await supabase
    .from("wards")
    .select("id, name")
    .eq("lga_id", lgaId)
    .order("name");

  if (error) throw error;

  return data ?? [];
}