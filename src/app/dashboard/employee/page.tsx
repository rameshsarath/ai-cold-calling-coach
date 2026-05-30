import { createClient } from "@/lib/supabase/server";
import { getMyAssignments } from "@/features/assignments/queries";
import { getMyProgress, getReadinessStage, getScenarioProgress, getMyCompletedSessions } from "@/features/training/queries";
import { getEmployeeScenarioStatuses } from "@/features/training/lock-state";
import { buildSessionHistory, buildScenarioSummaries } from "@/features/training/session-history";
import { EmployeeDashboardContent } from "@/components/EmployeeDashboardContent";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name as string | undefined;

  if (!user) {
    return null;
  }

  const [assignments, progress, readiness, scenarioProgress, completedSessions] = await Promise.all([
    getMyAssignments(),
    getMyProgress(),
    getReadinessStage(user.id),
    getScenarioProgress(user.id),
    getMyCompletedSessions(),
  ]);

  const scenarioLockStatuses = getEmployeeScenarioStatuses(scenarioProgress);
  const sessionHistory = buildSessionHistory(completedSessions as any[]);
  const sessionSummaries = buildScenarioSummaries(completedSessions as any[]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {fullName || "Employee"}
      </h1>
      <p className="text-gray-500 mb-8">
        Practice your cold calling skills with AI-powered scenarios.
      </p>
      <EmployeeDashboardContent
        assignments={assignments}
        progress={progress}
        readiness={readiness}
        scenarioLockStatuses={scenarioLockStatuses}
        sessions={completedSessions}
        sessionHistory={sessionHistory}
        sessionSummaries={sessionSummaries}
        employeeName={fullName || "Employee"}
      />
    </div>
  );
}
