import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Building2,
  User,
} from "lucide-react";

export default async function DesignerTasksPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: session.user.id,
    },
    include: {
      order: {
        include: {
          user: {
            include: {
              company: true,
            },
          },
          originalImages: {
            take: 1,
          },
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  const groupedTasks = {
    pending: tasks.filter((t) => ["PENDING", "ASSIGNED"].includes(t.status)),
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS"),
    qaPending: tasks.filter((t) => ["QA_PENDING", "QA_FAILED"].includes(t.status)),
    completed: tasks.filter((t) => t.status === "COMPLETED"),
    complaint: tasks.filter((t) => t.status === "COMPLAINT"),
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Oczekujące", className: "bg-gray-100 text-gray-700" },
      ASSIGNED: { label: "Przypisane", className: "bg-blue-100 text-blue-700" },
      IN_PROGRESS: { label: "W trakcie", className: "bg-yellow-100 text-yellow-700" },
      QA_PENDING: { label: "Do QA", className: "bg-purple-100 text-purple-700" },
      QA_FAILED: { label: "Poprawki", className: "bg-orange-100 text-orange-700" },
      COMPLETED: { label: "Ukończone", className: "bg-green-100 text-green-700" },
      COMPLAINT: { label: "Reklamacja", className: "bg-red-100 text-red-700" },
    };
    const c = config[status] || { label: status, className: "" };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "URGENT") {
      return <Badge className="bg-red-500 text-white">PILNE</Badge>;
    }
    if (priority === "EXPRESS") {
      return <Badge className="bg-orange-500 text-white">EXPRESS</Badge>;
    }
    return null;
  };

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <Link href={`/designer/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.order.priority)}
              </div>
              <p className="font-medium">
                Zamówienie #{task.order.id.slice(-6)}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                {task.order.user.company ? (
                  <>
                    <Building2 className="w-3 h-3" />
                    <span>{task.order.user.company.name}</span>
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    <span>{task.order.user.email}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {task.order.quantity} grafik • {task.order.style || "Domyślny styl"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {task.order.originalImages[0] && (
                <img
                  src={task.order.originalImages[0].url}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Moje zadania
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Wszystkie przypisane do Ciebie zadania
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="py-3 px-4">
            <CardDescription className="text-xs">Do zrobienia</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {groupedTasks.pending.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardDescription className="text-xs">W trakcie</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">
              {groupedTasks.inProgress.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardDescription className="text-xs">Do QA</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {groupedTasks.qaPending.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardDescription className="text-xs">Ukończone</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {groupedTasks.completed.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4">
            <CardDescription className="text-xs">Reklamacje</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {groupedTasks.complaint.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Task Groups */}
      <div className="space-y-6">
        {/* Pending & In Progress */}
        {(groupedTasks.pending.length > 0 ||
          groupedTasks.inProgress.length > 0) && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Aktywne ({groupedTasks.pending.length + groupedTasks.inProgress.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...groupedTasks.pending, ...groupedTasks.inProgress].map(
                (task) => (
                  <TaskCard key={task.id} task={task} />
                )
              )}
            </div>
          </div>
        )}

        {/* QA Pending */}
        {groupedTasks.qaPending.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              Oczekujące na QA ({groupedTasks.qaPending.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTasks.qaPending.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Complaints */}
        {groupedTasks.complaint.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Reklamacje ({groupedTasks.complaint.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTasks.complaint.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {groupedTasks.completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Ukończone ({groupedTasks.completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedTasks.completed.slice(0, 6).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
            {groupedTasks.completed.length > 6 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                + {groupedTasks.completed.length - 6} więcej ukończonych
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Brak przypisanych zadań</p>
              <p className="text-sm text-gray-500 mt-1">
                Nowe zadania pojawią się tutaj automatycznie
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
