import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getMyProgress, getReadinessStage, getEmployeeSessions, getScenarioProgress } from "@/features/training/queries";
import { buildSessionHistory, buildScenarioSummaries } from "@/features/training/session-history";
import { getAssignments } from "@/features/assignments/queries";
import { ManagerEmployeePerformance } from "@/components/ManagerEmployeePerformance";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeePerformancePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const companyId = user?.user_metadata?.company_id as string | undefined;
  if (!companyId) {
    redirect("/dashboard/manager");
  }

  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();

  if (!employee) {
    notFound();
  }

  const [progress, readiness, assignments, sessions, scenarioProgress] = await Promise.all([
    getMyProgress(id),
    getReadinessStage(id),
    getAssignments(id),
    getEmployeeSessions(id),
    getScenarioProgress(id),
  ]);

  const sessionHistory = buildSessionHistory(sessions as any[]);
  const sessionSummaries = buildScenarioSummaries(sessions as any[]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{employee.full_name}</h1>
      <p className="text-gray-500 mb-6">{employee.position ?? employee.email ?? "Employee"}</p>
      <ManagerEmployeePerformance
        employee={employee}
        progress={progress}
        readiness={readiness}
        assignments={assignments}
        sessions={sessions}
        scenarioProgress={scenarioProgress}
        sessionHistory={sessionHistory}
        sessionSummaries={sessionSummaries}
      />
    </div>
  );
}
