"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function assignScenario(formData: FormData) {
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

  const employeeId = formData.get("employee_id") as string;
  const scenarioId = formData.get("scenario_id") as string;

  if (!employeeId || !scenarioId) {
    return { success: false, error: { message: "Both employee and scenario are required." } };
  }

  const { data: existing } = await supabase
    .from("assignments")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("scenario_id", scenarioId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (existing) {
    return { success: false, error: { message: "This scenario is already assigned to this employee." } };
  }

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("status")
    .eq("id", scenarioId)
    .single();

  if (!scenario || scenario.status === "archived") {
    return { success: false, error: { message: "This scenario has been archived and cannot be assigned." } };
  }

  const { error } = await supabase.from("assignments").insert({
    employee_id: employeeId,
    scenario_id: scenarioId,
    company_id: companyId,
    is_unlocked: true,
    is_completed: false,
    completion_status: null,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/assignments");
  return { success: true };
}

export async function removeAssignment(assignmentId: string) {
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

  const { error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", assignmentId)
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/assignments");
  return { success: true };
}
