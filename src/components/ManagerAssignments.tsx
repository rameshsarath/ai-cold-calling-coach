"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { assignScenario, removeAssignment } from "@/features/assignments/actions";
import type { AssignmentWithDetails } from "@/features/assignments/types";
import type { Employee } from "@/features/employees/types";
import type { Scenario } from "@/features/scenarios/types";

type Props = {
  employees: Employee[];
  scenarios: Scenario[];
  assignments: AssignmentWithDetails[];
};

export function ManagerAssignments({ employees, scenarios, assignments }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      return await assignScenario(formData);
    },
    undefined
  );

  async function handleRemove(id: string) {
    if (!confirm("Remove this assignment?")) return;
    await removeAssignment(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form action={action} className="border rounded p-4 bg-white space-y-3">
        <h3 className="font-semibold text-lg">Assign Scenario</h3>

        <div>
          <label htmlFor="employee_id" className="block text-sm font-medium">Employee</label>
          <select id="employee_id" name="employee_id" required className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select employee...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.full_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scenario_id" className="block text-sm font-medium">Scenario</label>
          <select id="scenario_id" name="scenario_id" required className="w-full border rounded px-3 py-2 text-sm">
            <option value="">Select scenario...</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {state && "error" in state && state.error && (
          <p className="text-red-600 text-sm">{state.error.message}</p>
        )}

        <button type="submit" disabled={pending} className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
          {pending ? "Assigning..." : "Assign"}
        </button>
      </form>

      {assignments.length === 0 ? (
        <p className="text-gray-500 text-sm py-4">No assignments yet. Assign a scenario above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Employee</th>
                <th className="pb-2 font-medium">Scenario</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Result</th>
                <th className="pb-2 font-medium">Assigned</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-2">
                    <Link
                      href={`/dashboard/manager/employees/${a.employee_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {a.employees?.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="py-2">{a.scenarios?.title ?? "—"}</td>
                  <td className="py-2">
                    {a.is_completed ? (
                      <span className="text-green-600">Completed</span>
                    ) : (
                      <span className="text-yellow-600">Pending</span>
                    )}
                  </td>
                  <td className="py-2">
                    {a.completion_status === "passed" ? (
                      <span className="text-green-600 font-medium">Passed</span>
                    ) : a.completion_status === "failed" ? (
                      <span className="text-red-600 font-medium">Failed</span>
                    ) : a.is_completed ? (
                      <span className="text-gray-500">Completed</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 text-xs text-gray-500">
                    {new Date(a.assigned_at).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleRemove(a.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
