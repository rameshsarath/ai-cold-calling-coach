"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ScenarioFormData, ScenarioStatus } from "./types";

export async function addScenario(formData: FormData) {
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

  const payload: ScenarioFormData = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || "",
    industry: (formData.get("industry") as string) || "",
    prospect_role: (formData.get("prospect_role") as string) || "",
    pain_points: (formData.get("pain_points") as string) || "",
    common_objections: (formData.get("common_objections") as string) || "",
    desired_outcome: (formData.get("desired_outcome") as string) || "",
    difficulty: (formData.get("difficulty") as string) || "beginner",
    time_limit: Number(formData.get("time_limit")) || 10,
    status: "draft",
  };

  const { error } = await supabase.from("scenarios").insert({
    company_id: companyId,
    title: payload.title,
    description: payload.description || null,
    industry: payload.industry || null,
    prospect_role: payload.prospect_role || null,
    pain_points: payload.pain_points || null,
    common_objections: payload.common_objections || null,
    desired_outcome: payload.desired_outcome || null,
    difficulty: payload.difficulty || null,
    time_limit: payload.time_limit || null,
    status: payload.status,
  });

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/scenarios");
  return { success: true };
}

export async function updateScenario(id: string, formData: FormData) {
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

  const payload: ScenarioFormData = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || "",
    industry: (formData.get("industry") as string) || "",
    prospect_role: (formData.get("prospect_role") as string) || "",
    pain_points: (formData.get("pain_points") as string) || "",
    common_objections: (formData.get("common_objections") as string) || "",
    desired_outcome: (formData.get("desired_outcome") as string) || "",
    difficulty: (formData.get("difficulty") as string) || "beginner",
    time_limit: Number(formData.get("time_limit")) || 10,
    status: (formData.get("status") as ScenarioStatus) || "draft",
  };

  const { error } = await supabase
    .from("scenarios")
    .update({
      title: payload.title,
      description: payload.description || null,
      industry: payload.industry || null,
      prospect_role: payload.prospect_role || null,
      pain_points: payload.pain_points || null,
      common_objections: payload.common_objections || null,
      desired_outcome: payload.desired_outcome || null,
      difficulty: payload.difficulty || null,
      time_limit: payload.time_limit || null,
      status: payload.status,
    })
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/scenarios");
  return { success: true };
}

export async function archiveScenario(id: string) {
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
    .from("scenarios")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("company_id", companyId);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/manager/scenarios");
  return { success: true };
}
