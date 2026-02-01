"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ListTodo,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Task {
  id: string;
  status: string;
  createdAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  order: {
    id: string;
    quantity: number;
    priority: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      company: {
        id: string;
        name: string;
      } | null;
    };
  };
  designer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

const statusOptions = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "PENDING", label: "Oczekujące" },
  { value: "ASSIGNED", label: "Przypisane" },
  { value: "IN_PROGRESS", label: "W trakcie" },
  { value: "QA_PENDING", label: "Do QA" },
  { value: "COMPLETED", label: "Ukończone" },
  { value: "COMPLAINT", label: "Reklamacje" },
];

const priorityOptions = [
  { value: "all", label: "Wszystkie priorytety" },
  { value: "URGENT", label: "Pilne" },
  { value: "EXPRESS", label: "Express" },
  { value: "NORMAL", label: "Normalne" },
];

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (priorityFilter !== "all") queryParams.set("priority", priorityFilter);

  const { data, error, isLoading } = useSWR<{ tasks: Task[]; stats: any }>(
    `/api/admin/tasks?${queryParams.toString()}`,
    fetcher
  );

  const filteredTasks = data?.tasks?.filter(
    (t) =>
      t.order.user.email.toLowerCase().includes(search.toLowerCase()) ||
      t.order.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.order.user.company?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.designer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.designer?.email.toLowerCase().includes(search.toLowerCase()) ||
      t.order.id.includes(search)
  );

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; className: string }
    > = {
      PENDING: {
        label: "Oczekujące",
        className: "bg-gray-100 text-gray-700",
      },
      ASSIGNED: {
        label: "Przypisane",
        className: "bg-blue-100 text-blue-700",
      },
      IN_PROGRESS: {
        label: "W trakcie",
        className: "bg-yellow-100 text-yellow-700",
      },
      QA_PENDING: {
        label: "Do QA",
        className: "bg-purple-100 text-purple-700",
      },
      QA_FAILED: {
        label: "QA nieudane",
        className: "bg-orange-100 text-orange-700",
      },
      COMPLETED: {
        label: "Ukończone",
        className: "bg-green-100 text-green-700",
      },
      COMPLAINT: {
        label: "Reklamacja",
        className: "bg-red-100 text-red-700",
      },
    };
    const c = config[status] || { label: status, className: "" };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; className: string }> = {
      URGENT: { label: "PILNE", className: "bg-red-500 text-white" },
      EXPRESS: { label: "EXPRESS", className: "bg-orange-500 text-white" },
      NORMAL: { label: "Normal", className: "bg-gray-200 text-gray-700" },
    };
    const c = config[priority] || { label: priority, className: "" };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Wszystkie zadania
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Przeglądaj i zarządzaj zadaniami
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {data?.stats && (
          <>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">Oczekujące</CardDescription>
                <CardTitle className="text-xl">{data.stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">Przypisane</CardDescription>
                <CardTitle className="text-xl text-blue-600">
                  {data.stats.assigned}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">W trakcie</CardDescription>
                <CardTitle className="text-xl text-yellow-600">
                  {data.stats.inProgress}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">Do QA</CardDescription>
                <CardTitle className="text-xl text-purple-600">
                  {data.stats.qaPending}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">Ukończone</CardDescription>
                <CardTitle className="text-xl text-green-600">
                  {data.stats.completed}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">Reklamacje</CardDescription>
                <CardTitle className="text-xl text-red-600">
                  {data.stats.complaint}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4">
                <CardDescription className="text-xs">Łącznie</CardDescription>
                <CardTitle className="text-xl">{data.stats.total}</CardTitle>
              </CardHeader>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Szukaj..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priorytet" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Błąd ładowania danych</p>
          </CardContent>
        </Card>
      ) : filteredTasks?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak zadań</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Zamówienie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Klient / Firma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Grafik
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priorytet
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTasks?.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${task.order.id}`}
                          className="font-medium text-violet-600 hover:underline"
                        >
                          #{task.order.id.slice(-6)}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {task.order.quantity} grafik
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {task.order.user.company ? (
                            <>
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">
                                  {task.order.user.company.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {task.order.user.email}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">
                                  {task.order.user.name || "Klient"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {task.order.user.email}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {task.designer ? (
                          <Link
                            href={`/admin/designers/${task.designer.id}`}
                            className="hover:underline"
                          >
                            <p className="font-medium">
                              {task.designer.name || "Grafik"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {task.designer.email}
                            </p>
                          </Link>
                        ) : (
                          <span className="text-gray-400 italic">
                            Nieprzypisane
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(task.order.priority)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString("pl-PL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
