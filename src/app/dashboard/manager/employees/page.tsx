import { getEmployees } from "@/features/employees/queries";
import { EmployeeList } from "@/components/EmployeeList";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Employees</h1>
      <EmployeeList employees={employees} />
    </div>
  );
}
