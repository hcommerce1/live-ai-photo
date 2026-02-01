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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Mail,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Availability {
  date: string;
  startTime: string;
  endTime: string;
}

interface Designer {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  _count: {
    assignedTasks: number;
  };
  stats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  availability: Availability[];
}

export default function DesignersPage() {
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<{ designers: Designer[] }>(
    "/api/admin/designers",
    fetcher,
    { refreshInterval: 60000 } // Auto-refresh every minute
  );

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const next7Days = getNext7Days();

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

  // Check if current time is within a time slot
  const isWithinTimeSlot = (startTime: string, endTime: string) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  // Calculate coverage for each day
  const getCoverageForDay = (day: Date) => {
    if (!data?.designers) return { count: 0, designers: [] as Designer[], currentlyActive: 0 };

    const today = isToday(day);

    // Designers with ANY availability on this day
    const designersWithAvailability = data.designers.filter((d) =>
      d.availability.some((a) => isSameDay(new Date(a.date), day))
    );

    // For today: also count how many are CURRENTLY active (within their time slots)
    let currentlyActive = 0;
    if (today) {
      currentlyActive = data.designers.filter((d) =>
        d.availability.some((a) =>
          isSameDay(new Date(a.date), day) && isWithinTimeSlot(a.startTime, a.endTime)
        )
      ).length;
    }

    return {
      count: designersWithAvailability.length,
      designers: designersWithAvailability,
      currentlyActive: today ? currentlyActive : designersWithAvailability.length
    };
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;

    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: "DESIGNER" }),
      });

      if (res.ok) {
        setInviteSuccess(true);
        setInviteEmail("");
        setTimeout(() => {
          setDialogOpen(false);
          setInviteSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredDesigners = data?.designers?.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Graficy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Zarządzaj zespołem grafików
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Zaproś grafika
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Zaproś nowego grafika</DialogTitle>
              <DialogDescription>
                Wyślij zaproszenie email. Grafik otrzyma link do utworzenia
                konta.
              </DialogDescription>
            </DialogHeader>
            {inviteSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Zaproszenie wysłane!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adres email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="grafik@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={!inviteEmail || inviteLoading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {inviteLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Wyślij zaproszenie
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Szukaj grafików..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Łącznie grafików</CardDescription>
            <CardTitle className="text-3xl">
              {data?.designers?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktywnych dziś</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {data?.designers?.filter((d) => d.stats.inProgress > 0).length ||
                0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Łącznie aktywnych tasków</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {data?.designers?.reduce(
                (acc, d) => acc + d.stats.pending + d.stats.inProgress,
                0
              ) || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 7-Day Coverage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Pokrycie na najbliższe 7 dni
          </CardTitle>
          <CardDescription>
            Liczba dostępnych grafików w każdym dniu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {next7Days.map((day, index) => {
              const coverage = getCoverageForDay(day);
              const todayCheck = isToday(day);
              const activePercent = data?.designers?.length
                ? (coverage.currentlyActive / data.designers.length) * 100
                : 0;

              return (
                <div
                  key={index}
                  className={`text-center p-3 rounded-lg border ${
                    todayCheck
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="text-xs font-medium text-gray-500">
                    {day.toLocaleDateString("pl-PL", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-bold">{day.getDate()}</p>
                  <div className="mt-2">
                    {todayCheck ? (
                      <>
                        <div
                          className={`text-2xl font-bold ${
                            coverage.currentlyActive === 0
                              ? "text-red-500"
                              : coverage.currentlyActive < (data?.designers?.length || 0) / 2
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {coverage.currentlyActive}
                        </div>
                        <p className="text-xs text-gray-500">teraz aktywnych</p>
                        {coverage.count > coverage.currentlyActive && (
                          <p className="text-[10px] text-gray-400">
                            ({coverage.count} zapisanych)
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <div
                          className={`text-2xl font-bold ${
                            coverage.count === 0
                              ? "text-red-500"
                              : coverage.count < (data?.designers?.length || 0) / 2
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {coverage.count}
                        </div>
                        <p className="text-xs text-gray-500">grafików</p>
                      </>
                    )}
                  </div>
                  {/* Coverage bar */}
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        activePercent === 0
                          ? "bg-red-500"
                          : activePercent < 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${activePercent}%` }}
                    />
                  </div>
                  {/* Designer avatars/dots */}
                  {coverage.count > 0 && (
                    <div className="mt-2 flex justify-center gap-0.5 flex-wrap">
                      {coverage.designers.slice(0, 5).map((d) => (
                        <div
                          key={d.id}
                          className="w-2 h-2 rounded-full bg-violet-500"
                          title={d.name || d.email}
                        />
                      ))}
                      {coverage.count > 5 && (
                        <span className="text-xs text-gray-400">
                          +{coverage.count - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Designers List */}
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
      ) : filteredDesigners?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak grafików</p>
            <p className="text-sm text-gray-500 mt-1">
              Zaproś pierwszego grafika do zespołu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDesigners?.map((designer) => (
            <Link key={designer.id} href={`/admin/designers/${designer.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {designer.name || "Bez nazwy"}
                      </CardTitle>
                      <CardDescription>{designer.email}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        designer.stats.inProgress > 0 ? "default" : "secondary"
                      }
                      className={
                        designer.stats.inProgress > 0
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                    >
                      {designer.stats.inProgress > 0 ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-yellow-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {designer.stats.pending}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Oczekujące</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <Loader2 className="w-4 h-4" />
                        <span className="font-semibold">
                          {designer.stats.inProgress}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">W trakcie</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold">
                          {designer.stats.completed}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Ukończone</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
