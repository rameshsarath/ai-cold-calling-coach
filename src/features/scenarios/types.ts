export type ScenarioStatus = "draft" | "testing" | "active" | "archived";

export type Scenario = {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  industry: string | null;
  prospect_role: string | null;
  prospect_name: string | null;
  company_name: string | null;
  prospect_personality: string | null;
  pain_points: string | null;
  common_objections: string | null;
  desired_outcome: string | null;
  difficulty: string | null;
  time_limit: number | null;
  status: ScenarioStatus;
  created_at: string;
  updated_at: string;
};

export type ScenarioFormData = {
  title: string;
  description: string;
  industry: string;
  prospect_role: string;
  prospect_name: string;
  company_name: string;
  prospect_personality: string;
  pain_points: string;
  common_objections: string;
  desired_outcome: string;
  difficulty: string;
  time_limit: number;
  status: ScenarioStatus;
};
