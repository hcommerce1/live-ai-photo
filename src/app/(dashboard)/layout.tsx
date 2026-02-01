import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ClientViewWrapper } from "@/components/dashboard/client-view-wrapper";

export interface FeatureFlags {
  packagesEnabled: boolean;
  expressEnabled: boolean;
  urgentEnabled: boolean;
}

async function getSystemSettings() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
      select: {
        defaultClientView: true,
        packagesEnabled: true,
        expressEnabled: true,
        urgentEnabled: true,
      },
    });
    return {
      viewType: (settings?.defaultClientView as "classic" | "modern" | "dark" | "compact" | "creative") || "classic",
      featureFlags: {
        packagesEnabled: settings?.packagesEnabled ?? true,
        expressEnabled: settings?.expressEnabled ?? true,
        urgentEnabled: settings?.urgentEnabled ?? true,
      },
    };
  } catch {
    return {
      viewType: "classic" as const,
      featureFlags: {
        packagesEnabled: true,
        expressEnabled: true,
        urgentEnabled: true,
      },
    };
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { viewType, featureFlags } = await getSystemSettings();

  return (
    <ClientViewWrapper viewType={viewType} user={session.user} featureFlags={featureFlags}>
      {children}
    </ClientViewWrapper>
  );
}
