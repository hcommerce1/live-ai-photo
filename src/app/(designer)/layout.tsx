import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DesignerNav } from "@/components/layout/designer-nav";

export default async function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only DESIGNER and ADMIN can access designer panel
  if (session.user.role !== "DESIGNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      <DesignerNav user={session.user} />
      <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}
