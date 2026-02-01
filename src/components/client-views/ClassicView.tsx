"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Home,
  Image,
  ShoppingCart,
  Heart,
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  Shield,
  Palette,
  User,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Navigation items configuration
const allNavigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    requiresFlag: null,
  },
  {
    title: "Pakiety",
    href: "/dashboard/packages",
    icon: Image,
    requiresFlag: "packagesEnabled" as const,
  },
  {
    title: "Nowe zamówienie",
    href: "/new-order",
    icon: ShoppingCart,
    requiresFlag: null,
  },
  {
    title: "Zamówienia",
    href: "/orders",
    icon: Heart,
    requiresFlag: null,
  },
]

export interface FeatureFlags {
  packagesEnabled: boolean
  expressEnabled: boolean
  urgentEnabled: boolean
}

interface ClassicViewProps {
  children: React.ReactNode
  user?: {
    name?: string
    email?: string
    image?: string
    initials?: string
    role?: string
  }
  notifications?: number
  featureFlags?: FeatureFlags
}

// Sidebar Navigation Component
function SidebarNav({ className, featureFlags }: { className?: string; featureFlags?: FeatureFlags }) {
  const pathname = usePathname()

  const navigationItems = allNavigationItems.filter((item) => {
    if (!item.requiresFlag) return true
    if (!featureFlags) return true
    return featureFlags[item.requiresFlag]
  })

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "hover:bg-gray-100 hover:text-gray-900",
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600"
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="flex-1">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Desktop Sidebar Component
function DesktopSidebar({ featureFlags }: { featureFlags?: FeatureFlags }) {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:border-gray-200 lg:bg-white">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gray-900 text-white font-bold">
          L
        </div>
        <span className="text-lg font-semibold text-gray-900">
          Live AI Photo
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <SidebarNav featureFlags={featureFlags} />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <p className="text-xs text-gray-500 text-center">
          Live AI Photo v1.0
        </p>
      </div>
    </aside>
  )
}

// Mobile Sidebar Component
function MobileSidebar({ featureFlags }: { featureFlags?: FeatureFlags }) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-gray-200 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gray-900 text-white font-bold">
              L
            </div>
            <span>Live AI Photo</span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4">
          <SidebarNav featureFlags={featureFlags} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Header Component
function Header({
  user,
  notifications = 0,
  featureFlags,
}: {
  user?: ClassicViewProps["user"]
  notifications?: number
  featureFlags?: FeatureFlags
}) {
  const defaultUser = {
    name: "Jan Kowalski",
    email: "jan@example.com",
    initials: "JK",
  }

  const currentUser = { ...defaultUser, ...user }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Left side - Mobile menu + breadcrumb area */}
      <div className="flex items-center gap-4">
        <MobileSidebar featureFlags={featureFlags} />
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold text-gray-900">
            Panel klienta
          </h1>
        </div>
      </div>

      {/* Right side - Notifications + User menu */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Powiadomienia"
        >
          <Bell className="size-5 text-gray-600" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {notifications > 9 ? "9+" : notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 hover:bg-gray-100"
            >
              <Avatar size="sm">
                {currentUser.image && (
                  <AvatarImage src={currentUser.image} alt={currentUser.name} />
                )}
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {currentUser.name}
              </span>
              <ChevronDown className="hidden md:block size-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="size-4" />
                <span>Mój profil</span>
              </Link>
            </DropdownMenuItem>
            {currentUser.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="size-4" />
                  <span>Panel admina</span>
                </Link>
              </DropdownMenuItem>
            )}
            {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
              <DropdownMenuItem asChild>
                <Link href="/designer" className="flex items-center gap-2 cursor-pointer">
                  <Palette className="size-4" />
                  <span>Panel grafika</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-4" />
              <span>Wyloguj się</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Main ClassicView Component
export function ClassicView({
  children,
  user,
  notifications,
  featureFlags,
}: ClassicViewProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar featureFlags={featureFlags} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header user={user} notifications={notifications} featureFlags={featureFlags} />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Export additional components for flexibility
export { SidebarNav, DesktopSidebar, MobileSidebar, Header }
export type { ClassicViewProps }
