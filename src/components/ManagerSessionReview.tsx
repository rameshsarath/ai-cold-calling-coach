"use client";

import type { SessionHistoryItem, ScenarioAttemptSummary } from "@/features/training/session-history";

type Props = {
  items: SessionHistoryItem[];
  summaries: ScenarioAttemptSummary[];
};

function TrendDot({ result, index }: { result: "passed" | "failed" | null; index: number }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        result === "passed" ? "bg-green-500" : result === "failed" ? "bg-red-400" : "bg-gray-200"
      }`}
      title={result === "passed" ? "Passed" : result === "failed" ? "Failed" : "Incomplete"}
    />
  );
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function ManagerSessionReview({ items, summaries }: Props) {
  return (
    <div className="space-y-6">
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Session Timeline</h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No training sessions completed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Scenario</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Confidence</th>
                  <th className="pb-2 font-medium">Objection</th>
                  <th className="pb-2 font-medium">Listening</th>
                  <th className="pb-2 font-medium">Qualification</th>
                  <th className="pb-2 font-medium">Outcome</th>
                  <th className="pb-2 font-medium">Result</th>
                  <th className="pb-2 font-medium w-16"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 text-xs text-gray-500 whitespace-nowrap">
                      {item.completedAt
                        ? new Date(item.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="py-2 font-medium whitespace-nowrap">{item.scenarioTitle}</td>
                    <td className="py-2 text-xs text-gray-500">{formatDuration(item.durationSeconds)}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${item.confidence ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs">{item.confidence ?? "—"}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-500 h-1.5 rounded-full"
                            style={{ width: `${item.objectionHandling ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs">{item.objectionHandling ?? "—"}</span>
                      </div>
                    </td>
                    <td className="py-2 text-xs">{item.activeListening ?? "—"}</td>
                    <td className="py-2 text-xs">{item.qualification ?? "—"}</td>
                    <td className="py-2 text-xs">
                      {item.desiredOutcomeAchieved ? (
                        <span className="text-green-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="py-2">
                      {item.overallResult === "passed" ? (
                        <span className="text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5 text-xs font-medium">
                          Passed
                        </span>
                      ) : item.overallResult === "failed" ? (
                        <span className="text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 text-xs font-medium">
                          Failed
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {/* Future: playback, transcript, AI feedback buttons go here */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Pass / Fail Trend</h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {items.map((item, i) => (
            <TrendDot key={item.id} result={item.overallResult} index={i} />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500" /> Passed
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400" /> Failed
          </span>
          <span className="text-xs">
            {items.filter((i) => i.overallResult === "passed").length}/{items.length} passed
          </span>
        </div>
      </div>

      {summaries.length > 0 && (
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">Scenario Progression</h2>
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
                    <td className="py-2 font-medium">{sm.scenarioTitle}</td>
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
