"use client";

import { useState, useEffect } from "react";
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
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  User,
  Loader2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PendingAssignment {
  id: string;
  taskId: string;
  assignedAt: string;
  status: string;
  task: {
    id: string;
    order: {
      id: string;
      quantity: number;
      priority: string;
      style: string | null;
      user: {
        email: string;
        name: string | null;
        company: {
          name: string;
        } | null;
      };
      originalImages: {
        url: string;
      }[];
    };
  };
}

function CountdownTimer({ expiresAt }: { expiresAt: Date }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expires = expiresAt.getTime();
      const diff = Math.max(0, expires - now);
      setTimeLeft(Math.floor(diff / 1000));
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getColor = () => {
    if (timeLeft <= 60) return "text-red-600";
    if (timeLeft <= 180) return "text-orange-600";
    return "text-emerald-600";
  };

  return (
    <div className={`text-center ${getColor()}`}>
      <p className="text-4xl font-bold font-mono">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
      <p className="text-sm mt-1">pozostało na potwierdzenie</p>
    </div>
  );
}

export default function PendingAssignmentsPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<{
    assignments: PendingAssignment[];
    confirmationTimeout: number;
  }>("/api/designer/pending", fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
  });

  const handleConfirm = async (assignmentId: string) => {
    setProcessingId(assignmentId);
    try {
      await fetch(`/api/designer/assignments/${assignmentId}/confirm`, {
        method: "POST",
      });
      mutate();
    } catch (error) {
      console.error("Failed to confirm:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (assignmentId: string) => {
    setProcessingId(assignmentId);
    try {
      await fetch(`/api/designer/assignments/${assignmentId}/reject`, {
        method: "POST",
      });
      mutate();
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getExpiresAt = (assignedAt: string, timeoutMinutes: number) => {
    const date = new Date(assignedAt);
    date.setMinutes(date.getMinutes() + timeoutMinutes);
    return date;
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "URGENT") {
      return <Badge className="bg-red-500 text-white">PILNE</Badge>;
    }
    if (priority === "EXPRESS") {
      return <Badge className="bg-orange-500 text-white">EXPRESS</Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Oczekujące zlecenia
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Potwierdź lub odrzuć przypisane zlecenia
        </p>
      </div>

      {/* Warning Banner */}
      {data?.assignments && data.assignments.length > 0 && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  Masz {data.assignments.length} zlecenie(a) do potwierdzenia!
                </p>
                <p className="text-sm text-orange-700">
                  Jeśli nie potwierdzisz w ciągu {data.confirmationTimeout} minut,
                  zlecenie zostanie przekazane innemu grafikowi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Assignments */}
      {data?.assignments && data.assignments.length > 0 ? (
        <div className="space-y-6">
          {data.assignments.map((assignment) => {
            const expiresAt = getExpiresAt(
              assignment.assignedAt,
              data.confirmationTimeout
            );
            const isProcessing = processingId === assignment.id;

            return (
              <Card key={assignment.id} className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Task Info */}
                  <div className="lg:col-span-2 p-6">
                    <div className="flex items-start gap-4">
                      {/* Image Preview */}
                      {assignment.task.order.originalImages[0] && (
                        <img
                          src={assignment.task.order.originalImages[0].url}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getPriorityBadge(assignment.task.order.priority)}
                          <span className="text-sm text-gray-500">
                            Zamówienie #{assignment.task.order.id.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-700 mb-2">
                          {assignment.task.order.user.company ? (
                            <>
                              <Building2 className="w-4 h-4" />
                              <span className="font-medium">
                                {assignment.task.order.user.company.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4" />
                              <span className="font-medium">
                                {assignment.task.order.user.name ||
                                  assignment.task.order.user.email}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>
                            {assignment.task.order.quantity} grafik •{" "}
                            {assignment.task.order.style || "Domyślny styl"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timer and Actions */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 flex flex-col items-center justify-center border-l">
                    <CountdownTimer expiresAt={expiresAt} />
                    <div className="flex gap-3 mt-6 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(assignment.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Odrzuć
                          </>
                        )}
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleConfirm(assignment.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Potwierdź
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak oczekujących zleceń</p>
            <p className="text-sm text-gray-500 mt-1">
              Nowe zlecenia pojawią się tutaj automatycznie
            </p>
            <Link href="/designer/tasks">
              <Button variant="outline" className="mt-4">
                Zobacz swoje zadania
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">
                Jak działa potwierdzanie?
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>
                  Masz {data?.confirmationTimeout || 5} minut na potwierdzenie
                  zlecenia
                </li>
                <li>Po potwierdzeniu zadanie pojawi się w "Moje zadania"</li>
                <li>
                  Jeśli odrzucisz lub nie potwierdzisz, zlecenie trafi do innego
                  grafika
                </li>
                <li>
                  Strona odświeża się automatycznie co 10 sekund
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
