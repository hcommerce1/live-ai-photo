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
  ListTodo,
  Clock,
  Calendar,
} from "lucide-react";

interface DesignerNavProps {
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
    href: "/designer",
    icon: LayoutDashboard,
  },
  {
    title: "Moje zadania",
    href: "/designer/tasks",
    icon: ListTodo,
  },
  {
    title: "Oczekujące",
    href: "/designer/pending",
    icon: Clock,
  },
  {
    title: "Dostępność",
    href: "/designer/calendar",
    icon: Calendar,
  },
];

export function DesignerNav({ user }: DesignerNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/designer") {
      return pathname === "/designer";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link href="/designer" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="font-semibold text-lg">Panel Grafika</span>
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
                ? "bg-emerald-500 text-white"
                : "text-gray-300 hover:bg-gray-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="mb-4 px-3">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400">
            {user.role === "ADMIN" ? "Administrator" : "Grafik"}
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
                <AvatarFallback className="bg-emerald-500">
                  {user.name?.charAt(0).toUpperCase() || "G"}
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
            {user.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link href="/admin">Panel admina</Link>
              </DropdownMenuItem>
            )}
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
