import { supabase } from "@/lib/supabase";

export async function getPollingUnitsByWard(wardName: string) {
  // Find the Ward
  const { data: ward, error: wardError } = await supabase
    .from("wards")
    .select("id")
    .eq("name", wardName.toUpperCase())
    .single();

  if (wardError || !ward) {
    throw new Error("Ward not found.");
  }

  // Get Polling Units
  const { data: pollingUnits, error: pollingUnitError } = await supabase
    .from("polling_units")
    .select("name")
    .eq("ward_id", ward.id)
    .order("name");

  if (pollingUnitError) {
    throw pollingUnitError;
  }

  return pollingUnits ?? [];
}