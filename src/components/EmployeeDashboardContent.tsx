"use client";

import Link from "next/link";
import type { ProgressMetrics, ReadinessInfo } from "@/features/training/types";
import type { ScenarioLockInfo } from "@/features/training/lock-state";
import type { SessionHistoryItem, ScenarioAttemptSummary } from "@/features/training/session-history";
import { EmployeeSessionHistory } from "./EmployeeSessionHistory";

type Props = {
  assignments: any[];
  progress: ProgressMetrics;
  readiness: ReadinessInfo;
  scenarioLockStatuses: ScenarioLockInfo[];
  sessions: any[];
  sessionHistory: SessionHistoryItem[];
  sessionSummaries: ScenarioAttemptSummary[];
  employeeName: string;
};

const stageBadgeColors: Record<string, string> = {
  Beginner: "bg-gray-200 text-gray-700",
  "In Training": "bg-yellow-100 text-yellow-700",
  "Ready For Outbound": "bg-green-100 text-green-700",
  Mastered: "bg-purple-100 text-purple-700",
};

const employeeStatusColors: Record<string, string> = {
  in_progress: "text-blue-600 bg-blue-50 border-blue-200",
  locked: "text-gray-400 bg-gray-50 border-gray-200",
  ready_for_mastery: "text-green-600 bg-green-50 border-green-200",
  mastered: "text-purple-600 bg-purple-50 border-purple-200",
};

const employeeStatusLabels: Record<string, string> = {
  in_progress: "In Progress",
  locked: "Locked",
  ready_for_mastery: "Ready For Mastery",
  mastered: "Mastered",
};

const stageMilestones = ["Beginner", "In Training", "Ready For Outbound", "Mastered"];

export function EmployeeDashboardContent({ assignments, progress, readiness, scenarioLockStatuses, sessions, sessionHistory, sessionSummaries, employeeName }: Props) {
  const currentStageIndex = stageMilestones.indexOf(readiness.stage);

  return (
    <div className="grid gap-6 max-w-2xl">
      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3">Your Readiness</h2>

        <div className="flex items-center gap-2 mb-4">
          {stageMilestones.map((stage, i) => {
            const isActive = i <= currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <div key={stage} className="flex-1 text-center">
                <div
                  className={`w-full h-1.5 rounded-full mb-1 ${
                    isActive ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
                <span
                  className={`text-xs ${
                    isCurrent
                      ? "text-blue-700 font-semibold"
                      : isActive
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>

        <span className={`inline-block rounded px-3 py-1 text-sm font-medium ${stageBadgeColors[readiness.stage]}`}>
          {readiness.stage}
        </span>
      </div>

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3">Assigned Scenarios</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-gray-500">
            No scenarios assigned yet. Check back later.
          </p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {assignments.map((a: any) => {
              const isArchived = a.scenarios?.status === "archived";

              if (isArchived) {
                return (
                  <div key={a.id} className="border rounded p-3 bg-gray-50 border-gray-200 opacity-70">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <div className="font-medium">{a.scenarios?.title ?? "Untitled"}</div>
                      <span className="text-xs font-medium text-red-500 ml-auto">Archived / Unavailable</span>
                    </div>
                  </div>
                );
              }

              const lockInfo = scenarioLockStatuses.find(
                (s) => s.scenario_id === a.scenario_id
              );

              if (!lockInfo) {
                return (
                  <div
                    key={a.id}
                    className="border rounded p-3 bg-white"
                  >
                    <div className="font-medium">{a.scenarios?.title ?? "Untitled"}</div>
                  </div>
                );
              }

              const isLocked = lockInfo.isLocked;
              const card = (
                <div
                  className={`border rounded p-3 ${
                    isLocked
                      ? "bg-gray-50 border-gray-200 opacity-70"
                      : "bg-white hover:shadow transition"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isLocked && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                      <div className="font-medium">{a.scenarios?.title ?? "Untitled"}</div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${employeeStatusColors[lockInfo.employeeStatus]}`}>
                      {employeeStatusLabels[lockInfo.employeeStatus]}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>Attempts: {lockInfo.attempts}</span>
                    <span>Passes: {lockInfo.passes}</span>
                  </div>
                  {isLocked && lockInfo.lockReason && (
                    <p className="mt-2 text-xs text-gray-400 italic">
                      {lockInfo.lockReason}
                    </p>
                  )}
                </div>
              );

              return isLocked ? (
                <div key={a.id}>{card}</div>
              ) : (
                <Link
                  key={a.id}
                  href={`/dashboard/employee/scenarios/${a.scenario_id}`}
                  className="block"
                >
                  {card}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <EmployeeSessionHistory
        items={sessionHistory}
        summaries={sessionSummaries}
        sessions={sessions}
        employeeName={employeeName}
      />

      <div className="border rounded p-4 bg-white">
        <h2 className="font-semibold mb-3">Your Progress</h2>
        {progress.total_completed === 0 ? (
          <p className="text-sm text-gray-500">
            Complete a scenario to see your progress here.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pass Rate</span>
                <span className="font-semibold">{progress.pass_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${progress.pass_rate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Avg Confidence</span>
                <span className="font-semibold">{progress.avg_confidence}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${progress.avg_confidence}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Avg Objection Handling</span>
                <span className="font-semibold">{progress.avg_objection_handling}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${progress.avg_objection_handling}%` }}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <div className="flex-1 border rounded p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{progress.total_completed}</div>
                <div className="text-xs text-gray-500 mt-1">Completed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
