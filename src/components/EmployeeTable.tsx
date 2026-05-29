"use client";

import type { Employee } from "@/features/employees/types";
import { deleteEmployee } from "@/features/employees/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
};

export function EmployeeTable({ employees, onEdit }: Props) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return;
    await deleteEmployee(id);
    router.refresh();
  }

  if (employees.length === 0) {
    return (
      <p className="text-gray-500 text-sm py-4">
        No employees yet. Add your first employee above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Position</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-b last:border-0">
              <td className="py-2">
                <Link
                  href={`/dashboard/manager/employees/${emp.id}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {emp.full_name}
                </Link>
              </td>
              <td className="py-2">{emp.email ?? "—"}</td>
              <td className="py-2">{emp.position ?? "—"}</td>
              <td className="py-2 flex gap-3">
                <button
                  onClick={() => onEdit(emp)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(emp.id, emp.full_name)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
