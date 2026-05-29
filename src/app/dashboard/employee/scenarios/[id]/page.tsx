import { createClient } from "@/lib/supabase/server";
import { getScenarioById } from "@/features/scenarios/queries";
import { startSession } from "@/features/training/actions";
import { getScenarioProgress } from "@/features/training/queries";
import { getEmployeeScenarioStatuses } from "@/features/training/lock-state";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ScenarioBriefingPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id")
    .eq("scenario_id", id)
    .eq("employee_id", user.id)
    .maybeSingle();

  if (!assignment) {
    notFound();
  }

  const scenario = await getScenarioById(id);

  if (!scenario) {
    notFound();
  }

  const scenarioProgress = await getScenarioProgress(user.id);
  const lockStatuses = getEmployeeScenarioStatuses(scenarioProgress);
  const currentLockInfo = lockStatuses.find((s) => s.scenario_id === id);
  const isLocked = currentLockInfo?.isLocked ?? false;
  const lockReason = currentLockInfo?.lockReason ?? null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">{scenario.title}</h1>

      {scenario.description && (
        <p className="text-gray-600 mb-6">{scenario.description}</p>
      )}

      <div className="grid gap-4 mb-8">
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Scenario Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {scenario.prospect_name && (
              <>
                <dt className="text-gray-500">Prospect Name</dt>
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
            {scenario.industry && (
              <>
                <dt className="text-gray-500">Industry</dt>
                <dd>{scenario.industry}</dd>
              </>
            )}
            {scenario.prospect_role && (
              <>
                <dt className="text-gray-500">Prospect Role</dt>
                <dd>{scenario.prospect_role}</dd>
              </>
            )}
            {scenario.difficulty && (
              <>
                <dt className="text-gray-500">Difficulty</dt>
                <dd className="capitalize">{scenario.difficulty}</dd>
              </>
            )}
            {scenario.time_limit && (
              <>
                <dt className="text-gray-500">Time Limit</dt>
                <dd>{scenario.time_limit} minutes</dd>
              </>
            )}
          </dl>
        </div>

        {scenario.pain_points && (
          <div className="border rounded p-4 bg-white">
            <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wide">Pain Points</h2>
            <p className="text-sm">{scenario.pain_points}</p>
          </div>
        )}

        {scenario.common_objections && (
          <div className="border rounded p-4 bg-white">
            <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wide">Common Objections</h2>
            <p className="text-sm">{scenario.common_objections}</p>
          </div>
        )}

        {scenario.desired_outcome && (
          <div className="border rounded p-4 bg-white">
            <h2 className="font-semibold mb-2 text-sm text-gray-500 uppercase tracking-wide">Desired Outcome</h2>
            <p className="text-sm">{scenario.desired_outcome}</p>
          </div>
        )}
      </div>

      {isLocked ? (
        <div className="border border-gray-200 bg-gray-50 rounded p-6 text-center">
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium mb-1">Scenario Locked</p>
          <p className="text-xs text-gray-400">{lockReason}</p>
        </div>
      ) : (
        <form action={startSession.bind(null, id)}>
          <button
            type="submit"
            className="bg-green-600 text-white rounded px-6 py-3 text-sm font-medium hover:bg-green-700"
          >
            Start Simulation
          </button>
        </form>
      )}
    </div>
  );
}
