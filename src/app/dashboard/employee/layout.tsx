import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  if (role !== "employee") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border-r flex flex-col h-full">
        <div className="p-4 border-b">
          <Link href="/dashboard/employee" className="font-bold text-lg">
            Cold Calling Coach
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard/employee"
            className="block rounded px-3 py-2 text-sm hover:bg-gray-100"
          >
            Dashboard
          </Link>
          <a
            href="#assigned-scenarios"
            className="block rounded px-3 py-2 text-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          >
            Assigned Scenarios
          </a>
          <a
            href="#session-history"
            className="block rounded px-3 py-2 text-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          >
            Session History
          </a>
          <a
            href="#attempt-summary"
            className="block rounded px-3 py-2 text-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          >
            Attempt Summary
          </a>
          <a
            href="#your-progress"
            className="block rounded px-3 py-2 text-sm text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          >
            Your Progress
          </a>
        </nav>
        <div className="p-4 border-t mt-auto">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</main>
    </div>
  );
}
