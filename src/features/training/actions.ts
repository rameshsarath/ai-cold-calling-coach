"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScenarioProgress } from "@/features/training/queries";
import { getEmployeeScenarioStatuses } from "@/features/training/lock-state";

function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function startSession(scenarioId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;
  if (!companyId) {
    redirect("/dashboard/employee");
  }

  const scenarioProgress = await getScenarioProgress(user.id);
  const lockStatuses = getEmployeeScenarioStatuses(scenarioProgress);
  const currentLockInfo = lockStatuses.find((s) => s.scenario_id === scenarioId);

  if (currentLockInfo?.isLocked) {
    redirect("/dashboard/employee");
  }

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      employee_id: user.id,
      scenario_id: scenarioId,
      company_id: companyId,
      started_at: new Date().toISOString(),
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    redirect("/dashboard/employee");
  }

  redirect(`/dashboard/employee/simulation/${data.id}`);
}

export async function endSession(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: { message: "No active session." } };
  }

  const confidenceScore = randomScore(50, 100);
  const objectionHandlingScore = randomScore(40, 95);
  const activeListeningScore = randomScore(55, 100);
  const qualificationScore = randomScore(45, 90);
  const desiredOutcomeAchieved = Math.random() > 0.35;
  const overallResult = desiredOutcomeAchieved ? "passed" : "failed";

  const { error } = await supabase
    .from("training_sessions")
    .update({
      ended_at: new Date().toISOString(),
      status: "completed",
      confidence_score: confidenceScore,
      objection_handling_score: objectionHandlingScore,
      active_listening_score: activeListeningScore,
      qualification_score: qualificationScore,
      desired_outcome_achieved: desiredOutcomeAchieved,
      overall_result: overallResult,
    })
    .eq("id", sessionId)
    .eq("employee_id", user.id);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/employee");
  return {
    success: true,
    confidence_score: confidenceScore,
    objection_handling_score: objectionHandlingScore,
    active_listening_score: activeListeningScore,
    qualification_score: qualificationScore,
    desired_outcome_achieved: desiredOutcomeAchieved,
    overall_result: overallResult,
  };
}
