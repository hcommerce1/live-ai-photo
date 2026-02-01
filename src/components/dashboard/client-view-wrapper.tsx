"use client";

import {
  ClassicView,
  ModernView,
  DarkView,
  CompactView,
  CreativeView,
} from "@/components/client-views";

type ViewType = "classic" | "modern" | "dark" | "compact" | "creative";

export interface FeatureFlags {
  packagesEnabled: boolean;
  expressEnabled: boolean;
  urgentEnabled: boolean;
}

interface UserProps {
  name?: string;
  email?: string;
  image?: string;
  role?: string;
}

interface ViewComponentProps {
  children: React.ReactNode;
  user?: UserProps;
  featureFlags?: FeatureFlags;
}

interface ClientViewWrapperProps {
  children: React.ReactNode;
  viewType: ViewType;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
  featureFlags?: FeatureFlags;
}

const viewComponents: Record<ViewType, React.ComponentType<ViewComponentProps>> = {
  classic: ClassicView,
  modern: ModernView,
  dark: DarkView,
  compact: CompactView,
  creative: CreativeView,
};

export function ClientViewWrapper({ children, viewType, user, featureFlags }: ClientViewWrapperProps) {
  const ViewComponent = viewComponents[viewType] || ClassicView;

  const defaultFeatureFlags: FeatureFlags = {
    packagesEnabled: true,
    expressEnabled: true,
    urgentEnabled: true,
  };

  return (
    <ViewComponent
      user={user ? {
        name: user.name || undefined,
        email: user.email || undefined,
        image: user.image || undefined,
        role: user.role || undefined,
      } : undefined}
      featureFlags={featureFlags || defaultFeatureFlags}
    >
      {children}
    </ViewComponent>
  );
}
