"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Clock, CheckCircle, AlertCircle, RefreshCw, Building2, User } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Order {
  id: string;
  status: string;
  quantity: number;
  priority: string;
  priceInCents: number | null;
  usedFreeCredit: boolean;
  instructions: string;
  style: string | null;
  platform: string | null;
  createdAt: string;
  originalImages: Array<{ id: string; url: string }>;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
  tasks: Array<{
    id: string;
    status: string;
    designer: { id: string; name: string | null; email: string } | null;
  }>;
}

interface OrdersResponse {
  orders: Order[];
  hasCompany: boolean;
  companyName: string | null;
}

const statusLabels: Record<string, string> = {
  PENDING_INPUT: "Oczekuje",
  PROMPT_BUILDING: "Przetwarzanie",
  GENERATING: "Generowanie",
  PENDING_REVIEW: "Do przeglądu",
  IN_PROGRESS: "W realizacji",
  QA_REVIEW: "Kontrola jakości",
  REVISION: "Poprawki",
  COMPLETED: "Zakończone",
  CANCELLED: "Anulowane",
};

const statusColors: Record<string, string> = {
  PENDING_INPUT: "bg-yellow-100 text-yellow-800",
  PROMPT_BUILDING: "bg-blue-100 text-blue-800",
  GENERATING: "bg-purple-100 text-purple-800",
  PENDING_REVIEW: "bg-orange-100 text-orange-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  QA_REVIEW: "bg-indigo-100 text-indigo-800",
  REVISION: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const priorityLabels: Record<string, string> = {
  NORMAL: "Normalny",
  EXPRESS: "Express",
  URGENT: "Pilny",
};

const priorityColors: Record<string, string> = {
  NORMAL: "bg-gray-100 text-gray-800",
  EXPRESS: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<"all" | "mine">("all");

  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    `/api/orders?filter=${filter}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const orders = data?.orders || [];
  const hasCompany = data?.hasCompany || false;
  const companyName = data?.companyName;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-500">Nie udało się załadować zamówień</p>
          <Button onClick={() => mutate()} className="mt-4">
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {hasCompany && filter === "all" ? "Zamówienia firmy" : "Moje zamówienia"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {hasCompany && filter === "all"
              ? `Wszystkie zamówienia ${companyName}`
              : "Historia i status Twoich zamówień"}
          </p>
        </div>
        <div className="flex gap-2">
          {hasCompany && (
            <div className="flex rounded-lg border overflow-hidden">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className="rounded-none"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Firma
              </Button>
              <Button
                variant={filter === "mine" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("mine")}
                className="rounded-none"
              >
                <User className="w-4 h-4 mr-2" />
                Moje
              </Button>
            </div>
          )}
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Odśwież
          </Button>
          <Button asChild>
            <Link href="/new-order">Nowe zamówienie</Link>
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Brak zamówień</CardTitle>
            <CardDescription>
              Nie masz jeszcze żadnych zamówień. Utwórz pierwsze zamówienie,
              aby rozpocząć.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <Button asChild>
                <Link href="/new-order">Utwórz pierwsze zamówienie</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {order.originalImages[0] ? (
                        <img
                          src={order.originalImages[0].url}
                          alt="Order preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 m-4 text-gray-400" />
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          Zamówienie #{order.id.slice(-6).toUpperCase()}
                        </h3>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                        <Badge className={priorityColors[order.priority]}>
                          {priorityLabels[order.priority]}
                        </Badge>
                        {order.usedFreeCredit && (
                          <Badge className="bg-green-100 text-green-800">
                            Darmowa grafika
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} grafik • {order.style || "Brak stylu"} •{" "}
                        {order.platform || "Brak platformy"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString("pl-PL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Created by (for company view) */}
                      {hasCompany && filter === "all" && order.user && (
                        <p className="text-xs text-violet-600 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Utworzył: {order.user.name || order.user.email}
                        </p>
                      )}

                      {/* Task status */}
                      {order.tasks[0]?.designer && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Przypisane do: {order.tasks[0].designer.name || order.tasks[0].designer.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {order.usedFreeCredit
                        ? "0 PLN"
                        : order.priceInCents
                        ? `${(order.priceInCents / 100).toFixed(2)} PLN`
                        : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.originalImages.length} zdjęć
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
