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
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  ShoppingCart,
  CreditCard,
  Calendar,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: Props) {
  const session = await auth();
  const { id } = await params;

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  // Get orders for this company
  const orders = await prisma.order.findMany({
    where: {
      user: { companyId: id },
    },
    include: {
      user: true,
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Calculate stats
  const totalSpent = orders.reduce((acc, o) => acc + (o.priceInCents || 0), 0);
  const activeOrders = orders.filter((o) =>
    ["PENDING_INPUT", "GENERATING", "IN_PROGRESS", "QA_REVIEW"].includes(
      o.status
    )
  ).length;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      PENDING_INPUT: { label: "Oczekuje", variant: "secondary" },
      GENERATING: { label: "Generowanie", variant: "default" },
      IN_PROGRESS: { label: "W realizacji", variant: "default" },
      QA_REVIEW: { label: "QA", variant: "default" },
      COMPLETED: { label: "Ukończone", variant: "default" },
      CANCELLED: { label: "Anulowane", variant: "destructive" },
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
        <Link href="/admin/companies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {company.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">NIP: {company.nip}</p>
        </div>
        <Badge
          variant={company.isActive ? "default" : "secondary"}
          className={company.isActive ? "bg-green-100 text-green-700" : ""}
        >
          {company.isActive ? "Aktywna" : "Nieaktywna"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Użytkownicy</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {company.users.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Zamówienia</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {orders.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktywne</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {activeOrders}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Darmowe kredyty</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {company.freeCredits}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Dane firmy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">NIP</p>
              <p className="font-medium">{company.nip}</p>
            </div>
            {company.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <span>
                  {company.address}
                  {company.city && `, ${company.postalCode} ${company.city}`}
                </span>
              </div>
            )}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  Dodano:{" "}
                  {new Date(company.createdAt).toLocaleDateString("pl-PL")}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-1">Łączne wydatki</p>
              <p className="text-2xl font-bold text-violet-600">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Użytkownicy ({company.users.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {company.users.length > 0 ? (
              <div className="space-y-3">
                {company.users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{user.name || "Bez nazwy"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{user._count.orders}</p>
                      <p className="text-xs text-gray-500">zamówień</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Brak użytkowników w tej firmie
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Ostatnie zamówienia
            </CardTitle>
            <Link href={`/admin/orders?company=${company.id}`}>
              <Button variant="outline" size="sm">
                Zobacz wszystkie
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      Zamówienie #{order.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.user.email} • {order.quantity} grafik
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(order.priceInCents || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Brak zamówień dla tej firmy
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
