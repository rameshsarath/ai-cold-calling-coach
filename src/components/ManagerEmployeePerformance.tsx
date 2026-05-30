"use client";

import type { ProgressMetrics, ReadinessInfo, ScenarioProgress } from "@/features/training/types";
import type { SessionHistoryItem, ScenarioAttemptSummary } from "@/features/training/session-history";
import type { Employee } from "@/features/employees/types";
import { ManagerSessionReview } from "./ManagerSessionReview";

type Props = {
  employee: Employee;
  progress: ProgressMetrics;
  readiness: ReadinessInfo;
  assignments: any[];
  sessions: any[];
  scenarioProgress: ScenarioProgress[];
  sessionHistory: SessionHistoryItem[];
  sessionSummaries: ScenarioAttemptSummary[];
};

const stageColors: Record<string, string> = {
  Beginner: "bg-gray-200 text-gray-700",
  "In Training": "bg-yellow-100 text-yellow-700",
  "Ready For Outbound": "bg-green-100 text-green-700",
  Mastered: "bg-purple-100 text-purple-700",
};

const scenarioStatusColors: Record<string, string> = {
  pending: "text-yellow-600",
  ready: "text-blue-600",
  mastered: "text-purple-600",
};

const stageMilestones = ["Beginner", "In Training", "Ready For Outbound", "Mastered"];

export function ManagerEmployeePerformance({ employee, progress, readiness, assignments, sessions, scenarioProgress, sessionHistory, sessionSummaries }: Props) {
  const currentStageIndex = stageMilestones.indexOf(readiness.stage);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Readiness Stage</h2>
        <div className="flex items-center gap-2 mb-4">
          {stageMilestones.map((stage, i) => {
            const isActive = i <= currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <div key={stage} className="flex-1 text-center">
                <div className={`w-full h-1.5 rounded-full mb-1 ${isActive ? "bg-blue-600" : "bg-gray-200"}`} />
                <span className={`text-xs ${isCurrent ? "text-blue-700 font-semibold" : isActive ? "text-gray-600" : "text-gray-400"}`}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
        <span className={`inline-block rounded px-3 py-1 text-sm font-medium ${stageColors[readiness.stage]}`}>
          {readiness.stage}
        </span>
      </div>

      {progress.total_completed > 0 && (
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pass Rate</span>
                <span className="font-semibold">{progress.pass_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress.pass_rate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Confidence</span>
                <span className="font-semibold">{progress.avg_confidence}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress.avg_confidence}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Objection Handling</span>
                <span className="font-semibold">{progress.avg_objection_handling}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${progress.avg_objection_handling}%` }} />
              </div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.total_completed}</div>
              <div className="text-xs text-gray-500 mt-1">Completed Simulations</div>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Scenario Readiness</h2>
        {scenarioProgress.length === 0 ? (
          <p className="text-sm text-gray-400">No scenarios assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Scenario</th>
                  <th className="pb-2 font-medium">Attempts</th>
                  <th className="pb-2 font-medium">Passes</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {scenarioProgress.map((sp) => (
                  <tr key={sp.scenario_id} className="border-b last:border-0">
                    <td className="py-2">{sp.scenario_title}</td>
                    <td className="py-2">{sp.attempts}</td>
                    <td className="py-2">{sp.passes}</td>
                    <td className="py-2">
                      <span className={`font-medium ${scenarioStatusColors[sp.status]}`}>
                        {sp.status === "mastered" ? "Mastered" : sp.status === "ready" ? "Ready" : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ManagerSessionReview
        items={sessionHistory}
        summaries={sessionSummaries}
        sessions={sessions}
        employee={employee}
      />
    </div>
  );
}
