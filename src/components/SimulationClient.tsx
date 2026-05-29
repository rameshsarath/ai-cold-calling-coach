"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { endSession } from "@/features/training/actions";

function randomScore(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type EvalData = {
  status: string;
  confidence_score: number | null;
  objection_handling_score: number | null;
  active_listening_score: number | null;
  qualification_score: number | null;
  desired_outcome_achieved: boolean | null;
  overall_result: "passed" | "failed" | null;
};

type Props = {
  sessionId: string;
  scenarioTitle: string;
  scenarioTimeLimit: number;
  initialData: EvalData;
  sandbox?: boolean;
};

type Phase = "active" | "evaluation" | "error";

export function SimulationClient({ sessionId, scenarioTitle, scenarioTimeLimit, initialData, sandbox }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(
    initialData.status === "completed" ? "evaluation" : "active"
  );
  const [elapsed, setElapsed] = useState(0);
  const [evaluation, setEvaluation] = useState(initialData);
  const [ending, setEnding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleEnd = useCallback(async () => {
    setEnding(true);
    setErrorMessage(null);

    if (sandbox) {
      const confidenceScore = randomScore(50, 100);
      const objectionHandlingScore = randomScore(40, 95);
      const activeListeningScore = randomScore(55, 100);
      const qualificationScore = randomScore(45, 90);
      const desiredOutcomeAchieved = Math.random() > 0.35;
      const overallResult = desiredOutcomeAchieved ? "passed" : "failed";

      setEvaluation({
        status: "completed",
        confidence_score: confidenceScore,
        objection_handling_score: objectionHandlingScore,
        active_listening_score: activeListeningScore,
        qualification_score: qualificationScore,
        desired_outcome_achieved: desiredOutcomeAchieved,
        overall_result: overallResult,
      });
      setPhase("evaluation");
      return;
    }

    try {
      const result = await endSession(sessionId);
      if (result.success) {
        setEvaluation({
          status: "completed",
          confidence_score: result.confidence_score ?? 0,
          objection_handling_score: result.objection_handling_score ?? 0,
          active_listening_score: result.active_listening_score ?? 0,
          qualification_score: result.qualification_score ?? 0,
          desired_outcome_achieved: result.desired_outcome_achieved ?? false,
          overall_result: (result.overall_result ?? "failed") as "passed" | "failed",
        });
        setPhase("evaluation");
      } else {
        setErrorMessage(result.error?.message ?? "Failed to end simulation.");
        setEnding(false);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "An unexpected error occurred.");
      setEnding(false);
    }
  }, [sessionId, sandbox]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (phase === "active") {
    const remaining = scenarioTimeLimit * 60 - elapsed;

    return (
      <div className="max-w-xl mx-auto text-center">
        {sandbox && (
          <span className="inline-block rounded px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 mb-4">
            Scenario Test Mode
          </span>
        )}

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Active Simulation</h1>
          <p className="text-gray-500">{scenarioTitle}</p>
        </div>

        <div className="text-6xl font-mono font-bold mb-8 tabular-nums">
          {remaining > 0 ? formatTime(remaining) : "00:00"}
        </div>

        <div className="border rounded p-8 bg-white mb-8">
          <p className="text-gray-400 text-sm mb-4">Simulation in progress...</p>
          <p className="text-gray-500 text-sm">
            This is a simulated cold calling session.
            <br />
            Click &quot;End Simulation&quot; when you are finished.
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${Math.max(0, (remaining / (scenarioTimeLimit * 60)) * 100)}%` }}
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
        )}

        <button
          onClick={handleEnd}
          disabled={ending}
          className="bg-red-600 text-white rounded px-8 py-3 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ending ? "Ending..." : sandbox ? "End Test" : "End Simulation"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {sandbox && (
        <div className="text-center mb-6">
          <span className="inline-block rounded px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700">
            Scenario Test Mode
          </span>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-2 text-center">Simulation Complete</h1>
      <p className="text-gray-500 text-center mb-8">{scenarioTitle}</p>

      <div className="border rounded p-6 bg-white mb-6">
        <h2 className="font-semibold mb-4 text-sm text-gray-500 uppercase tracking-wide">Performance Scores</h2>
        <dl className="space-y-3">
          <div className="flex justify-between text-sm">
            <dt>Confidence</dt>
            <dd className="font-semibold">{evaluation.confidence_score}/100</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt>Objection Handling</dt>
            <dd className="font-semibold">{evaluation.objection_handling_score}/100</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt>Active Listening</dt>
            <dd className="font-semibold">{evaluation.active_listening_score}/100</dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt>Qualification</dt>
            <dd className="font-semibold">{evaluation.qualification_score}/100</dd>
          </div>
          <div className="flex justify-between text-sm border-t pt-3">
            <dt>Desired Outcome Achieved</dt>
            <dd className={evaluation.desired_outcome_achieved ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {evaluation.desired_outcome_achieved ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>

      <div className={`border rounded p-6 mb-8 text-center ${evaluation.overall_result === "passed" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <p className={`text-2xl font-bold ${evaluation.overall_result === "passed" ? "text-green-700" : "text-red-700"}`}>
          {evaluation.overall_result === "passed" ? "PASSED" : "FAILED"}
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push(sandbox ? "/dashboard/manager/scenarios" : "/dashboard/employee")}
          className="bg-blue-600 text-white rounded px-6 py-3 text-sm font-medium hover:bg-blue-700"
        >
          Back to {sandbox ? "Scenarios" : "Dashboard"}
        </button>
      </div>
    </div>
  );
}
