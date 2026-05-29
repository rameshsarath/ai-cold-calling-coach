export type Employee = {
  id: string;
  company_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  created_at: string;
  updated_at: string;
};

export type EmployeeFormData = {
  full_name: string;
  email: string;
  phone: string;
  position: string;
};
