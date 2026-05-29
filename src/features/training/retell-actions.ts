"use server";

import { createClient } from "@/lib/supabase/server";

export type RetellCallDetails = {
  transcript: string | null;
  duration_ms: number | null;
  recording_url: string | null;
  disconnection_reason: string | null;
  call_summary: string | null;
  user_sentiment: string | null;
  call_successful: boolean | null;
  end_timestamp: number | null;
};

export async function endRetellCall(callId: string) {
  const response = await fetch(
    `https://api.retellai.com/v2/stop-call/${callId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Retell API error (${response.status}): ${body}`);
  }
}

export async function fetchRetellCallDetails(
  callId: string
): Promise<RetellCallDetails> {
  const response = await fetch(
    `https://api.retellai.com/v2/get-call/${callId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Retell API error (${response.status}): ${body}`);
  }

  const data = await response.json();

  return {
    transcript: data.transcript ?? null,
    duration_ms: data.duration_ms ?? null,
    recording_url: data.recording_url ?? null,
    disconnection_reason: data.disconnection_reason ?? null,
    call_summary: data.call_analysis?.call_summary ?? null,
    user_sentiment: data.call_analysis?.user_sentiment ?? null,
    call_successful: data.call_analysis?.call_successful ?? null,
    end_timestamp: data.end_timestamp ?? null,
  };
}

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
