"use client";

import { useState, useMemo } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  Users,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Trophy,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Company {
  id: string;
  name: string;
  nip: string;
  email: string | null;
  freeCredits: number;
  isActive: boolean;
  createdAt: string;
  lastOrderDate: string | null;
  _count: {
    users: number;
  };
  stats: {
    totalOrders: number;
    activeOrders: number;
    totalSpent: number;
    periodSpent: number;
    periodOrders: number;
  };
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

type SortOption = "newest" | "oldest" | "most_spent" | "least_active" | "most_active";
type PeriodOption = "7" | "30" | "quarter" | "year";

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [period, setPeriod] = useState<PeriodOption>("30");
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    email: "",
  });

  const { data, error, isLoading, mutate } = useSWR<{
    companies: Company[];
    salesData: SalesData[];
    top10: Company[];
  }>(`/api/admin/companies?period=${period}`, fetcher, { refreshInterval: 60000 });

  const handleSubmit = async () => {
    if (!formData.name || !formData.nip) return;

    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormSuccess(true);
        setFormData({ name: "", nip: "", email: "" });
        mutate();
        setTimeout(() => {
          setDialogOpen(false);
          setFormSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to create company:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // Sorted and filtered companies
  const sortedCompanies = useMemo(() => {
    let filtered = data?.companies?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nip.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "most_spent":
        return filtered.sort((a, b) => b.stats.totalSpent - a.stats.totalSpent);
      case "least_active":
        return filtered.sort((a, b) => {
          if (!a.lastOrderDate) return -1;
          if (!b.lastOrderDate) return 1;
          return new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
        });
      case "most_active":
        return filtered.sort((a, b) => {
          if (!a.lastOrderDate) return 1;
          if (!b.lastOrderDate) return -1;
          return new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime();
        });
      default:
        return filtered;
    }
  }, [data?.companies, search, sortBy]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Brak zamówień";
    return new Date(dateStr).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const periodLabel = {
    "7": "7 dni",
    "30": "30 dni",
    "quarter": "Kwartał",
    "year": "Rok",
  };

  // Calculate chart max for scaling
  const maxRevenue = Math.max(...(data?.salesData?.map((d) => d.revenue) || [1]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Klienci
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Zarządzaj klientami i analizuj sprzedaż
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj klienta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj nowego klienta</DialogTitle>
              <DialogDescription>
                Wprowadź dane klienta. Klient otrzyma 1 darmową grafikę na start.
              </DialogDescription>
            </DialogHeader>
            {formSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Klient dodany!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nazwa firmy *</Label>
                    <Input
                      id="name"
                      placeholder="Nazwa Sp. z o.o."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nip">NIP *</Label>
                    <Input
                      id="nip"
                      placeholder="1234567890"
                      maxLength={10}
                      value={formData.nip}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nip: e.target.value.replace(/\D/g, ""),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email kontaktowy</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="kontakt@firma.pl"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!formData.name || !formData.nip || formLoading}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {formLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Building2 className="w-4 h-4 mr-2" />
                    )}
                    Dodaj klienta
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Łącznie klientów</CardDescription>
            <CardTitle className="text-3xl">
              {data?.companies?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktywnych klientów</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {data?.companies?.filter((c) => c.isActive).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Przychody ({periodLabel[period]})</CardDescription>
            <CardTitle className="text-3xl text-violet-600">
              {formatCurrency(
                data?.companies?.reduce((acc, c) => acc + c.stats.periodSpent, 0) || 0
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Zamówienia ({periodLabel[period]})</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {data?.companies?.reduce((acc, c) => acc + c.stats.periodOrders, 0) || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Wykres sprzedaży
              </CardTitle>
              <CardDescription>
                Przychody dzienne za ostatnie {periodLabel[period]}
              </CardDescription>
            </div>
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodOption)}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dni</SelectItem>
                <SelectItem value="30">30 dni</SelectItem>
                <SelectItem value="quarter">Kwartał</SelectItem>
                <SelectItem value="year">Rok</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {data?.salesData && data.salesData.length > 0 ? (
            <div className="h-48">
              <div className="flex items-end h-full gap-1">
                {data.salesData.map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center justify-end"
                    title={`${day.date}: ${formatCurrency(day.revenue)} (${day.orders} zam.)`}
                  >
                    <div
                      className="w-full bg-violet-500 rounded-t hover:bg-violet-600 transition-colors cursor-pointer"
                      style={{
                        height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`,
                        minHeight: day.revenue > 0 ? "4px" : "0",
                      }}
                    />
                    {data.salesData.length <= 14 && (
                      <span className="text-[10px] text-gray-400 mt-1 rotate-45 origin-left">
                        {new Date(day.date).getDate()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              Brak danych sprzedaży
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 10 Leaderboard */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top 10 klientów
          </CardTitle>
          <CardDescription>Ranking według łącznych wydatków</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.top10 && data.top10.length > 0 ? (
            <div className="space-y-2">
              {data.top10.map((company, index) => (
                <Link key={company.id} href={`/admin/companies/${company.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                          ? "bg-gray-100 text-gray-700"
                          : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{company.name}</p>
                      <p className="text-xs text-gray-500">
                        {company.stats.totalOrders} zamówień • Ostatnie: {formatDate(company.lastOrderDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-violet-600">
                        {formatCurrency(company.stats.totalSpent)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              Brak danych do wyświetlenia
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Sort */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Szukaj klientów (nazwa, NIP, email)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[200px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sortuj" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsi</SelectItem>
            <SelectItem value="oldest">Najstarsi</SelectItem>
            <SelectItem value="most_spent">Najwięcej wydali</SelectItem>
            <SelectItem value="most_active">Ostatnio aktywni</SelectItem>
            <SelectItem value="least_active">Dawno nieaktywni</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Companies List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Błąd ładowania danych</p>
          </CardContent>
        </Card>
      ) : sortedCompanies?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak klientów</p>
            <p className="text-sm text-gray-500 mt-1">Dodaj pierwszego klienta</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCompanies?.map((company) => (
            <Link key={company.id} href={`/admin/companies/${company.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription>NIP: {company.nip}</CardDescription>
                    </div>
                    <Badge
                      variant={company.isActive ? "default" : "secondary"}
                      className={company.isActive ? "bg-green-100 text-green-700" : ""}
                    >
                      {company.isActive ? "Aktywna" : "Nieaktywna"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-blue-600">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">{company._count.users}</span>
                      </div>
                      <p className="text-xs text-gray-500">Użytkownicy</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-purple-600">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-semibold">{company.stats.totalOrders}</span>
                      </div>
                      <p className="text-xs text-gray-500">Zamówienia</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-semibold">{company.freeCredits}</span>
                      </div>
                      <p className="text-xs text-gray-500">Darmowe</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Ostatnie zamówienie</p>
                        <p className="text-sm font-medium">{formatDate(company.lastOrderDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Łączne wydatki</p>
                        <p className="font-semibold text-violet-600">
                          {formatCurrency(company.stats.totalSpent)}
                        </p>
                      </div>
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
