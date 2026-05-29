import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ManagerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name as string | undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome, {fullName || "Manager"}
      </h1>
      <p className="text-gray-500 mb-8">
        Manage your team and coaching sessions.
      </p>

      <div className="grid gap-4 max-w-md">
        <Link
          href="/dashboard/manager/employees"
          className="block border rounded p-4 bg-white hover:shadow transition"
        >
          <h2 className="font-semibold">Employees</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, or remove team members
          </p>
        </Link>
        <Link
          href="/dashboard/manager/scenarios"
          className="block border rounded p-4 bg-white hover:shadow transition"
        >
          <h2 className="font-semibold">Scenarios</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage coaching scenarios
          </p>
        </Link>
      </div>
    </div>
  );
}
