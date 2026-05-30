"use client";

import { useState, useMemo, Fragment } from "react";
import type { SessionHistoryItem, ScenarioAttemptSummary } from "@/features/training/session-history";
import type { Employee } from "@/features/employees/types";
import SessionReview from "./SessionReview";

type Props = {
  items: SessionHistoryItem[];
  summaries: ScenarioAttemptSummary[];
  sessions: any[];
  employee: Employee;
};

function TrendDot({ result }: { result: "passed" | "failed" | null }) {
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

export function ManagerSessionReview({
  items,
  summaries,
  sessions,
  employee,
}: Props) {
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

  return (
    <div className="space-y-6">
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
          Session Timeline
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No training sessions completed yet.</p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Scenario</th>
                  <th className="pb-2 font-medium">Duration</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Result</th>
                  <th className="pb-2 font-medium w-16">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isExpanded = expandedId === item.id;
                  const raw = isExpanded ? sessionMap.get(item.id) : null;
                  return (
                    <Fragment key={item.id}>
                      <tr className={isExpanded ? "bg-gray-50" : ""}>
                        <td className="py-2 text-xs text-gray-500 whitespace-nowrap border-b">
                          {item.completedAt
                            ? new Date(item.completedAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="py-2 border-b">
                          <span
                            className="max-w-[220px] truncate block font-medium"
                            title={item.scenarioTitle}
                          >
                            {item.scenarioTitle}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-gray-500 whitespace-nowrap border-b">
                          {formatDuration(item.durationSeconds)}
                        </td>
                        <td className="py-2 font-semibold border-b">
                          {raw?.overall_score != null ? `${raw.overall_score}/100` : "—"}
                        </td>
                        <td className="py-2 border-b">
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
                        <td className="py-2 border-b">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                          >
                            {isExpanded ? "Collapse" : "Review"}
                          </button>
                        </td>
                      </tr>
                      {raw && (
                        <tr key={`${item.id}-expanded`}>
                          <td colSpan={6} className="p-4 bg-gray-50 border-b">
                            <SessionReview
                              session={raw}
                              employeeName={employee.full_name ?? "Employee"}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
          Pass / Fail Trend
        </h2>
        <div className="flex items-center gap-1.5 flex-wrap">
          {items.map((item) => (
            <TrendDot key={item.id} result={item.overallResult} />
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
          <h2 className="font-semibold mb-3 text-sm text-gray-500 uppercase tracking-wide">
            Scenario Progression
          </h2>
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
