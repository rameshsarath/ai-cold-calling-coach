import { requireManager } from "@/features/auth/manager-check";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized } = await requireManager();

  if (!authorized) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
