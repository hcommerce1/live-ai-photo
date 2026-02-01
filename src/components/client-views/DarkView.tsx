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
const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Pakiety",
    href: "/dashboard/packages",
    icon: Image,
  },
  {
    title: "Nowe zamówienie",
    href: "/new-order",
    icon: ShoppingCart,
  },
  {
    title: "Zamówienia",
    href: "/orders",
    icon: Heart,
  },
]

interface FeatureFlags {
  packagesEnabled: boolean
  expressEnabled: boolean
  urgentEnabled: boolean
}

interface DarkViewProps {
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

// Dark Sidebar Navigation Component
function DarkSidebarNav({ className }: { className?: string }) {
  const pathname = usePathname()

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
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20",
              "hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]",
              isActive
                ? "bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                : "text-gray-400 hover:text-white"
            )}
          >
            <Icon className={cn(
              "size-5 shrink-0 transition-all duration-300",
              isActive
                ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                : "group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
            )} />
            <span className="flex-1">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Dark Desktop Sidebar Component
function DarkDesktopSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:border-cyan-500/20 lg:bg-gray-950/95 lg:backdrop-blur-xl">
      {/* Gradient border effect */}
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-cyan-500/50" />

      {/* Logo Section */}
      <div className="flex h-16 items-center gap-2 border-b border-cyan-500/20 px-6 relative">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          L
        </div>
        <span className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Live AI Photo
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <DarkSidebarNav />
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/20 p-4">
        <p className="text-xs text-gray-500 text-center">
          Live AI Photo v1.0
        </p>
      </div>
    </aside>
  )
}

// Dark Mobile Sidebar Component
function DarkMobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10"
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 p-0 bg-gray-950/95 backdrop-blur-xl border-r border-cyan-500/20"
      >
        <SheetHeader className="border-b border-cyan-500/20 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              L
            </div>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Live AI Photo
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4">
          <DarkSidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Dark Header Component
function DarkHeader({
  user,
  notifications = 0,
}: {
  user?: DarkViewProps["user"]
  notifications?: number
}) {
  const defaultUser = {
    name: "Jan Kowalski",
    email: "jan@example.com",
    initials: "JK",
  }

  const currentUser = { ...defaultUser, ...user }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-cyan-500/20 bg-gray-950/80 backdrop-blur-xl px-4 lg:px-6">
      {/* Subtle glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Left side - Mobile menu + breadcrumb area */}
      <div className="flex items-center gap-4">
        <DarkMobileSidebar />
        <div className="hidden sm:block">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
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
          className="relative text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
          aria-label="Powiadomienia"
        >
          <Bell className="size-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-[10px] font-medium text-white shadow-[0_0_10px_rgba(168,85,247,0.6)]">
              {notifications > 9 ? "9+" : notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 text-gray-400 hover:text-white hover:bg-cyan-500/10 transition-all duration-300"
            >
              <Avatar size="sm" className="ring-2 ring-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                {currentUser.image && (
                  <AvatarImage src={currentUser.image} alt={currentUser.name} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-cyan-400">
                  {currentUser.initials || currentUser.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">
                {currentUser.name}
              </span>
              <ChevronDown className="hidden md:block size-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-gray-900/95 backdrop-blur-xl border-cyan-500/20 text-gray-300"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-cyan-500/20" />
            {currentUser.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-violet-400 focus:text-violet-400 focus:bg-violet-500/10"
                >
                  <Shield className="size-4" />
                  <span>Panel admina</span>
                </Link>
              </DropdownMenuItem>
            )}
            {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
              <DropdownMenuItem asChild>
                <Link
                  href="/designer"
                  className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-emerald-400 focus:text-emerald-400 focus:bg-emerald-500/10"
                >
                  <Palette className="size-4" />
                  <span>Panel grafika</span>
                </Link>
              </DropdownMenuItem>
            )}
            {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
              <DropdownMenuSeparator className="bg-cyan-500/20" />
            )}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:bg-red-500/10"
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

// Main DarkView Component
export function DarkView({
  children,
  user,
  notifications,
}: DarkViewProps) {
  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top-left cyan glow */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px]" />
        {/* Bottom-right purple glow */}
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px]" />
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Desktop Sidebar */}
      <DarkDesktopSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-64 relative z-10">
        {/* Header */}
        <DarkHeader user={user} notifications={notifications} />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// Export additional components for flexibility
export { DarkSidebarNav, DarkDesktopSidebar, DarkMobileSidebar, DarkHeader }
export type { DarkViewProps }
