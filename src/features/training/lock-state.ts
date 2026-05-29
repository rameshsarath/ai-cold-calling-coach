import type { ScenarioProgress } from "./types";

export type EmployeeScenarioStatus =
  | "in_progress"
  | "locked"
  | "ready_for_mastery"
  | "mastered";

export type ScenarioLockInfo = {
  scenario_id: string;
  scenario_title: string;
  attempts: number;
  passes: number;
  employeeStatus: EmployeeScenarioStatus;
  isLocked: boolean;
  lockReason: string | null;
};

export function getEmployeeScenarioStatuses(
  scenarioProgress: ScenarioProgress[]
): ScenarioLockInfo[] {
  const allScenariosReady = scenarioProgress.every((sp) => sp.passes >= 2);

  return scenarioProgress.map((sp) => {
    let employeeStatus: EmployeeScenarioStatus;
    let isLocked: boolean;
    let lockReason: string | null;

    if (sp.passes >= 5) {
      employeeStatus = "mastered";
      isLocked = false;
      lockReason = null;
    } else if (allScenariosReady) {
      employeeStatus = "ready_for_mastery";
      isLocked = false;
      lockReason = null;
    } else if (sp.passes >= 2) {
      employeeStatus = "locked";
      isLocked = true;
      lockReason = "Complete remaining scenarios to unlock mastery phase";
    } else {
      employeeStatus = "in_progress";
      isLocked = false;
      lockReason = null;
    }

    return {
      scenario_id: sp.scenario_id,
      scenario_title: sp.scenario_title,
      attempts: sp.attempts,
      passes: sp.passes,
      employeeStatus,
      isLocked,
      lockReason,
    };
  });
}
