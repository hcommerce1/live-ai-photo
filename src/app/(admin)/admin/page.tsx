import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Panel Admina - LIVE AI PHOTO",
  description: "Panel administracyjny LIVE AI PHOTO",
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  ListTodo,
  ShoppingCart,
  AlertCircle,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Get statistics
  const [
    designersCount,
    companiesCount,
    pendingTasks,
    inProgressTasks,
    completedTasksToday,
    complaintTasks,
    activeOrders,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "DESIGNER" } }),
    prisma.company.count({ where: { isActive: true } }),
    prisma.task.count({ where: { status: { in: ["PENDING", "ASSIGNED"] } } }),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.task.count({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.task.count({ where: { status: "COMPLAINT" } }),
    prisma.order.count({
      where: { status: { in: ["PENDING_INPUT", "GENERATING", "IN_PROGRESS"] } },
    }),
  ]);

  const stats = [
    {
      label: "Graficy",
      value: designersCount,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/designers",
    },
    {
      label: "Klienci",
      value: companiesCount,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/admin/companies",
    },
    {
      label: "Oczekujące taski",
      value: pendingTasks,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      href: "/admin/tasks?status=pending",
    },
    {
      label: "W realizacji",
      value: inProgressTasks,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/admin/tasks?status=in_progress",
    },
    {
      label: "Ukończone dziś",
      value: completedTasksToday,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/admin/tasks?status=completed",
    },
    {
      label: "Reklamacje",
      value: complaintTasks,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      href: "/admin/tasks?status=complaint",
    },
    {
      label: "Aktywne zamówienia",
      value: activeOrders,
      icon: ShoppingCart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      href: "/admin/orders?status=active",
    },
  ];

  // Get recent designers
  const recentDesigners = await prisma.user.findMany({
    where: { role: "DESIGNER" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          assignedTasks: {
            where: { status: { notIn: ["COMPLETED", "COMPLAINT"] } },
          },
        },
      },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel Administratora
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Przegląd systemu i statystyki
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Designers Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Graficy</CardTitle>
            <CardDescription>
              Aktywni graficy i ich obciążenie
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDesigners.length > 0 ? (
              <ul className="space-y-3">
                {recentDesigners.map((designer) => (
                  <li key={designer.id}>
                    <Link
                      href={`/admin/designers/${designer.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {designer.name || "Bez nazwy"}
                        </p>
                        <p className="text-sm text-gray-500">{designer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {designer._count.assignedTasks}
                        </p>
                        <p className="text-xs text-gray-500">aktywnych</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Brak grafików w systemie
              </p>
            )}
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/admin/designers"
                className="text-violet-600 hover:text-violet-700 font-medium text-sm"
              >
                Zobacz wszystkich grafików →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Szybkie akcje</CardTitle>
            <CardDescription>Najczęściej używane funkcje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/designers?action=invite"
              className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/30 transition-colors"
            >
              <Users className="w-5 h-5 text-violet-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Zaproś grafika
                </p>
                <p className="text-sm text-gray-500">
                  Wyślij zaproszenie email
                </p>
              </div>
            </Link>
            <Link
              href="/admin/companies?action=add"
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 transition-colors"
            >
              <Building2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Dodaj klienta
                </p>
                <p className="text-sm text-gray-500">
                  Zarejestruj nowego klienta
                </p>
              </div>
            </Link>
            <Link
              href="/admin/calendar"
              className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Kalendarz grafików
                </p>
                <p className="text-sm text-gray-500">
                  Zobacz dostępność zespołu
                </p>
              </div>
            </Link>
            <Link
              href="/admin/settings/pricing"
              className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Ustawienia cen
                </p>
                <p className="text-sm text-gray-500">
                  Pakiety i abonamenty
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
