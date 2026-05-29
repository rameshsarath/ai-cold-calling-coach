"use client";

import { useState } from "react";
import type { Employee } from "@/features/employees/types";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeForm } from "./EmployeeForm";
import { EditEmployeeForm } from "./EditEmployeeForm";

type Props = {
  employees: Employee[];
};

export function EmployeeList({ employees }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  return (
    <div className="space-y-6">
      {!showAddForm && !editingEmployee && (
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm"
        >
          + Add Employee
        </button>
      )}

      {showAddForm && (
        <EmployeeForm onCancel={() => setShowAddForm(false)} />
      )}

      {editingEmployee && (
        <EditEmployeeForm
          employee={editingEmployee}
          onCancel={() => setEditingEmployee(null)}
        />
      )}

      <EmployeeTable
        employees={employees}
        onEdit={(emp) => setEditingEmployee(emp)}
      />
    </div>
  );
}
