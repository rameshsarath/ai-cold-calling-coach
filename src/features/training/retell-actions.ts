"use server";

import { createClient } from "@/lib/supabase/server";

export async function createRetellCall(sessionId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: session } = await supabase
    .from("training_sessions")
    .select("*, scenarios(*)")
    .eq("id", sessionId)
    .eq("employee_id", user.id)
    .single();

  if (!session) {
    throw new Error("Session not found");
  }

  const scenario = session.scenarios as Record<string, any> | null;

  const response = await fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: process.env.RETELL_AGENT_ID,
      retell_llm_dynamic_variables: {
        scenario_title: scenario?.title ?? "",
        description: scenario?.description ?? "",
        industry: scenario?.industry ?? "",
        prospect_role: scenario?.prospect_role ?? "",
        prospect_name: scenario?.prospect_name ?? "",
        company_name: scenario?.company_name ?? "",
        prospect_personality: scenario?.prospect_personality ?? "",
        pain_points: scenario?.pain_points ?? "",
        common_objections: scenario?.common_objections ?? "",
        desired_outcome: scenario?.desired_outcome ?? "",
        difficulty: scenario?.difficulty ?? "",
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Retell API error (${response.status}): ${body}`);
  }

  const data = await response.json();

  await supabase
    .from("training_sessions")
    .update({ retell_call_id: data.call_id })
    .eq("id", sessionId);

  return { access_token: data.access_token as string, call_id: data.call_id as string };
}
