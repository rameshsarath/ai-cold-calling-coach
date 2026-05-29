import { createClient } from "@/lib/supabase/server";

export async function requireManager() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { authorized: false, reason: "unauthenticated" };
  }

  const role = user.user_metadata?.role;
  if (role !== "manager") {
    return { authorized: false, reason: "forbidden" };
  }

  return { authorized: true, user, companyId: user.user_metadata?.company_id as string | undefined };
}
