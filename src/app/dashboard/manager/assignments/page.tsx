import { getEmployees } from "@/features/employees/queries";
import { getActiveScenarios } from "@/features/scenarios/queries";
import { getAssignments } from "@/features/assignments/queries";
import { ManagerAssignments } from "@/components/ManagerAssignments";

export default async function AssignmentsPage() {
  const [employees, scenarios, assignments] = await Promise.all([
    getEmployees(),
    getActiveScenarios(),
    getAssignments(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Assignments</h1>
      <ManagerAssignments
        employees={employees}
        scenarios={scenarios}
        assignments={assignments}
      />
    </div>
  );
}
