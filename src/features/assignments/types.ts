export type Assignment = {
  id: string;
  employee_id: string;
  scenario_id: string;
  company_id: string;
  assigned_at: string;
  is_unlocked: boolean;
  is_completed: boolean;
  completion_status: string | null;
};

export type AssignmentWithDetails = Assignment & {
  employees: { full_name: string; email: string | null } | null;
  scenarios: { title: string; difficulty: string | null; status: string } | null;
};

export type AssignmentFormData = {
  employee_id: string;
  scenario_id: string;
};
