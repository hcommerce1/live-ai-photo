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
  ShoppingCart,
  Search,
  Loader2,
  AlertCircle,
  User,
  Building2,
  CreditCard,
  Gift,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Order {
  id: string;
  quantity: number;
  priority: string;
  status: string;
  totalPrice: number;
  creditsUsed: number;
  sourceType: string;
  createdAt: string;
  paidAt: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    company: {
      id: string;
      name: string;
    } | null;
  };
  tasks: {
    id: string;
    status: string;
  }[];
}

const statusOptions = [
  { value: "all", label: "Wszystkie statusy" },
  { value: "PENDING_PAYMENT", label: "Oczekuje na płatność" },
  { value: "PAID", label: "Opłacone" },
  { value: "IN_PROGRESS", label: "W realizacji" },
  { value: "COMPLETED", label: "Ukończone" },
  { value: "CANCELLED", label: "Anulowane" },
];

const priorityOptions = [
  { value: "all", label: "Wszystkie priorytety" },
  { value: "URGENT", label: "Pilne" },
  { value: "EXPRESS", label: "Express" },
  { value: "NORMAL", label: "Normalne" },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (priorityFilter !== "all") queryParams.set("priority", priorityFilter);

  const { data, error, isLoading } = useSWR<{ orders: Order[] }>(
    `/api/admin/orders?${queryParams.toString()}`,
    fetcher
  );

  const filteredOrders = data?.orders?.filter(
    (o) =>
      o.user.email.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.user.company?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search)
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price / 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Zamówienia
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Przeglądaj wszystkie zamówienia klientów
        </p>
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
          <SelectTrigger className="w-[200px]">
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

      {/* Orders List */}
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
      ) : filteredOrders?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak zamówień</p>
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
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Klient / Firma
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ilość
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cena
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders?.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-violet-600 hover:underline"
                        >
                          #{order.id.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.user.company ? (
                            <>
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">
                                  {order.user.company.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.user.email}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <p className="font-medium">
                                  {order.user.name || "Klient"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.user.email}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{order.quantity}</span>
                        <span className="text-gray-500 text-sm"> grafik</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {order.creditsUsed > 0 ? (
                            <>
                              <Gift className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                {order.creditsUsed} kredyt
                              </span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span>{formatPrice(order.totalPrice)}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(order.priority)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            Szczegóły
                          </Button>
                        </Link>
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
