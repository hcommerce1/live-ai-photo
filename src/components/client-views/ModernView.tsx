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
  X,
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

interface ModernViewProps {
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

// Top Navigation Bar Component
function TopNavigation({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("hidden lg:flex items-center gap-1", className)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
              "hover:bg-white/80 hover:shadow-md",
              isActive
                ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Mobile Navigation Menu
function MobileNavigation({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed inset-x-4 top-20 z-50 lg:hidden",
          "bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100",
          "transform transition-all duration-300 ease-out",
          open
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-4">
          <nav className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    "hover:bg-gray-50",
                    isActive
                      ? "bg-gradient-to-r from-violet-50 to-purple-50 text-gray-900"
                      : "text-gray-600"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      isActive
                        ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="flex-1">{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}

// Modern Header Component
function ModernHeader({
  user,
  notifications = 0,
}: {
  user?: ModernViewProps["user"]
  notifications?: number
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const defaultUser = {
    name: "Jan Kowalski",
    email: "jan@example.com",
    initials: "JK",
  }

  const currentUser = { ...defaultUser, ...user }

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Gradient background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-white/90 backdrop-blur-xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Left side - Logo */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold shadow-lg shadow-violet-200 transition-transform duration-300 group-hover:scale-105">
                  L
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Live AI Photo
                </span>
              </Link>

              {/* Desktop Navigation */}
              <TopNavigation />
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="Powiadomienia"
              >
                <Bell className="size-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-medium text-white shadow-lg shadow-red-200">
                    {notifications > 9 ? "9+" : notifications}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 transition-all duration-200"
                  >
                    <Avatar className="size-9 ring-2 ring-white shadow-md">
                      {currentUser.image && (
                        <AvatarImage src={currentUser.image} alt={currentUser.name} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                        {currentUser.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="hidden md:block size-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-xl border-gray-100">
                  <DropdownMenuLabel className="rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 ring-2 ring-white shadow-md">
                        {currentUser.image && (
                          <AvatarImage src={currentUser.image} alt={currentUser.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-medium">
                          {currentUser.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500">{currentUser.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  {currentUser.role === "ADMIN" && (
                    <DropdownMenuItem asChild className="rounded-xl py-2.5 px-3 cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100">
                          <Shield className="size-4 text-violet-600" />
                        </div>
                        <span>Panel admina</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
                    <DropdownMenuItem asChild className="rounded-xl py-2.5 px-3 cursor-pointer">
                      <Link href="/designer" className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100">
                          <Palette className="size-4 text-emerald-600" />
                        </div>
                        <span>Panel grafika</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
                    <DropdownMenuSeparator className="my-2" />
                  )}
                  <DropdownMenuItem
                    className="rounded-xl py-2.5 px-3 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-red-50">
                        <LogOut className="size-4 text-red-600" />
                      </div>
                      <span className="text-red-600">Wyloguj się</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-gray-100 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="size-5 text-gray-600" />
                ) : (
                  <Menu className="size-5 text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}

// Main ModernView Component
export function ModernView({
  children,
  user,
  notifications,
}: ModernViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30">
      {/* Header */}
      <ModernHeader user={user} notifications={notifications} />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Content wrapper with subtle card effect */}
        <div className="relative">
          {/* Decorative gradient orbs */}
          <div className="absolute -top-20 -right-20 size-96 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 opacity-50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-96 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 opacity-30 blur-3xl pointer-events-none" />

          {/* Actual content */}
          <div className="relative">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 text-center">
            Live AI Photo v1.0
          </p>
        </div>
      </footer>
    </div>
  )
}

// Export additional components for flexibility
export { TopNavigation, MobileNavigation, ModernHeader }
export type { ModernViewProps }
