import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/layout/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only ADMIN can access admin panel
  if (session.user.role !== "ADMIN") {
    // Redirect designers to their panel
    if (session.user.role === "DESIGNER") {
      redirect("/designer");
    }
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <AdminNav user={session.user} />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
