"use client";

import { useActionState } from "react";
import type { Employee } from "@/features/employees/types";
import { updateEmployee } from "@/features/employees/actions";

type Props = {
  employee: Employee;
  onCancel: () => void;
};

export function EditEmployeeForm({ employee, onCancel }: Props) {
  const [state, action, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const result = await updateEmployee(employee.id, formData);
      if (result.success) {
        onCancel();
      }
      return result;
    },
    undefined
  );

  return (
    <form action={action} className="border rounded p-4 bg-white space-y-3">
      <h3 className="font-semibold text-lg">Edit Employee</h3>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={employee.full_name}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={employee.email ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={employee.phone ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium">
          Position
        </label>
        <input
          id="position"
          name="position"
          type="text"
          defaultValue={employee.position ?? ""}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      {state && "error" in state && state.error && (
        <p className="text-red-600 text-sm">{state.error.message}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border rounded px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
