"use client";

import type { SessionHistoryItem, ScenarioAttemptSummary } from "@/features/training/session-history";

type Props = {
  items: SessionHistoryItem[];
  summaries: ScenarioAttemptSummary[];
};

function TrendArrow({ trend }: { trend: SessionHistoryItem["trend"] }) {
  if (trend === "up") return <span className="text-green-600 text-xs ml-1">&#8593;</span>;
  if (trend === "down") return <span className="text-red-600 text-xs ml-1">&#8595;</span>;
  if (trend === "same") return <span className="text-gray-400 text-xs ml-1">&#8594;</span>;
  return null;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function EmployeeSessionHistory({ items, summaries }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3">Session History</h2>

        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded p-3 bg-white text-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  {item.scenarioTitle}
                  <TrendArrow trend={item.trend} />
                </div>
                <div className="flex items-center gap-2">
                  {item.overallResult === "passed" ? (
                    <span className="text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5 text-xs font-medium">
                      Passed
                    </span>
                  ) : item.overallResult === "failed" ? (
                    <span className="text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 text-xs font-medium">
                      Failed
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                <span>
                  Date:{" "}
                  {item.completedAt
                    ? new Date(item.completedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </span>
                <span>Duration: {formatDuration(item.durationSeconds)}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center">
                  <span className="text-gray-400 w-28">Confidence</span>
                  <span className="font-medium">{item.confidence ?? "—"}/100</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-28">Objection Handling</span>
                  <span className="font-medium">{item.objectionHandling ?? "—"}/100</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-28">Active Listening</span>
                  <span className="font-medium">{item.activeListening ?? "—"}/100</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 w-28">Qualification</span>
                  <span className="font-medium">{item.qualification ?? "—"}/100</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-gray-400">Outcome: </span>
                  <span
                    className={
                      item.desiredOutcomeAchieved
                        ? "text-green-600 font-medium"
                        : "text-gray-500"
                    }
                  >
                    {item.desiredOutcomeAchieved ? "Achieved" : "Not Achieved"}
                  </span>
                </div>

                {/* Future: audio playback, transcript, AI feedback buttons go here */}
                <div className="flex gap-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {summaries.length > 0 && (
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3">Attempt Summary by Scenario</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Scenario</th>
                  <th className="pb-2 font-medium">Attempts</th>
                  <th className="pb-2 font-medium">Latest</th>
                  <th className="pb-2 font-medium">Best Score</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((sm) => (
                  <tr key={sm.scenarioId} className="border-b last:border-0">
                    <td className="py-2">{sm.scenarioTitle}</td>
                    <td className="py-2">{sm.totalAttempts}</td>
                    <td className="py-2">
                      {sm.latestResult === "passed" ? (
                        <span className="text-green-600 font-medium">Passed</span>
                      ) : sm.latestResult === "failed" ? (
                        <span className="text-red-600 font-medium">Failed</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 font-medium">{sm.bestScore ?? "—"}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
