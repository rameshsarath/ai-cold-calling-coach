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
      <div className="max-w-xl mx-auto mb-6">
        <h1 className="text-2xl font-bold mb-2">{scenario.title}</h1>

        {scenario.description && (
          <p className="text-gray-600 mb-4">{scenario.description}</p>
        )}

        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Prospect Info</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {scenario.prospect_name && (
              <>
                <dt className="text-gray-500">Name</dt>
                <dd>{scenario.prospect_name}</dd>
              </>
            )}
            {scenario.company_name && (
              <>
                <dt className="text-gray-500">Company</dt>
                <dd>{scenario.company_name}</dd>
              </>
            )}
            {scenario.prospect_personality && (
              <>
                <dt className="text-gray-500">Personality</dt>
                <dd>{scenario.prospect_personality}</dd>
              </>
            )}
            {scenario.prospect_role && (
              <>
                <dt className="text-gray-500">Role</dt>
                <dd>{scenario.prospect_role}</dd>
              </>
            )}
            {scenario.industry && (
              <>
                <dt className="text-gray-500">Industry</dt>
                <dd>{scenario.industry}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

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
