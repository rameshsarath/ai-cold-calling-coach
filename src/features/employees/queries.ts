import { createClient } from "@/lib/supabase/server";

export async function getEmployees() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = user?.user_metadata?.company_id as string | undefined;

  if (!companyId) {
    return [];
  }

  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
