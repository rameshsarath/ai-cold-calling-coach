"use client";

import { useState } from "react";

type Props = {
  session: any;
  employeeName: string;
};

type TranscriptLine = {
  speaker: "agent" | "user" | "system";
  text: string;
};

function parseTranscript(text: string): TranscriptLine[] {
  return text.split("\n").map((line) => {
    const trimmed = line.trim();
    if (/^Agent:/i.test(trimmed)) {
      return { speaker: "agent", text: trimmed.replace(/^Agent:\s*/i, "") };
    }
    if (/^User:/i.test(trimmed)) {
      return { speaker: "user", text: trimmed.replace(/^User:\s*/i, "") };
    }
    return { speaker: "system", text: line };
  });
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const pct = score !== null ? score : 0;
  const color =
    pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-12 text-right">
        {score !== null ? score : "—"}
      </span>
    </div>
  );
}

export default function SessionReview({ session, employeeName }: Props) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  const scenario = session.scenarios ?? {};
  const prospectName = scenario.prospect_name ?? "Prospect";
  const prospectRole = scenario.prospect_role ?? null;
  const prospectPersonality = scenario.prospect_personality ?? null;
  const transcript: string | null = session.transcript ?? null;
  const recordingUrl: string | null = session.recording_url ?? null;
  const callSummary: string | null = session.call_summary ?? null;
  const overallScore: number | null = session.overall_score ?? null;
  const strengths: string | null = session.strengths ?? null;
  const weaknesses: string | null = session.weaknesses ?? null;
  const coachingFeedback: string | null = session.coaching_feedback ?? null;
  const confidence: number | null = session.confidence_score ?? null;
  const objectionHandling: number | null = session.objection_handling_score ?? null;
  const activeListening: number | null = session.active_listening_score ?? null;
  const qualification: number | null = session.qualification_score ?? null;
  const desiredOutcome: boolean | null = session.desired_outcome_achieved ?? null;
  const overallResult: "passed" | "failed" | null = session.overall_result ?? null;
  const startTime: string | null = session.started_at ?? null;
  const endTime: string | null = session.ended_at ?? null;
  const durationMs: number | null = session.call_duration_ms ?? null;

  const durationLabel = durationMs
    ? `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`
    : startTime && endTime
    ? (() => {
        const secs = Math.round(
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
        );
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}m ${s}s`;
      })()
    : "—";

  return (
    <div className="space-y-4">
      {/* Session Overview */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
          Session Overview
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-gray-500">Date:</dt>
            <dd>
              {session.ended_at
                ? new Date(session.ended_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">Scenario:</dt>
            <dd className="font-medium">{scenario.title ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">Duration:</dt>
            <dd>{durationLabel}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">Result:</dt>
            <dd>
              {overallResult === "passed" ? (
                <span className="text-green-600 bg-green-50 border border-green-200 rounded px-2 py-0.5 text-xs font-medium">
                  Passed
                </span>
              ) : overallResult === "failed" ? (
                <span className="text-red-600 bg-red-50 border border-red-200 rounded px-2 py-0.5 text-xs font-medium">
                  Failed
                </span>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">Overall Score:</dt>
            <dd className="font-semibold">
              {overallScore !== null ? `${overallScore}/100` : "—"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-500">Outcome Achieved:</dt>
            <dd
              className={
                desiredOutcome ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {desiredOutcome ? "Yes" : "No"}
            </dd>
          </div>
        </dl>
      </div>

      {/* AI Evaluation */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
          AI Evaluation
        </h3>
        <div className="space-y-3">
          <ScoreBar label="Confidence" score={confidence} />
          <ScoreBar label="Objection Handling" score={objectionHandling} />
          <ScoreBar label="Active Listening" score={activeListening} />
          <ScoreBar label="Qualification" score={qualification} />
          {overallScore !== null && (
            <ScoreBar label="Overall Score" score={overallScore} />
          )}
        </div>
      </div>

      {/* Strengths */}
      {strengths && (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <h3 className="font-semibold text-sm text-green-800 uppercase tracking-wide mb-3">
            Strengths
          </h3>
          <p className="text-sm text-green-900 whitespace-pre-line">
            {strengths.split("\n").map((line: string, i: number) => (
              <span key={i} className="block mb-1">
                <span className="text-green-600 mr-2">✓</span>
                {line}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Improvement Areas */}
      {weaknesses && (
        <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
          <h3 className="font-semibold text-sm text-amber-800 uppercase tracking-wide mb-3">
            Improvement Areas
          </h3>
          <p className="text-sm text-amber-900 whitespace-pre-line">
            {weaknesses.split("\n").map((line: string, i: number) => (
              <span key={i} className="block mb-1">
                <span className="text-amber-600 mr-2">•</span>
                {line}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Coaching Feedback */}
      {coachingFeedback && (
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-sm text-blue-800 uppercase tracking-wide mb-3">
            Coaching Feedback
          </h3>
          <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
            {coachingFeedback}
          </p>
        </div>
      )}

      {/* Call Summary */}
      {callSummary && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
            Call Summary
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {callSummary}
          </p>
        </div>
      )}

      {/* Recording Playback */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
          Call Recording
        </h3>
        {recordingUrl ? (
          <audio controls src={recordingUrl} className="w-full" />
        ) : (
          <p className="text-sm text-gray-400">Recording unavailable</p>
        )}
      </div>

      {/* Transcript Viewer */}
      {transcript && (
        <div className="border rounded-lg p-4 bg-white">
          <button
            onClick={() => setTranscriptOpen(!transcriptOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <svg
              className={`w-4 h-4 transition-transform ${transcriptOpen ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {transcriptOpen ? "Hide Transcript" : "Show Transcript"}
          </button>

          {transcriptOpen && (
            <div className="mt-3 max-h-[400px] overflow-y-auto space-y-2">
              {parseTranscript(transcript).map((line, i) => {
                if (line.speaker === "agent") {
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="max-w-[75%] bg-gray-100 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          {prospectName}
                          {prospectRole || prospectPersonality
                            ? ` — ${[prospectRole, prospectPersonality].filter(Boolean).join(" • ")}`
                            : ""}
                        </p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{line.text}</p>
                      </div>
                    </div>
                  );
                }
                if (line.speaker === "user") {
                  return (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[75%] bg-blue-600 rounded-lg px-3 py-2">
                        <p className="text-xs font-medium text-blue-200 mb-1">{employeeName}</p>
                        <p className="text-sm text-white whitespace-pre-wrap">{line.text}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex justify-center">
                    <p className="text-xs text-gray-400 italic whitespace-pre-wrap text-center">
                      {line.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
