import { supabase } from "@/lib/supabase";

export async function getStates() {
  const { data, error } = await supabase
    .from("states")
    .select("id, name, code")
    .order("name");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getStateByName(name: string) {
  const { data, error } = await supabase
    .from("states")
    .select("id, name, code")
    .eq("name", name)
    .single();

  if (error) {
    throw error;
  }

  return data;
}