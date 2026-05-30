export type SessionStatus = "active" | "completed" | "interrupted";

export type TrainingSession = {
  id: string;
  employee_id: string;
  scenario_id: string;
  company_id: string;
  started_at: string;
  ended_at: string | null;
  status: SessionStatus;
  confidence_score: number | null;
  objection_handling_score: number | null;
  active_listening_score: number | null;
  qualification_score: number | null;
  desired_outcome_achieved: boolean | null;
  overall_result: "passed" | "failed" | null;
  retell_call_id: string | null;
  transcript: string | null;
  call_duration_ms: number | null;
  call_summary: string | null;
  user_sentiment: string | null;
  call_successful: boolean | null;
  recording_url: string | null;
  disconnection_reason: string | null;
  call_ended_at: string | null;
  overall_score: number | null;
  strengths: string | null;
  weaknesses: string | null;
  coaching_feedback: string | null;
  is_test: boolean;
  created_at: string;
  updated_at: string;
};

export type TrainingSessionWithScenario = TrainingSession & {
  scenarios: {
    title: string;
    description: string | null;
    difficulty: string | null;
    time_limit: number | null;
  } | null;
};

export type ProgressMetrics = {
  total_completed: number;
  pass_rate: number;
  avg_confidence: number;
  avg_objection_handling: number;
};

export type ScenarioProgress = {
  scenario_id: string;
  scenario_title: string;
  attempts: number;
  passes: number;
  status: "pending" | "ready" | "mastered";
};

export type ReadinessStage = "Beginner" | "In Training" | "Ready For Outbound" | "Mastered";

export type ReadinessInfo = {
  stage: ReadinessStage;
  progressPercent: number;
  masteredProgressPercent: number;
};
