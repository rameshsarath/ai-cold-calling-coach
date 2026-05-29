"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { endSession } from "@/features/training/actions";
import { createRetellCall } from "@/features/training/retell-actions";

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

type RetellPhase =
  | "idle"
  | "creating_call"
  | "joining"
  | "connected"
  | "ended"
  | "error";

export function SimulationClient({ sessionId, scenarioTitle, scenarioTimeLimit, initialData, sandbox }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(
    initialData.status === "completed" ? "evaluation" : "active"
  );
  const [elapsed, setElapsed] = useState(0);
  const [evaluation, setEvaluation] = useState(initialData);
  const [ending, setEnding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retellPhase, setRetellPhase] = useState<RetellPhase>("idle");
  const retellClientRef = useRef<any>(null);
  const endingRef = useRef(false);

  const handleEnd = useCallback(async () => {
    if (endingRef.current) return;
    endingRef.current = true;
    setEnding(true);
    setErrorMessage(null);

    if (retellClientRef.current) {
      try {
        retellClientRef.current.stopCall();
      } catch {
        // ignore cleanup errors
      }
      retellClientRef.current = null;
    }

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

  useEffect(() => {
    if (sandbox || phase !== "active") return;

    let active = true;

    async function initRetell() {
      setRetellPhase("creating_call");

      try {
        const { access_token } = await createRetellCall(sessionId);
        if (!active) return;

        setRetellPhase("joining");

        const { RetellWebClient } = await import("retell-client-js-sdk");
        if (!active) return;

        const client = new RetellWebClient();
        retellClientRef.current = client;

        client.on("call_started", () => {
          if (!active) return;
          setRetellPhase("connected");
        });

        client.on("call_ended", () => {
          if (!active) return;
          setRetellPhase("ended");
          if (!endingRef.current) {
            handleEnd();
          }
        });

        client.on("error", (error: any) => {
          if (!active) return;
          setErrorMessage(error?.message ?? "Call error occurred");
          setRetellPhase("error");
        });

        await client.startCall({ accessToken: access_token });
      } catch (err: any) {
        if (!active) return;
        setErrorMessage(err?.message ?? "Failed to start call");
        setRetellPhase("error");
      }
    }

    initRetell();

    return () => {
      active = false;
      if (retellClientRef.current) {
        try {
          retellClientRef.current.stopCall();
        } catch {
          // ignore cleanup errors
        }
        retellClientRef.current = null;
      }
    };
  }, [sessionId, sandbox, phase]);

  useEffect(() => {
    if (phase !== "active" || !sandbox) return;
    const interval = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [phase, sandbox]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (phase === "active") {
    if (sandbox) {
      const remaining = scenarioTimeLimit * 60 - elapsed;

      return (
        <div className="max-w-xl mx-auto text-center">
          <span className="inline-block rounded px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 mb-4">
            Scenario Test Mode
          </span>

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
            {ending ? "Ending..." : "End Test"}
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Live Call</h1>
          <p className="text-gray-500">{scenarioTitle}</p>
        </div>

        <div className="border rounded p-8 bg-white mb-8">
          {retellPhase === "creating_call" && (
            <div className="space-y-4">
              <div className="animate-pulse flex justify-center">
                <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Setting up your call...</p>
            </div>
          )}

          {retellPhase === "joining" && (
            <div className="space-y-4">
              <div className="animate-pulse flex justify-center">
                <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Connecting to AI prospect...</p>
            </div>
          )}

          {retellPhase === "connected" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
              </div>
              <p className="text-green-600 font-medium">Call connected</p>
              <p className="text-gray-400 text-sm">You are speaking with the AI prospect. Click &quot;End Call&quot; when finished.</p>
            </div>
          )}

          {retellPhase === "error" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <p className="text-red-600 font-medium">Connection failed</p>
              <p className="text-gray-400 text-sm">{errorMessage ?? "Unable to connect to the AI prospect."}</p>
            </div>
          )}

          {retellPhase === "idle" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Initializing...</p>
            </div>
          )}

          {retellPhase === "ended" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.28 3H5z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm">Call ended</p>
            </div>
          )}
        </div>

        {errorMessage && retellPhase !== "error" && (
          <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
        )}

        <button
          onClick={handleEnd}
          disabled={ending || retellPhase === "creating_call" || retellPhase === "joining"}
          className="bg-red-600 text-white rounded px-8 py-3 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ending ? "Ending..." : "End Call"}
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
