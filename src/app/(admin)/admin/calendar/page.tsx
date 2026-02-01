"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Users, Loader2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Designer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  availability: Availability[];
}

export default function CalendarPage() {
  const { data, isLoading } = useSWR<{ designers: Designer[] }>(
    "/api/admin/calendar",
    fetcher,
    { refreshInterval: 60000 } // Auto-refresh every 1 minute
  );

  // Generate dates for the next 14 days
  const getNext14Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = getNext14Days();
  const designers = data?.designers || [];

  // Create a color map for designers
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-red-500",
    "bg-indigo-500",
  ];

  const designerColors = designers.reduce(
    (acc, designer, index) => {
      acc[designer.id] = colors[index % colors.length];
      return acc;
    },
    {} as Record<string, string>
  );

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kalendarz grafików
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Przegląd dostępności zespołu na najbliższe 2 tygodnie (auto-odświeżanie co minutę)
        </p>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Graficy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {designers.map((designer) => (
              <div key={designer.id} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${designerColors[designer.id]}`}
                />
                <span className="text-sm">
                  {designer.name || designer.email}
                </span>
              </div>
            ))}
            {designers.length === 0 && (
              <p className="text-gray-500 text-sm">Brak grafików w systemie</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Harmonogram
          </CardTitle>
          <CardDescription>
            Kolorowe bloki pokazują dostępność grafików
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Days Header */}
              <div className="grid grid-cols-14 gap-1 mb-2">
                {days.map((day, index) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={index}
                      className={`text-center p-2 rounded-lg ${
                        isToday
                          ? "bg-violet-100 text-violet-700 font-semibold"
                          : "bg-gray-50"
                      }`}
                    >
                      <p className="text-xs font-medium">
                        {day.toLocaleDateString("pl-PL", { weekday: "short" })}
                      </p>
                      <p className="text-lg font-bold">{day.getDate()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Designers Rows */}
              {designers.map((designer) => (
                <div
                  key={designer.id}
                  className="grid grid-cols-14 gap-1 mb-1"
                >
                  {days.map((day, dayIndex) => {
                    // Get ALL availability slots for this day
                    const daySlots = designer.availability.filter((a) =>
                      isSameDay(new Date(a.date), day)
                    );
                    const hasSlots = daySlots.length > 0;

                    return (
                      <div
                        key={dayIndex}
                        className={`min-h-[48px] rounded-lg p-1 ${
                          hasSlots
                            ? designerColors[designer.id]
                            : "bg-gray-100"
                        }`}
                      >
                        {hasSlots && (
                          <div className="text-white text-[10px] font-medium space-y-0.5">
                            {daySlots.map((slot, slotIndex) => (
                              <div key={slotIndex} className="bg-black/20 rounded px-1">
                                {slot.startTime}-{slot.endTime}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {designers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Brak grafików do wyświetlenia
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {days.slice(0, 7).map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const availableDesigners = designers.filter((d) =>
            d.availability.some(
              (a) => isSameDay(new Date(a.date), day) && a.isAvailable
            )
          );

          // Count total hours available
          const totalSlots = designers.reduce((total, d) => {
            const daySlots = d.availability.filter(
              (a) => isSameDay(new Date(a.date), day)
            );
            return total + daySlots.length;
          }, 0);

          return (
            <Card
              key={index}
              className={isToday ? "border-violet-500 border-2" : ""}
            >
              <CardHeader className="pb-2">
                <CardDescription>
                  {day.toLocaleDateString("pl-PL", { weekday: "long" })}
                </CardDescription>
                <CardTitle className="text-xl">
                  {day.toLocaleDateString("pl-PL", {
                    day: "numeric",
                    month: "short",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span
                      className={`font-semibold ${
                        availableDesigners.length > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {availableDesigners.length}
                    </span>
                    <span className="text-sm text-gray-500">grafików</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-blue-600">
                      {totalSlots}
                    </span>
                    <span className="text-sm text-gray-500">okien</span>
                  </div>
                </div>
                {availableDesigners.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {availableDesigners.map((d) => (
                      <div
                        key={d.id}
                        className={`w-3 h-3 rounded-full ${designerColors[d.id]}`}
                        title={d.name || d.email}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
