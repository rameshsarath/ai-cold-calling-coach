import { createClient } from "@/lib/supabase/server";

export async function getAssignments(employeeId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const companyId = user?.user_metadata?.company_id as string | undefined;

  if (!companyId) {
    return [];
  }

  let query = supabase
    .from("assignments")
    .select("*, employees(full_name, email), scenarios(title, difficulty, status)")
    .eq("company_id", companyId);

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data } = await query.order("assigned_at", { ascending: false });

  return data ?? [];
}

export async function getMyAssignments() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("assignments")
    .select("*, scenarios(title, description, difficulty, time_limit, status)")
    .eq("employee_id", user.id)
    .order("assigned_at", { ascending: false });

  return data ?? [];
}
