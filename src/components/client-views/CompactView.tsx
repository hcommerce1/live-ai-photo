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
  PanelLeftClose,
  PanelLeft,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

interface CompactViewProps {
  children: React.ReactNode
  user?: {
    name?: string
    email?: string
    image?: string
    initials?: string
    role?: string
  }
  notifications?: number
  defaultCollapsed?: boolean
  featureFlags?: FeatureFlags
}

// Compact Sidebar Context
const CompactSidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  collapsed: true,
  setCollapsed: () => {},
})

// Hook to use sidebar state
function useCompactSidebar() {
  return React.useContext(CompactSidebarContext)
}

// Compact Sidebar Navigation Component
function CompactSidebarNav({
  className,
  collapsed,
}: {
  className?: string
  collapsed: boolean
}) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className={cn("flex flex-col gap-0.5", className)}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md text-xs font-medium transition-colors",
                "hover:bg-gray-100 hover:text-gray-900",
                collapsed ? "px-2 py-1.5 justify-center" : "px-2 py-1.5",
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <span className="flex-1 truncate">{item.title}</span>
              )}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    {linkContent}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  <p>{item.title}</p>
                </TooltipContent>
              </Tooltip>
            )
          }

          return linkContent
        })}
      </nav>
    </TooltipProvider>
  )
}

// Desktop Compact Sidebar Component
function DesktopCompactSidebar() {
  const { collapsed, setCollapsed } = useCompactSidebar()

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:border-r lg:border-gray-200 lg:bg-white transition-all duration-200",
        collapsed ? "lg:w-12" : "lg:w-48"
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex h-10 items-center border-b border-gray-200 transition-all duration-200",
          collapsed ? "justify-center px-2" : "gap-2 px-3"
        )}
      >
        <div className="flex size-6 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold shrink-0">
          L
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-gray-900 truncate">
            Live AI Photo
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-1.5 py-2">
        <CompactSidebarNav collapsed={collapsed} />
      </div>

      {/* Toggle Button */}
      <div className="border-t border-gray-200 p-1.5">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
                className={cn(
                  "w-full h-7 text-xs",
                  collapsed ? "px-0" : "justify-start px-2"
                )}
              >
                {collapsed ? (
                  <PanelLeft className="size-4" />
                ) : (
                  <>
                    <PanelLeftClose className="size-4 mr-2" />
                    <span>Zwiń</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                <p>Rozwiń menu</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}

// Mobile Compact Sidebar Component
function MobileCompactSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden h-7 w-7 p-0"
          aria-label="Toggle menu"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-48 p-0">
        <SheetHeader className="border-b border-gray-200 px-3 py-2">
          <SheetTitle className="flex items-center gap-2 text-sm">
            <div className="flex size-6 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold">
              L
            </div>
            <span>Live AI Photo</span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-1.5 py-2">
          <CompactSidebarNav collapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Compact Header Component
function CompactHeader({
  user,
  notifications = 0,
}: {
  user?: CompactViewProps["user"]
  notifications?: number
}) {
  const defaultUser = {
    name: "Jan Kowalski",
    email: "jan@example.com",
    initials: "JK",
  }

  const currentUser = { ...defaultUser, ...user }

  return (
    <header className="sticky top-0 z-40 flex h-10 items-center justify-between border-b border-gray-200 bg-white px-2 lg:px-3">
      {/* Left side - Mobile menu + breadcrumb area */}
      <div className="flex items-center gap-2">
        <MobileCompactSidebar />
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-gray-900">
            Panel klienta
          </h1>
        </div>
      </div>

      {/* Right side - Notifications + User menu */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="relative h-7 w-7 p-0"
          aria-label="Powiadomienia"
        >
          <Bell className="size-4 text-gray-600" />
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-medium text-white">
              {notifications > 9 ? "9+" : notifications}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 px-1.5 h-7 hover:bg-gray-100"
            >
              <Avatar className="size-5">
                {currentUser.image && (
                  <AvatarImage src={currentUser.image} alt={currentUser.name} />
                )}
                <AvatarFallback className="bg-gray-200 text-gray-700 text-[10px]">
                  {currentUser.initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-xs font-medium text-gray-700 max-w-20 truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="hidden md:block size-3 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="py-1.5">
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-medium">{currentUser.name}</p>
                <p className="text-[10px] text-gray-500">{currentUser.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currentUser.role === "ADMIN" && (
              <DropdownMenuItem asChild className="text-xs py-1.5">
                <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="size-3.5" />
                  <span>Panel admina</span>
                </Link>
              </DropdownMenuItem>
            )}
            {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
              <DropdownMenuItem asChild className="text-xs py-1.5">
                <Link href="/designer" className="flex items-center gap-2 cursor-pointer">
                  <Palette className="size-3.5" />
                  <span>Panel grafika</span>
                </Link>
              </DropdownMenuItem>
            )}
            {(currentUser.role === "ADMIN" || currentUser.role === "DESIGNER") && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-xs py-1.5 text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-3.5" />
              <span>Wyloguj się</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Main CompactView Component
export function CompactView({
  children,
  user,
  notifications,
  defaultCollapsed = true,
}: CompactViewProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <CompactSidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <DesktopCompactSidebar />

        {/* Main Content Area */}
        <div
          className={cn(
            "transition-all duration-200",
            collapsed ? "lg:pl-12" : "lg:pl-48"
          )}
        >
          {/* Header */}
          <CompactHeader user={user} notifications={notifications} />

          {/* Page Content - data-dense with small paddings */}
          <main className="p-2 lg:p-3">
            {children}
          </main>
        </div>
      </div>
    </CompactSidebarContext.Provider>
  )
}

// Export additional components for flexibility
export {
  CompactSidebarNav,
  DesktopCompactSidebar,
  MobileCompactSidebar,
  CompactHeader,
  useCompactSidebar,
}
export type { CompactViewProps }
