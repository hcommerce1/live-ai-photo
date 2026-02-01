import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ListTodo,
  Wallet,
} from "lucide-react";
import { DesignerRatesEditor } from "@/components/admin/designer-rates-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DesignerDetailPage({ params }: Props) {
  const session = await auth();
  const { id } = await params;

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [designer, systemSettings] = await Promise.all([
    prisma.user.findUnique({
      where: { id, role: "DESIGNER" },
      include: {
        assignedTasks: {
          include: {
            order: {
              include: {
                user: {
                  include: { company: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        availability: {
          where: {
            date: { gte: new Date() },
          },
          orderBy: { date: "asc" },
          take: 7,
        },
      },
    }),
    prisma.systemSettings.findUnique({
      where: { id: "settings" },
      select: {
        designerRatePerGraphic: true,
        designerRatePerRevision: true,
      },
    }),
  ]);

  if (!designer) {
    notFound();
  }

  const globalRates = {
    perGraphic: systemSettings?.designerRatePerGraphic ?? 2000,
    perRevision: systemSettings?.designerRatePerRevision ?? 500,
  };

  // Calculate stats
  const taskStats = {
    pending: designer.assignedTasks.filter((t) =>
      ["PENDING", "ASSIGNED"].includes(t.status)
    ).length,
    inProgress: designer.assignedTasks.filter((t) => t.status === "IN_PROGRESS")
      .length,
    completed: designer.assignedTasks.filter((t) => t.status === "COMPLETED")
      .length,
    complaint: designer.assignedTasks.filter((t) => t.status === "COMPLAINT")
      .length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      PENDING: { label: "Oczekujące", variant: "secondary" },
      ASSIGNED: { label: "Przypisane", variant: "secondary" },
      IN_PROGRESS: { label: "W trakcie", variant: "default" },
      QA_PENDING: { label: "Do QA", variant: "default" },
      QA_FAILED: { label: "QA nieudane", variant: "destructive" },
      COMPLETED: { label: "Ukończone", variant: "default" },
      COMPLAINT: { label: "Reklamacja", variant: "destructive" },
    };
    const config = statusConfig[status] || {
      label: status,
      variant: "secondary" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/designers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {designer.name || "Bez nazwy"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{designer.email}</p>
        </div>
        <Badge
          variant={taskStats.inProgress > 0 ? "default" : "secondary"}
          className={
            taskStats.inProgress > 0 ? "bg-green-100 text-green-700" : ""
          }
        >
          {taskStats.inProgress > 0 ? "Aktywny" : "Nieaktywny"}
        </Badge>
      </div>

      {/* Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={designer.image || undefined} />
                <AvatarFallback className="bg-violet-500 text-white text-xl">
                  {designer.name?.charAt(0).toUpperCase() || "G"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg">
                  {designer.name || "Bez nazwy"}
                </p>
                <p className="text-sm text-gray-500">{designer.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{designer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Dołączył:{" "}
                  {new Date(designer.createdAt).toLocaleDateString("pl-PL")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Statystyki</CardTitle>
            <CardDescription>Podsumowanie zadań</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {taskStats.pending}
                </p>
                <p className="text-sm text-gray-600">Oczekujące</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ListTodo className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {taskStats.inProgress}
                </p>
                <p className="text-sm text-gray-600">W trakcie</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {taskStats.completed}
                </p>
                <p className="text-sm text-gray-600">Ukończone</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  {taskStats.complaint}
                </p>
                <p className="text-sm text-gray-600">Reklamacje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Stawki wynagrodzenia
          </CardTitle>
          <CardDescription>
            Indywidualne stawki dla tego grafika (nadpisują globalne ustawienia)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DesignerRatesEditor
            designerId={designer.id}
            customRatePerGraphic={designer.customRatePerGraphic}
            customRatePerRevision={designer.customRatePerRevision}
            globalRatePerGraphic={globalRates.perGraphic}
            globalRatePerRevision={globalRates.perRevision}
          />
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dostępność</CardTitle>
              <CardDescription>Nadchodzące dni pracy</CardDescription>
            </div>
            <Link href={`/admin/calendar?designer=${designer.id}`}>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Zobacz kalendarz
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {designer.availability.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {designer.availability.map((avail) => (
                <div
                  key={avail.id}
                  className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <p className="font-medium text-green-700">
                    {new Date(avail.date).toLocaleDateString("pl-PL", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-sm text-green-600">
                    {avail.startTime} - {avail.endTime}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Brak ustawionej dostępności
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie zadania</CardTitle>
          <CardDescription>Historia przypisanych zadań</CardDescription>
        </CardHeader>
        <CardContent>
          {designer.assignedTasks.length > 0 ? (
            <div className="space-y-3">
              {designer.assignedTasks.slice(0, 10).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      Zamówienie #{task.order.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {task.order.user.company?.name || task.order.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString("pl-PL")}
                    </span>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Brak przypisanych zadań
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
