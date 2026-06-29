import { supabase } from "@/lib/supabase";
import { GeographyOption } from "@/lib/types";

export async function getStates(): Promise<GeographyOption[]> {
  const { data, error } = await supabase
    .from("states")
    .select("id, name")
    .order("name");

  if (error) throw error;

  return data ?? [];
}