import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type Props = {
  role?: "manager" | "employee";
};

export function DashboardSidebar({ role = "manager" }: Props) {
  return (
    <aside className="w-56 bg-white border-r flex flex-col h-full">
      <div className="p-4 border-b">
        <Link
          href={role === "manager" ? "/dashboard/manager" : "/dashboard/employee"}
          className="font-bold text-lg"
        >
          Cold Calling Coach
        </Link>
        {role === "manager" && <p className="text-xs text-gray-400 mt-1">Manager</p>}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/dashboard/manager"
          className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/manager/employees"
          className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
        >
          Employees
        </Link>
        <Link
          href="/dashboard/manager/scenarios"
          className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
        >
          Scenarios
        </Link>
        <Link
          href="/dashboard/manager/assignments"
          className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
        >
          Assignments
        </Link>
      </nav>

      <div className="p-4 border-t mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}
