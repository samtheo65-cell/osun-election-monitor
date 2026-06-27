import { supabase } from "@/lib/supabase";

export async function getWardsByLga(lgaName: string) {
  // Find the LGA
  const { data: lga, error: lgaError } = await supabase
    .from("lgas")
    .select("id")
    .eq("name", lgaName.toUpperCase())
    .single();

  if (lgaError || !lga) {
    throw new Error("LGA not found.");
  }

  // Get wards
  const { data: wards, error: wardError } = await supabase
    .from("wards")
    .select("name")
    .eq("lga_id", lga.id)
    .order("name");

  if (wardError) {
    throw wardError;
  }

  return wards ?? [];
}