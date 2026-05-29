"use client";

import Link from "next/link";
import type { Scenario } from "@/features/scenarios/types";
import { archiveScenario } from "@/features/scenarios/actions";
import { useRouter } from "next/navigation";

type Props = {
  scenarios: Scenario[];
  onEdit: (scenario: Scenario) => void;
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  testing: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-700",
};

export function ScenarioTable({ scenarios, onEdit }: Props) {
  const router = useRouter();

  async function handleArchive(id: string, title: string) {
    if (!confirm(`Archive "${title}"?`)) return;
    await archiveScenario(id);
    router.refresh();
  }

  if (scenarios.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        No scenarios yet. Create your first scenario above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-2 font-medium">Title</th>
            <th className="pb-2 font-medium">Prospect</th>
            <th className="pb-2 font-medium">Industry</th>
            <th className="pb-2 font-medium">Difficulty</th>
            <th className="pb-2 font-medium">Time</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => (
            <tr key={s.id} className="border-b last:border-0">
              <td className="py-2 font-medium">{s.title}</td>
              <td className="py-2 text-xs">{s.prospect_name ?? s.prospect_role ?? "—"}</td>
              <td className="py-2">{s.industry ?? "—"}</td>
              <td className="py-2 capitalize">{s.difficulty ?? "—"}</td>
              <td className="py-2">{s.time_limit ? `${s.time_limit}m` : "—"}</td>
              <td className="py-2">
                <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusColors[s.status] ?? ""}`}>
                  {s.status}
                </span>
              </td>
              <td className="py-2 flex gap-2">
                <Link
                  href={`/dashboard/manager/scenarios/${s.id}/test`}
                  className="text-green-600 hover:underline text-sm"
                >
                  Test
                </Link>
                <button onClick={() => onEdit(s)} className="text-blue-600 hover:underline text-sm">
                  Edit
                </button>
                {s.status !== "archived" && (
                  <button onClick={() => handleArchive(s.id, s.title)} className="text-red-600 hover:underline text-sm">
                    Archive
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
