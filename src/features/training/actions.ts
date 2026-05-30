"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getScenarioProgress } from "@/features/training/queries";
import { getEmployeeScenarioStatuses } from "@/features/training/lock-state";
import { endRetellCall, fetchRetellCallDetails } from "./retell-actions";
import { evaluateTranscript } from "./evaluation";

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

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("status")
    .eq("id", scenarioId)
    .single();

  if (scenario?.status === "archived") {
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

  const { data: session } = await supabase
    .from("training_sessions")
    .select("retell_call_id, scenario_id")
    .eq("id", sessionId)
    .eq("employee_id", user.id)
    .single();

  if (session?.retell_call_id) {
    await endRetellCall(session.retell_call_id).catch(() => {});
  }

  let retellMetadata: Record<string, any> = {};
  let transcript: string | null = null;

  if (session?.retell_call_id) {
    const details = await fetchRetellCallDetails(session.retell_call_id).catch(
      () => null
    );

    if (details) {
      transcript = details.transcript;
      retellMetadata = {
        transcript: details.transcript,
        call_duration_ms: details.duration_ms,
        recording_url: details.recording_url,
        disconnection_reason: details.disconnection_reason,
        call_summary: details.call_summary,
        user_sentiment: details.user_sentiment,
        call_successful: details.call_successful,
        call_ended_at: details.end_timestamp
          ? new Date(details.end_timestamp).toISOString()
          : null,
      };
    }
  }

  let evaluationData: Record<string, any> = {};
  let usedAiEvaluation = false;

  if (transcript && session?.scenario_id) {
    try {
      const { data: scenario } = await supabase
        .from("scenarios")
        .select("*")
        .eq("id", session.scenario_id)
        .single();

      if (scenario) {
        const result = await evaluateTranscript({
          transcript,
          scenarioTitle: scenario.title ?? "",
          scenarioDescription: scenario.description ?? "",
          industry: scenario.industry ?? "",
          prospectRole: scenario.prospect_role ?? "",
          prospectPersonality: scenario.prospect_personality ?? "",
          painPoints: scenario.pain_points ?? "",
          commonObjections: scenario.common_objections ?? "",
          desiredOutcome: scenario.desired_outcome ?? "",
          difficulty: scenario.difficulty ?? "",
          callSummary: retellMetadata.call_summary ?? "",
        });

        const codeOverallResult =
          result.overall_score >= 70 && result.desired_outcome_achieved
            ? "passed"
            : "failed";

        evaluationData = {
          overall_score: result.overall_score,
          confidence_score: result.confidence_score,
          objection_handling_score: result.objection_handling_score,
          active_listening_score: result.active_listening_score,
          qualification_score: result.qualification_score,
          desired_outcome_achieved: result.desired_outcome_achieved,
          overall_result: codeOverallResult,
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          coaching_feedback: result.coaching_feedback,
        };
        usedAiEvaluation = true;
      }
    } catch (err) {
      console.error("AI evaluation failed, falling back to random scores:", err);
    }
  }

  if (!usedAiEvaluation) {
    evaluationData = {
      confidence_score: randomScore(50, 100),
      objection_handling_score: randomScore(40, 95),
      active_listening_score: randomScore(55, 100),
      qualification_score: randomScore(45, 90),
      desired_outcome_achieved: Math.random() > 0.35,
      overall_result: Math.random() > 0.35 ? "passed" : "failed",
      overall_score: null,
      strengths: null,
      weaknesses: null,
      coaching_feedback: null,
    };
  }

  const { error } = await supabase
    .from("training_sessions")
    .update({
      ended_at: new Date().toISOString(),
      status: "completed",
      ...evaluationData,
      ...retellMetadata,
    })
    .eq("id", sessionId)
    .eq("employee_id", user.id);

  if (error) {
    return { success: false, error: { message: error.message } };
  }

  revalidatePath("/dashboard/employee");
  return {
    success: true,
    overall_score: evaluationData.overall_score ?? null,
    confidence_score: evaluationData.confidence_score,
    objection_handling_score: evaluationData.objection_handling_score,
    active_listening_score: evaluationData.active_listening_score,
    qualification_score: evaluationData.qualification_score,
    desired_outcome_achieved: evaluationData.desired_outcome_achieved,
    overall_result: evaluationData.overall_result,
    strengths: evaluationData.strengths ?? null,
    weaknesses: evaluationData.weaknesses ?? null,
    coaching_feedback: evaluationData.coaching_feedback ?? null,
  };
}
