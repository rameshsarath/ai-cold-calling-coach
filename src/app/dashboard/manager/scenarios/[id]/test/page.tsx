import { getScenarioById } from "@/features/scenarios/queries";
import { SimulationClient } from "@/components/SimulationClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ManagerScenarioTestPage({ params }: Props) {
  const { id } = await params;
  const scenario = await getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  return (
    <div>
      <SimulationClient
        sessionId="sandbox"
        scenarioTitle={scenario.title}
        scenarioTimeLimit={scenario.time_limit ?? 10}
        initialData={{
          status: "active",
          confidence_score: null,
          objection_handling_score: null,
          active_listening_score: null,
          qualification_score: null,
          desired_outcome_achieved: null,
          overall_result: null,
        }}
        sandbox
      />
    </div>
  );
}
