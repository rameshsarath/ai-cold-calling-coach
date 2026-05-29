import { createClient } from "@/lib/supabase/server";

export async function getScenarios() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = user?.user_metadata?.company_id as string | undefined;

  if (!companyId) {
    return [];
  }

  const { data } = await supabase
    .from("scenarios")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getScenarioById(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", id)
    .single();

  return data;
}

export async function getActiveScenarios() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = user?.user_metadata?.company_id as string | undefined;

  if (!companyId) {
    return [];
  }

  const { data } = await supabase
    .from("scenarios")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return data ?? [];
}
