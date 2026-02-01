import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ListTodo,
  Building2,
} from "lucide-react";

export default async function DesignerDashboard() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get designer's task statistics
  const [pendingTasks, inProgressTasks, completedTasks, complaintTasks] =
    await Promise.all([
      prisma.task.count({
        where: {
          assignedToId: session.user.id,
          status: { in: ["PENDING", "ASSIGNED"] },
        },
      }),
      prisma.task.count({
        where: {
          assignedToId: session.user.id,
          status: "IN_PROGRESS",
        },
      }),
      prisma.task.count({
        where: {
          assignedToId: session.user.id,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.task.count({
        where: {
          assignedToId: session.user.id,
          status: "COMPLAINT",
        },
      }),
    ]);

  // Get companies with assigned tasks
  const companiesWithTasks = await prisma.company.findMany({
    where: {
      users: {
        some: {
          orders: {
            some: {
              tasks: {
                some: {
                  assignedToId: session.user.id,
                },
              },
            },
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          users: {
            where: {
              orders: {
                some: {
                  tasks: {
                    some: {
                      assignedToId: session.user.id,
                      status: { notIn: ["COMPLETED", "COMPLAINT"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: 5,
  });

  const stats = [
    {
      label: "Do zrobienia",
      value: pendingTasks,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "W trakcie",
      value: inProgressTasks,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Ukończone dziś",
      value: completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Reklamacje",
      value: complaintTasks,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cześć, {session.user.name || "Grafiku"}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Oto podsumowanie Twoich zadań na dziś
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Confirmations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Oczekujące na potwierdzenie
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Masz 5 minut na potwierdzenie nowych zleceń
          </p>
          <Link
            href="/designer/pending"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Zobacz oczekujące
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Companies */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Firmy z zadaniami
          </h2>
          {companiesWithTasks.length > 0 ? (
            <ul className="space-y-3">
              {companiesWithTasks.map((company) => (
                <li key={company.id}>
                  <Link
                    href={`/designer/companies/${company.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {company.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {company._count.users} aktywnych
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Brak przypisanych firm
            </p>
          )}
        </div>
      </div>

      {/* Calendar Link */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Twoja dostępność</h2>
        <p className="text-emerald-100 mb-4">
          Ustaw godziny pracy, żeby otrzymywać nowe zlecenia
        </p>
        <Link
          href="/designer/calendar"
          className="inline-flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
        >
          Otwórz kalendarz
        </Link>
      </div>
    </div>
  );
}
