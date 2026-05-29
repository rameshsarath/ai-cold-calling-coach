"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function generateCompanyId(): string {
  return crypto.randomUUID();
}

export async function signup(
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const companyId = generateCompanyId();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "manager",
        company_id: companyId,
      },
    },
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/", "layout");
  return { success: true, redirectTo: "/dashboard/manager" };
}

export async function login(
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  const role = data.user?.user_metadata?.role;

  if (role === "manager") {
    const companyId = data.user?.user_metadata?.company_id;
    if (!companyId) {
      const newCompanyId = generateCompanyId();
      await supabase.auth.updateUser({
        data: { company_id: newCompanyId },
      });
    }
    revalidatePath("/", "layout");
    return { success: true, redirectTo: "/dashboard/manager" };
  }

  if (role === "employee") {
    revalidatePath("/", "layout");
    return { success: true, redirectTo: "/dashboard/employee" };
  }

  await supabase.auth.signOut();
  return {
    success: false,
    error: { message: "Access denied. Invalid account type." },
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
