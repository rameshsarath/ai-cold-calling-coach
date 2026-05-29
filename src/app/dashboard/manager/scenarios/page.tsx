import { getScenarios } from "@/features/scenarios/queries";
import { ScenarioList } from "@/components/ScenarioList";

export default async function ScenariosPage() {
  const scenarios = await getScenarios();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Scenarios</h1>
      <ScenarioList scenarios={scenarios} />
    </div>
  );
}
