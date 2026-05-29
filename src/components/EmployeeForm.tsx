"use client";

import { useActionState } from "react";
import { addEmployee } from "@/features/employees/actions";

type Props = {
  onCancel: () => void;
};

function validatePasswords(password: string, confirm: string): string | null {
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  if (password !== confirm) {
    return "Passwords do not match.";
  }
  return null;
}

export function EmployeeForm({ onCancel }: Props) {
  const [state, action, pending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const password = formData.get("password") as string;
      const confirm = formData.get("confirm_password") as string;
      const validationError = validatePasswords(password, confirm);
      if (validationError) {
        return { success: false, error: { message: validationError } };
      }
      const result = await addEmployee(formData);
      if (result.success) {
        onCancel();
      }
      return result;
    },
    undefined
  );

  return (
    <form action={action} className="border rounded p-4 bg-white space-y-3">
      <h3 className="font-semibold text-lg">Add Employee</h3>

      <div>
        <label htmlFor="full_name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
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
          required
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
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium">
          Confirm Password
        </label>
        <input
          id="confirm_password"
          name="confirm_password"
          type="password"
          required
          minLength={6}
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
