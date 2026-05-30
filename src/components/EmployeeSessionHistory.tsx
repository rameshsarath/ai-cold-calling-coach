"use client";

import { useState, useMemo } from "react";
import type { SessionHistoryItem, ScenarioAttemptSummary } from "@/features/training/session-history";
import SessionReview from "./SessionReview";

type Props = {
  items: SessionHistoryItem[];
  summaries: ScenarioAttemptSummary[];
  sessions: any[];
  employeeName: string;
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function EmployeeSessionHistory({ items, summaries, sessions, employeeName }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sessionMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const s of sessions ?? []) {
      map.set(s.id, s);
    }
    return map;
  }, [sessions]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (items.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3">Session History</h2>

        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const raw = isExpanded ? sessionMap.get(item.id) : null;

            return (
              <div key={item.id}>
                <div
                  className={`border rounded p-3 bg-white text-sm cursor-pointer hover:shadow transition ${
                    isExpanded ? "border-blue-200" : ""
                  }`}
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium truncate max-w-[220px]" title={item.scenarioTitle}>
                      {item.scenarioTitle}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500">
                        {raw?.overall_score != null ? `Score: ${raw.overall_score}/100` : "—"}
                      </span>
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

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
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

                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      {isExpanded ? "Collapse" : "Review"}
                    </button>
                  </div>
                </div>

                {raw && isExpanded && (
                  <div className="border rounded-lg p-4 mt-2 bg-gray-50">
                    <SessionReview
                      session={raw}
                      employeeName={employeeName}
                    />
                  </div>
                )}
              </div>
            );
          })}
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
