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
  Plus,
  X,
  Sparkles,
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
    gradient: "from-violet-500 to-purple-600",
  },
  {
    title: "Pakiety",
    href: "/dashboard/packages",
    icon: Image,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    title: "Nowe zamówienie",
    href: "/new-order",
    icon: ShoppingCart,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    title: "Zamówienia",
    href: "/orders",
    icon: Heart,
    gradient: "from-red-500 to-pink-600",
  },
]

// FAB actions configuration
const fabActions = [
  {
    title: "Nowe zamówienie",
    icon: Plus,
    href: "/new-order",
    gradient: "from-violet-500 to-purple-600",
  },
]

interface FeatureFlags {
  packagesEnabled: boolean
  expressEnabled: boolean
  urgentEnabled: boolean
}

export interface CreativeViewProps {
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

// Creative Sidebar Navigation Component
function CreativeSidebarNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {navigationItems.map((item, index) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 ease-out",
              "hover:scale-[1.02] hover:shadow-lg",
              isActive
                ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
            )}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-xl transition-all duration-300",
                isActive
                  ? "bg-white/20 backdrop-blur-sm"
                  : `bg-gradient-to-br ${item.gradient} text-white shadow-md group-hover:scale-110`
              )}
            >
              <Icon className="size-5" />
            </div>
            <span className="flex-1 tracking-wide">{item.title}</span>
            {/* Hover glow effect */}
            <div
              className={cn(
                "absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-300",
                `bg-gradient-to-r ${item.gradient}`,
                "group-hover:opacity-30"
              )}
            />
          </Link>
        )
      })}
    </nav>
  )
}

// Creative Desktop Sidebar Component
function CreativeDesktopSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
      {/* Gradient background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-100/80 via-pink-50/60 to-orange-50/80 backdrop-blur-xl" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-violet-200 via-pink-200 to-orange-200" />

      {/* Content */}
      <div className="relative flex flex-col h-full">
        {/* Logo Section with animated gradient */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="relative flex size-12 items-center justify-center">
            <div className="absolute inset-0 animate-spin-slow rounded-2xl bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 opacity-75 blur-md" />
            <div className="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-pink-600 to-orange-600 text-white font-black text-xl shadow-lg">
              L
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Live AI Photo
            </span>
            <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
              Creative Studio
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <CreativeSidebarNav />
        </div>

        {/* Footer with gradient card */}
        <div className="p-4">
          <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-5 animate-pulse" />
              <span className="font-bold">Pro Tip</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Uzyj AI do automatycznej edycji zdjec i oszczedz czas!
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Creative Mobile Sidebar Component
function CreativeMobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden rounded-xl hover:bg-white/60"
          aria-label="Toggle menu"
        >
          <Menu className="size-6 text-gray-700" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-gradient-to-b from-violet-100/95 via-pink-50/95 to-orange-50/95 backdrop-blur-xl border-r-0">
        <SheetHeader className="px-6 py-5">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-pink-600 to-orange-600 text-white font-black shadow-lg">
              L
            </div>
            <span className="text-lg font-black bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Live AI Photo
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4">
          <CreativeSidebarNav />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Creative Header Component
function CreativeHeader({
  user,
  notifications = 0,
}: {
  user?: CreativeViewProps["user"]
  notifications?: number
}) {
  const defaultUser = {
    name: "Jan Kowalski",
    email: "jan@example.com",
    initials: "JK",
  }

  const currentUser = { ...defaultUser, ...user }

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-4 lg:px-8">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-violet-50/50 to-pink-50/50 backdrop-blur-xl border-b border-white/50" />

      {/* Content */}
      <div className="relative flex items-center gap-4 w-full justify-between">
        {/* Left side - Mobile menu + Title */}
        <div className="flex items-center gap-4">
          <CreativeMobileSidebar />
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Panel klienta
            </h1>
            <p className="text-xs font-medium text-gray-500 tracking-wider uppercase">
              Witaj ponownie!
            </p>
          </div>
        </div>

        {/* Right side - Notifications + User menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl hover:bg-white/60 transition-all duration-300 hover:scale-105"
            aria-label="Powiadomienia"
          >
            <Bell className="size-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white animate-bounce shadow-lg">
                {notifications > 9 ? "9+" : notifications}
              </span>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-white/60 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-pink-500 blur-md opacity-50" />
                  <Avatar size="sm" className="relative ring-2 ring-white shadow-lg">
                    {currentUser.image && (
                      <AvatarImage src={currentUser.image} alt={currentUser.name} />
                    )}
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-pink-500 text-white font-bold">
                      {currentUser.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-bold text-gray-800">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-gray-500">Premium</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-bold">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {currentUser.role === "ADMIN" && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2 cursor-pointer rounded-xl">
                    <Shield className="size-4" />
                    <span>Panel admina</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
                <DropdownMenuItem asChild>
                  <Link href="/designer" className="flex items-center gap-2 cursor-pointer rounded-xl">
                    <Palette className="size-4" />
                    <span>Panel grafika</span>
                  </Link>
                </DropdownMenuItem>
              )}
              {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer rounded-xl text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="size-4" />
                <span>Wyloguj się</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

// FAB (Floating Action Button) Component
function CreativeFAB() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {/* FAB Actions */}
      {fabActions.map((action, index) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "flex items-center gap-3 rounded-2xl pl-4 pr-5 py-3 text-white font-bold shadow-lg transition-all duration-300",
              `bg-gradient-to-r ${action.gradient}`,
              "hover:scale-105 hover:shadow-xl",
              isOpen
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : `${(fabActions.length - index) * 30}ms`,
            }}
          >
            <Icon className="size-5" />
            <span className="text-sm whitespace-nowrap">{action.title}</span>
          </Link>
        )
      })}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl shadow-2xl transition-all duration-300",
          "bg-gradient-to-br from-violet-600 via-pink-600 to-orange-600",
          "hover:scale-110 hover:shadow-3xl",
          "focus:outline-none focus:ring-4 focus:ring-violet-300",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Zamknij menu" : "Otworz menu"}
      >
        {isOpen ? (
          <X className="size-7 text-white transition-transform duration-300" />
        ) : (
          <Plus className="size-7 text-white transition-transform duration-300" />
        )}
        {/* Animated glow */}
        <div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-gradient-to-br from-violet-600 via-pink-600 to-orange-600 opacity-50 blur-xl" />
      </button>
    </div>
  )
}

// Main CreativeView Component
export function CreativeView({
  children,
  user,
  notifications,
}: CreativeViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100/50 via-pink-50/30 to-orange-100/50">
      {/* Animated background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 size-80 rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/20 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-40 size-80 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 right-1/3 size-80 rounded-full bg-gradient-to-br from-orange-400/20 to-violet-400/20 blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Desktop Sidebar */}
      <CreativeDesktopSidebar />

      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Header */}
        <CreativeHeader user={user} notifications={notifications} />

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <CreativeFAB />

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(30px, 10px) scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}

// Export additional components for flexibility
export {
  CreativeSidebarNav,
  CreativeDesktopSidebar,
  CreativeMobileSidebar,
  CreativeHeader,
  CreativeFAB,
}
