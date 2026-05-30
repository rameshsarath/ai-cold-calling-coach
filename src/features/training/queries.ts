import { createClient } from "@/lib/supabase/server";
import type { ProgressMetrics, ReadinessInfo, ScenarioProgress } from "./types";

export async function getSessionById(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("training_sessions")
    .select("*, scenarios(title, description, difficulty, time_limit)")
    .eq("id", sessionId)
    .eq("employee_id", user.id)
    .single();

  return data;
}

export async function getMyCompletedSessions(employeeId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const id = employeeId ?? user.id;

  const { data } = await supabase
    .from("training_sessions")
    .select("*, scenarios(title)")
    .eq("employee_id", id)
    .eq("status", "completed")
    .order("ended_at", { ascending: false });

  return data ?? [];
}

export async function getEmployeeSessions(employeeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;

  const { data } = await supabase
    .from("training_sessions")
    .select("*, scenarios(title, prospect_name, prospect_role, prospect_personality)")
    .eq("employee_id", employeeId)
    .eq("company_id", companyId)
    .order("ended_at", { ascending: false });

  return data ?? [];
}

export async function getAllSessions(employeeId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;

  const { data } = await supabase
    .from("training_sessions")
    .select("*, scenarios(title)")
    .eq("employee_id", employeeId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getMyProgress(employeeId?: string): Promise<ProgressMetrics> {
  const sessions = await getMyCompletedSessions(employeeId);

  const totalCompleted = sessions.length;

  if (totalCompleted === 0) {
    return {
      total_completed: 0,
      pass_rate: 0,
      avg_confidence: 0,
      avg_objection_handling: 0,
    };
  }

  const passed = sessions.filter((s: any) => s.overall_result === "passed").length;
  const totalConfidence = sessions.reduce((sum: number, s: any) => sum + (s.confidence_score ?? 0), 0);
  const totalObjection = sessions.reduce((sum: number, s: any) => sum + (s.objection_handling_score ?? 0), 0);

  return {
    total_completed: totalCompleted,
    pass_rate: Math.round((passed / totalCompleted) * 100),
    avg_confidence: Math.round(totalConfidence / totalCompleted),
    avg_objection_handling: Math.round(totalObjection / totalCompleted),
  };
}

export async function getScenarioProgress(employeeId: string): Promise<ScenarioProgress[]> {
  const supabase = await createClient();

  const sessions = await getAllSessions(employeeId);

  const { data: assignments } = await supabase
    .from("assignments")
    .select("scenario_id, scenarios!inner(title, status)")
    .eq("employee_id", employeeId)
    .neq("scenarios.status", "archived");

  if (!assignments || assignments.length === 0) {
    return [];
  }

  const scenarioPassCounts: Record<string, { passes: number; attempts: number }> = {};

  for (const a of assignments) {
    scenarioPassCounts[a.scenario_id] = { passes: 0, attempts: 0 };
  }

  for (const s of sessions as any[]) {
    if (scenarioPassCounts[s.scenario_id]) {
      scenarioPassCounts[s.scenario_id].attempts++;
      if (s.overall_result === "passed") {
        scenarioPassCounts[s.scenario_id].passes++;
      }
    }
  }

  return assignments.map((a: any) => {
    const stats = scenarioPassCounts[a.scenario_id] ?? { passes: 0, attempts: 0 };
    let status: "pending" | "ready" | "mastered" = "pending";
    if (stats.passes >= 5) {
      status = "mastered";
    } else if (stats.passes >= 2) {
      status = "ready";
    }
    return {
      scenario_id: a.scenario_id,
      scenario_title: a.scenarios?.title ?? "Untitled",
      attempts: stats.attempts,
      passes: stats.passes,
      status,
    };
  });
}

export async function getReadinessStage(employeeId: string): Promise<ReadinessInfo> {
  const completedSessions = await getMyCompletedSessions(employeeId);

  if (completedSessions.length === 0) {
    return { stage: "Beginner", progressPercent: 0, masteredProgressPercent: 0 };
  }

  const scenarioProgress = await getScenarioProgress(employeeId);

  if (scenarioProgress.length === 0) {
    return { stage: "In Training", progressPercent: 10, masteredProgressPercent: 0 };
  }

  const allReady = scenarioProgress.every((sp) => sp.status === "ready" || sp.status === "mastered");
  const allMastered = scenarioProgress.every((sp) => sp.status === "mastered");

  if (allMastered) {
    return { stage: "Mastered", progressPercent: 100, masteredProgressPercent: 100 };
  }

  const readyCount = scenarioProgress.filter((sp) => sp.status === "ready" || sp.status === "mastered").length;
  const progressPercent = Math.round((readyCount / scenarioProgress.length) * 100);

  if (allReady) {
    const masteredCount = scenarioProgress.filter((sp) => sp.status === "mastered").length;
    const masteredProgressPercent = Math.round((masteredCount / scenarioProgress.length) * 100);
    return { stage: "Ready For Outbound", progressPercent: 100, masteredProgressPercent };
  }

  return { stage: "In Training", progressPercent, masteredProgressPercent: 0 };
}
