export type ScoreTrend = "up" | "down" | "same" | null;

export type SessionHistoryItem = {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  completedAt: string | null;
  durationSeconds: number | null;
  confidence: number | null;
  objectionHandling: number | null;
  activeListening: number | null;
  qualification: number | null;
  desiredOutcomeAchieved: boolean | null;
  overallResult: "passed" | "failed" | null;
  trend: ScoreTrend;
};

export type ScenarioAttemptSummary = {
  scenarioId: string;
  scenarioTitle: string;
  totalAttempts: number;
  latestResult: "passed" | "failed" | null;
  bestScore: number | null;
};

function computeItemTrend(sessions: any[], index: number): ScoreTrend {
  if (index === sessions.length - 1) return null;
  const current = sessions[index];
  const next = sessions[index + 1];
  if (current.scenario_id !== next.scenario_id) return null;

  const curAvg =
    ((current.confidence_score ?? 0) +
      (current.objection_handling_score ?? 0) +
      (current.active_listening_score ?? 0) +
      (current.qualification_score ?? 0)) /
    4;
  const nextAvg =
    ((next.confidence_score ?? 0) +
      (next.objection_handling_score ?? 0) +
      (next.active_listening_score ?? 0) +
      (next.qualification_score ?? 0)) /
    4;

  if (curAvg > nextAvg + 2) return "up";
  if (curAvg < nextAvg - 2) return "down";
  return "same";
}

export function buildSessionHistory(sessions: any[]): SessionHistoryItem[] {
  const groupedByScenario: Record<string, any[]> = {};
  for (const s of sessions) {
    const sid = s.scenario_id;
    if (!groupedByScenario[sid]) groupedByScenario[sid] = [];
    groupedByScenario[sid].push(s);
  }

  for (const key of Object.keys(groupedByScenario)) {
    groupedByScenario[key].sort(
      (a, b) => new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime()
    );
  }

  const allSorted: any[] = [];
  for (const s of sessions) {
    if (!allSorted.find((x) => x.id === s.id)) allSorted.push(s);
  }
  allSorted.sort(
    (a, b) => new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime()
  );

  return allSorted.map((s) => {
    const scenarioSessions = groupedByScenario[s.scenario_id] ?? [];
    const idx = scenarioSessions.findIndex((ss) => ss.id === s.id);
    const trend = idx >= 0 ? computeItemTrend(scenarioSessions, idx) : null;

    return {
      id: s.id,
      scenarioId: s.scenario_id,
      scenarioTitle: s.scenarios?.title ?? "Untitled",
      completedAt: s.ended_at,
      durationSeconds:
        s.ended_at && s.started_at
          ? Math.round(
              (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000
            )
          : null,
      confidence: s.confidence_score,
      objectionHandling: s.objection_handling_score,
      activeListening: s.active_listening_score,
      qualification: s.qualification_score,
      desiredOutcomeAchieved: s.desired_outcome_achieved,
      overallResult: s.overall_result,
      trend,
    };
  });
}

export function buildScenarioSummaries(sessions: any[]): ScenarioAttemptSummary[] {
  const grouped: Record<string, any[]> = {};
  for (const s of sessions) {
    const sid = s.scenario_id;
    if (!grouped[sid]) grouped[sid] = [];
    grouped[sid].push(s);
  }

  return Object.entries(grouped).map(([scenarioId, attempts]) => {
    const latest = attempts[0];
    const best = attempts.reduce((best: any, a: any) => {
      const avg =
        ((a.confidence_score ?? 0) +
          (a.objection_handling_score ?? 0) +
          (a.active_listening_score ?? 0) +
          (a.qualification_score ?? 0)) /
        4;
      const bestAvg =
        ((best.confidence_score ?? 0) +
          (best.objection_handling_score ?? 0) +
          (best.active_listening_score ?? 0) +
          (best.qualification_score ?? 0)) /
        4;
      return avg > bestAvg ? a : best;
    }, attempts[0]);

    const bestAvg =
      ((best.confidence_score ?? 0) +
        (best.objection_handling_score ?? 0) +
        (best.active_listening_score ?? 0) +
        (best.qualification_score ?? 0)) /
      4;

    return {
      scenarioId,
      scenarioTitle: attempts[0]?.scenarios?.title ?? "Untitled",
      totalAttempts: attempts.length,
      latestResult: latest?.overall_result ?? null,
      bestScore: Math.round(bestAvg),
    };
  });
}


