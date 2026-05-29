import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { SimulationClient } from "@/components/SimulationClient";

type Props = {
  params: Promise<{ sessionId: string }>;
};

export default async function SimulationPage({ params }: Props) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("training_sessions")
    .select("*, scenarios(title, time_limit)")
    .eq("id", sessionId)
    .eq("employee_id", user.id)
    .single();

  if (!session) {
    notFound();
  }

  return (
    <SimulationClient
      sessionId={sessionId}
      scenarioTitle={session.scenarios?.title ?? "Scenario"}
      scenarioTimeLimit={session.scenarios?.time_limit ?? 10}
      initialData={{
        status: session.status,
        confidence_score: session.confidence_score,
        objection_handling_score: session.objection_handling_score,
        active_listening_score: session.active_listening_score,
        qualification_score: session.qualification_score,
        desired_outcome_achieved: session.desired_outcome_achieved,
        overall_result: session.overall_result,
      }}
    />
  );
}
