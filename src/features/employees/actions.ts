"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { EmployeeFormData } from "./types";

export async function addEmployee(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { message: "No active session. Please log in again." } };
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;
  if (!companyId) {
    return { success: false, error: { message: "Manager profile incomplete — missing company ID." } };
  }

  const payload: EmployeeFormData = {
    full_name: formData.get("full_name") as string,
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    position: (formData.get("position") as string) || "",
  };

  if (!payload.email) {
    return { success: false, error: { message: "Email is required to create an employee account." } };
  }

  const password = formData.get("password") as string;
  if (!password || password.length < 6) {
    return { success: false, error: { message: "Password must be at least 6 characters." } };
  }

  const serviceClient = createServiceClient();

  const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
    email: payload.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.full_name,
      role: "employee",
      company_id: companyId,
    },
  });

  if (authError) {
    return { success: false, error: { message: authError.message } };
  }

  const { error } = await supabase.from("employees").insert({
    id: authData.user.id,
    company_id: companyId,
    full_name: payload.full_name,
    email: payload.email || null,
    phone: payload.phone || null,
    position: payload.position || null,
  });

  if (error) {
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/employees");
  return { success: true };
}

export async function updateEmployee(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { message: "No active session. Please log in again." } };
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;
  if (!companyId) {
    return { success: false, error: { message: "Manager profile incomplete — missing company ID." } };
  }

  const payload: EmployeeFormData = {
    full_name: formData.get("full_name") as string,
    email: (formData.get("email") as string) || "",
    phone: (formData.get("phone") as string) || "",
    position: (formData.get("position") as string) || "",
  };

  const { error } = await supabase
    .from("employees")
    .update({
      full_name: payload.full_name,
      email: payload.email || null,
      phone: payload.phone || null,
      position: payload.position || null,
    })
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/employees");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { message: "No active session. Please log in again." } };
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;
  if (!companyId) {
    return { success: false, error: { message: "Manager profile incomplete — missing company ID." } };
  }

  const serviceClient = createServiceClient();

  const { error: authError } = await serviceClient.auth.admin.deleteUser(id);

  if (authError) {
    return { success: false, error: { message: authError.message } };
  }

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/employees");
  return { success: true };
}
