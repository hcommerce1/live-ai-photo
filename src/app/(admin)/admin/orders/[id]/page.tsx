"use client";

import { useParams } from "next/navigation";
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
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  Gift,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  Clock,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, error, isLoading } = useSWR(
    `/api/admin/orders/${orderId}`,
    fetcher
  );

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING_PAYMENT: {
        label: "Oczekuje na płatność",
        className: "bg-yellow-100 text-yellow-700",
      },
      PAID: {
        label: "Opłacone",
        className: "bg-blue-100 text-blue-700",
      },
      IN_PROGRESS: {
        label: "W realizacji",
        className: "bg-purple-100 text-purple-700",
      },
      COMPLETED: {
        label: "Ukończone",
        className: "bg-green-100 text-green-700",
      },
      CANCELLED: {
        label: "Anulowane",
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

  const getTaskStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      PENDING: { label: "Oczekujące", className: "bg-gray-100 text-gray-700" },
      ASSIGNED: { label: "Przypisane", className: "bg-blue-100 text-blue-700" },
      IN_PROGRESS: { label: "W trakcie", className: "bg-yellow-100 text-yellow-700" },
      QA_PENDING: { label: "Do QA", className: "bg-purple-100 text-purple-700" },
      COMPLETED: { label: "Ukończone", className: "bg-green-100 text-green-700" },
      COMPLAINT: { label: "Reklamacja", className: "bg-red-100 text-red-700" },
    };
    const c = config[status] || { label: status, className: "" };
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error || !data?.order) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Nie znaleziono zamówienia</p>
          <Link href="/admin/orders" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do listy
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const order = data.order;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Zamówienie #{order.id.slice(-6)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Utworzone {new Date(order.createdAt).toLocaleDateString("pl-PL")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          {getPriorityBadge(order.priority)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Szczegóły zamówienia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ilość grafik</p>
                  <p className="font-medium text-lg">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cena</p>
                  <div className="flex items-center gap-2">
                    {order.creditsUsed > 0 ? (
                      <>
                        <Gift className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-lg text-green-600">
                          {order.creditsUsed} kredyt(ów)
                        </span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-lg">
                          {formatPrice(order.totalPrice)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Źródło zdjęć</p>
                  <div className="flex items-center gap-2">
                    {order.sourceType === "URL" ? (
                      <>
                        <LinkIcon className="w-4 h-4 text-blue-600" />
                        <span>Z linku</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 text-gray-600" />
                        <span>Wgrane pliki</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Data płatności</p>
                  <p className="font-medium">
                    {order.paidAt
                      ? new Date(order.paidAt).toLocaleDateString("pl-PL")
                      : "Nie opłacone"}
                  </p>
                </div>
              </div>

              {order.sourceUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">URL źródłowy</p>
                  <a
                    href={order.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:underline break-all"
                  >
                    {order.sourceUrl}
                  </a>
                </div>
              )}

              {order.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Uwagi</p>
                  <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Zadania ({order.tasks.length})</CardTitle>
              <CardDescription>
                Lista zadań powiązanych z zamówieniem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Brak zadań dla tego zamówienia
                </p>
              ) : (
                <div className="space-y-3">
                  {order.tasks.map((task: any, index: number) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          #{index + 1}
                        </span>
                        <div>
                          <Link
                            href={`/admin/task/${task.id}`}
                            className="font-medium text-violet-600 hover:underline"
                          >
                            Task #{task.id.slice(-6)}
                          </Link>
                          {task.designer && (
                            <p className="text-sm text-gray-500">
                              Grafik: {task.designer.name || task.designer.email}
                            </p>
                          )}
                        </div>
                      </div>
                      {getTaskStatusBadge(task.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {order.images && order.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Zdjęcia źródłowe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {order.images.map((image: any, index: number) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden border"
                    >
                      <img
                        src={image.url}
                        alt={`Zdjęcie ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Klient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {order.user.company ? (
                  <Building2 className="w-10 h-10 p-2 bg-violet-100 text-violet-600 rounded-full" />
                ) : (
                  <User className="w-10 h-10 p-2 bg-gray-100 text-gray-600 rounded-full" />
                )}
                <div>
                  <p className="font-medium">
                    {order.user.company?.name || order.user.name || "Klient"}
                  </p>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                </div>
              </div>

              {order.user.company && (
                <Link href={`/admin/companies/${order.user.company.id}`}>
                  <Button variant="outline" className="w-full">
                    Zobacz firmę
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Historia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Utworzono</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString("pl-PL")}
                    </p>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Opłacono</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.paidAt).toLocaleString("pl-PL")}
                      </p>
                    </div>
                  </div>
                )}
                {order.completedAt && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Ukończono</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.completedAt).toLocaleString("pl-PL")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
