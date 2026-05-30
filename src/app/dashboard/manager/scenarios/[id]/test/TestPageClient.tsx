"use client";

import { useState } from "react";
import { SimulationClient } from "@/components/SimulationClient";
import { startTestSession } from "@/features/training/actions";

type Props = {
  scenarioId: string;
  scenarioTitle: string;
};

export function TestPageClient({ scenarioId, scenarioTitle }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    const result = await startTestSession(scenarioId);

    if (result.sessionId) {
      setSessionId(result.sessionId);
    } else {
      setError(result.error ?? "Failed to create test session.");
      setLoading(false);
    }
  };

  if (sessionId) {
    return (
      <SimulationClient
        sessionId={sessionId}
        scenarioTitle={scenarioTitle}
        initialData={{
          status: "active",
          overall_score: null,
          confidence_score: null,
          objection_handling_score: null,
          active_listening_score: null,
          qualification_score: null,
          desired_outcome_achieved: null,
          overall_result: null,
          strengths: null,
          weaknesses: null,
          coaching_feedback: null,
        }}
        backHref="/dashboard/manager/scenarios"
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto text-center">
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}
      <button
        onClick={handleStart}
        disabled={loading}
        className="bg-blue-600 text-white rounded px-8 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Preparing..." : "Start Test Call"}
      </button>
    </div>
  );
}
