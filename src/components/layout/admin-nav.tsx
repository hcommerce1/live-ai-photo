"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  ListTodo,
  ShoppingCart,
  Settings,
  Calendar,
  CreditCard,
  Monitor,
  Layers,
  FileStack,
} from "lucide-react";

interface AdminNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Graficy",
    href: "/admin/designers",
    icon: Users,
  },
  {
    title: "Klienci",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    title: "Wszystkie zadania",
    href: "/admin/tasks",
    icon: ListTodo,
  },
  {
    title: "Kolejka",
    href: "/admin/queue",
    icon: Layers,
  },
  {
    title: "Zamówienia",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Szablony",
    href: "/admin/templates",
    icon: FileStack,
  },
  {
    title: "Kalendarz",
    href: "/admin/calendar",
    icon: Calendar,
  },
  {
    title: "Widoki klienta",
    href: "/admin/client-views",
    icon: Monitor,
  },
];

const bottomNavItems = [
  {
    title: "Pakiety i ceny",
    href: "/admin/settings/pricing",
    icon: CreditCard,
    exact: true,
  },
  {
    title: "Ustawienia",
    href: "/admin/settings",
    icon: Settings,
    exact: true,
  },
];

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (href === "/admin" || exact) {
      return pathname === href;
    }
    // Exact match or child route (with slash after)
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-lg">Panel Admina</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              isActive(item.href)
                ? "bg-violet-500 text-white"
                : "text-gray-300 hover:bg-gray-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </Link>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-700">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive(item.href, item.exact)
                  ? "bg-violet-500 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="mb-4 px-3">
          <Badge variant="outline" className="text-violet-400 border-violet-400">
            Administrator
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-3 text-white hover:bg-gray-800"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-violet-500">
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/designer">Panel grafika</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Panel klienta</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Wyloguj się
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
