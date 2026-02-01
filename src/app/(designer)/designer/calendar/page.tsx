"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  Calendar,
  Loader2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Cloud,
  CloudOff,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
}

interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function DesignerCalendarPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editedSlots, setEditedSlots] = useState<Record<string, TimeSlot[]>>({});
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, mutate } = useSWR<{
    availability: Availability[];
  }>("/api/designer/availability", fetcher);

  // Generate days for current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  // Initialize edited slots when data loads
  useEffect(() => {
    if (data?.availability && !initialized) {
      const initial: Record<string, TimeSlot[]> = {};

      data.availability.forEach((a) => {
        const dateKey = a.date.split("T")[0];
        if (!initial[dateKey]) {
          initial[dateKey] = [];
        }
        initial[dateKey].push({
          id: a.id,
          startTime: a.startTime,
          endTime: a.endTime,
        });
      });

      setEditedSlots(initial);
      setInitialized(true);
    }
  }, [data, initialized]);

  // Auto-save function
  const saveChanges = useCallback(async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const allSlots: any[] = [];

      weekDays.forEach((day) => {
        const dateKey = day.toISOString().split("T")[0];
        const slots = editedSlots[dateKey] || [];

        if (slots.length === 0) {
          allSlots.push({
            date: dateKey,
            startTime: "00:00",
            endTime: "00:00",
            isAvailable: false,
          });
        } else {
          slots.forEach((slot) => {
            allSlots.push({
              date: dateKey,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true,
            });
          });
        }
      });

      const res = await fetch("/api/designer/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: allSlots }),
      });

      if (res.ok) {
        setSaved(true);
        setHasChanges(false);
        mutate();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save availability:", error);
    } finally {
      setSaving(false);
    }
  }, [editedSlots, weekDays, hasChanges, mutate]);

  // Auto-save with debounce
  useEffect(() => {
    if (hasChanges && initialized) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges();
      }, 1000); // Save after 1 second of no changes
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, saveChanges, initialized]);

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
    setInitialized(false); // Reload data for new week
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
    setInitialized(false); // Reload data for new week
  };

  const addSlot = (dateKey: string) => {
    setEditedSlots((prev) => ({
      ...prev,
      [dateKey]: [
        ...(prev[dateKey] || []),
        { startTime: "09:00", endTime: "17:00" },
      ],
    }));
    setHasChanges(true);
  };

  const removeSlot = (dateKey: string, index: number) => {
    setEditedSlots((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const updateSlot = (
    dateKey: string,
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setEditedSlots((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
    setHasChanges(true);
  };

  const clearDay = (dateKey: string) => {
    setEditedSlots((prev) => ({
      ...prev,
      [dateKey]: [],
    }));
    setHasChanges(true);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Moja dostępność
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Zmiany zapisują się automatycznie
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saving ? (
            <div className="flex items-center gap-2 text-yellow-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Zapisuję...</span>
            </div>
          ) : saved ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Zapisano</span>
            </div>
          ) : hasChanges ? (
            <div className="flex items-center gap-2 text-orange-500">
              <CloudOff className="w-5 h-5" />
              <span className="text-sm">Niezapisane</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Cloud className="w-5 h-5" />
              <span className="text-sm">Zsynchronizowano</span>
            </div>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-lg">
              {currentWeekStart.toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
              })}{" "}
              -{" "}
              {new Date(
                currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dateKey = day.toISOString().split("T")[0];
          const slots = editedSlots[dateKey] || [];
          const past = isPast(day);
          const hasSlots = slots.length > 0;

          return (
            <Card
              key={dateKey}
              className={`${
                isToday(day) ? "border-emerald-500 border-2" : ""
              } ${past ? "opacity-50" : ""}`}
            >
              <CardHeader className="pb-2">
                <CardDescription>
                  {day.toLocaleDateString("pl-PL", { weekday: "long" })}
                </CardDescription>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span>
                    {day.toLocaleDateString("pl-PL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  {hasSlots && !past && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={() => clearDay(dateKey)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!past ? (
                  <>
                    {/* Time Slots */}
                    {slots.map((slot, index) => (
                      <div
                        key={index}
                        className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Okno {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-red-500 hover:text-red-700"
                            onClick={() => removeSlot(dateKey, index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Od</Label>
                            <Input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlot(dateKey, index, "startTime", e.target.value)
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Do</Label>
                            <Input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlot(dateKey, index, "endTime", e.target.value)
                              }
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Slot Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => addSlot(dateKey)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Dodaj okno
                    </Button>

                    {!hasSlots && (
                      <p className="text-xs text-gray-400 text-center">
                        Brak dostępności
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Data minęła
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-900">
                Jak działa dostępność?
              </p>
              <ul className="text-sm text-emerald-700 mt-2 space-y-1 list-disc list-inside">
                <li>Dodaj wiele okien czasowych w jednym dniu (np. 9-12 i 14-18)</li>
                <li>Zmiany zapisują się automatycznie po 1 sekundzie</li>
                <li>System automatycznie przypisuje Ci zlecenia w tych godzinach</li>
                <li>Masz 5 minut na potwierdzenie zlecenia</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
