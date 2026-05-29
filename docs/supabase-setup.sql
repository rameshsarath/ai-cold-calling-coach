-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- 1. Create employees table
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 3. Allow managers to read their own company's employees
CREATE POLICY "Managers can view their employees"
ON employees
FOR SELECT
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 4. Allow managers to insert employees for their company
CREATE POLICY "Managers can insert employees"
ON employees
FOR INSERT
WITH CHECK (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 5. Allow managers to update their own employees
CREATE POLICY "Managers can update their employees"
ON employees
FOR UPDATE
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 6. Allow managers to delete their own employees
CREATE POLICY "Managers can delete their employees"
ON employees
FOR DELETE
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- ============================================
-- SCENARIOS TABLE
-- ============================================

-- 7. Create scenarios table
CREATE TABLE scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  prospect_role TEXT,
  prospect_name TEXT,
  company_name TEXT,
  prospect_personality TEXT,
  pain_points TEXT,
  common_objections TEXT,
  desired_outcome TEXT,
  difficulty TEXT DEFAULT 'beginner',
  time_limit INT DEFAULT 10,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'testing', 'active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Enable Row Level Security
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- 9. Managers can view their own scenarios
CREATE POLICY "Managers can view their scenarios"
ON scenarios
FOR SELECT
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 10. Managers can insert scenarios for their company
CREATE POLICY "Managers can insert scenarios"
ON scenarios
FOR INSERT
WITH CHECK (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 11. Managers can update their own scenarios
CREATE POLICY "Managers can update their scenarios"
ON scenarios
FOR UPDATE
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 12. Managers can delete their own scenarios
CREATE POLICY "Managers can delete their scenarios"
ON scenarios
FOR DELETE
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================

-- 13. Create assignments table
CREATE TABLE assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_unlocked BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completion_status TEXT CHECK (completion_status IN ('passed', 'failed', 'in_progress')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Enable Row Level Security
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- 15. Managers can view their company's assignments
CREATE POLICY "Managers can view assignments"
ON assignments
FOR SELECT
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 16. Managers can insert assignments for their company
CREATE POLICY "Managers can insert assignments"
ON assignments
FOR INSERT
WITH CHECK (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 17. Managers can delete their company's assignments
CREATE POLICY "Managers can delete assignments"
ON assignments
FOR DELETE
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

-- 18. Employees can view their own assignments
CREATE POLICY "Employees can view their own assignments"
ON assignments
FOR SELECT
USING (
  employee_id = auth.uid()
);

-- ============================================
-- TRAINING SESSIONS TABLE
-- ============================================

-- 19. Create training_sessions table
CREATE TABLE training_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'interrupted')),
  confidence_score INT,
  objection_handling_score INT,
  active_listening_score INT,
  qualification_score INT,
  desired_outcome_achieved BOOLEAN,
  overall_result TEXT CHECK (overall_result IN ('passed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 20. Enable Row Level Security
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

-- 21. Employees can view their own training sessions
CREATE POLICY "Employees can view their own sessions"
ON training_sessions
FOR SELECT
USING (
  employee_id = auth.uid()
);

-- 22. Employees can insert their own training sessions
CREATE POLICY "Employees can insert their own sessions"
ON training_sessions
FOR INSERT
WITH CHECK (
  employee_id = auth.uid()
);

-- 23. Employees can update their own training sessions
CREATE POLICY "Employees can update their own sessions"
ON training_sessions
FOR UPDATE
USING (
  employee_id = auth.uid()
);

-- 24. Managers can view their company's training sessions (for future analytics)
CREATE POLICY "Managers can view company sessions"
ON training_sessions
FOR SELECT
USING (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);
