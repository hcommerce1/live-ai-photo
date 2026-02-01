"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  CreditCard,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  Palette,
  ListOrdered,
  Cloud,
  CloudOff,
  Zap,
  Package,
  Building2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SystemSettings {
  id: string;
  pricePerGraphic: number;
  expressPriceMultiplier: number;
  urgentPriceMultiplier: number;
  designerRatePerGraphic: number;
  designerRatePerRevision: number;
  minutesPerGraphic: number;
  confirmationTimeout: number;
  queueMode: string;
  // Feature flags
  expressEnabled: boolean;
  urgentEnabled: boolean;
  packagesEnabled: boolean;
  // Time reductions
  expressTimeReduction: number;
  urgentTimeReduction: number;
}

export default function SettingsPage() {
  const { data, isLoading, mutate } = useSWR<{ settings: SystemSettings }>(
    "/api/admin/settings",
    fetcher
  );

  const [formData, setFormData] = useState<SystemSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data?.settings && !initialized) {
      setFormData(data.settings);
      setInitialized(true);
    }
  }, [data, initialized]);

  const saveChanges = useCallback(async () => {
    if (!formData || !hasChanges) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSaved(true);
        setHasChanges(false);
        mutate();
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }, [formData, hasChanges, mutate]);

  // Auto-save with debounce
  useEffect(() => {
    if (hasChanges && initialized) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveChanges();
      }, 1000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, saveChanges, initialized]);

  const updateFormData = (updates: Partial<SystemSettings>) => {
    if (!formData) return;
    setFormData({ ...formData, ...updates });
    setHasChanges(true);
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const parseCurrency = (value: string) => {
    return Math.round(parseFloat(value || "0") * 100);
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ustawienia systemu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Konfiguracja cen, czasów i kolejkowania (auto-zapis)
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/settings/pricing">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pakiety i abonamenty</CardTitle>
                  <CardDescription>Zarządzaj ofertą cenową</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/calendar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Kalendarz grafików</CardTitle>
                  <CardDescription>Dostępność zespołu</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/designers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Zarządzanie grafikami</CardTitle>
                  <CardDescription>Zespół i zaproszenia</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/companies">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Klienci</CardTitle>
                  <CardDescription>Klienci firmowi</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Dostępność funkcji
          </CardTitle>
          <CardDescription>
            Włącz lub wyłącz funkcje dla klientów
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="space-y-1">
                <Label htmlFor="expressEnabled" className="text-base font-medium">
                  Tryb Express
                </Label>
                <p className="text-sm text-gray-600">
                  Szybsza realizacja za wyższą cenę
                </p>
              </div>
              <Switch
                id="expressEnabled"
                checked={formData.expressEnabled ?? true}
                onCheckedChange={(checked) =>
                  updateFormData({ expressEnabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="space-y-1">
                <Label htmlFor="urgentEnabled" className="text-base font-medium">
                  Tryb Urgent
                </Label>
                <p className="text-sm text-gray-600">
                  Pilna realizacja (najszybsza)
                </p>
              </div>
              <Switch
                id="urgentEnabled"
                checked={formData.urgentEnabled ?? true}
                onCheckedChange={(checked) =>
                  updateFormData({ urgentEnabled: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg border border-violet-200">
              <div className="space-y-1">
                <Label htmlFor="packagesEnabled" className="text-base font-medium">
                  System pakietów
                </Label>
                <p className="text-sm text-gray-600">
                  Zakup pakietów zdjęć i kredyty
                </p>
              </div>
              <Switch
                id="packagesEnabled"
                checked={formData.packagesEnabled ?? true}
                onCheckedChange={(checked) =>
                  updateFormData({ packagesEnabled: checked })
                }
              />
            </div>
          </div>

          {/* Time reductions for Express/Urgent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="expressTimeReduction">
                Express - redukcja czasu (%)
              </Label>
              <Input
                id="expressTimeReduction"
                type="number"
                step="5"
                min="10"
                max="90"
                value={Math.round((formData.expressTimeReduction ?? 0.5) * 100)}
                onChange={(e) =>
                  updateFormData({ expressTimeReduction: (parseInt(e.target.value) || 50) / 100 })
                }
                disabled={!formData.expressEnabled}
              />
              <p className="text-xs text-gray-500">
                Express = {Math.round((formData.expressTimeReduction ?? 0.5) * 100)}% czasu normalnego
                ({Math.round(formData.minutesPerGraphic * (formData.expressTimeReduction ?? 0.5))} min/grafikę)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgentTimeReduction">
                Urgent - redukcja czasu (%)
              </Label>
              <Input
                id="urgentTimeReduction"
                type="number"
                step="5"
                min="10"
                max="90"
                value={Math.round((formData.urgentTimeReduction ?? 0.25) * 100)}
                onChange={(e) =>
                  updateFormData({ urgentTimeReduction: (parseInt(e.target.value) || 25) / 100 })
                }
                disabled={!formData.urgentEnabled}
              />
              <p className="text-xs text-gray-500">
                Urgent = {Math.round((formData.urgentTimeReduction ?? 0.25) * 100)}% czasu normalnego
                ({Math.round(formData.minutesPerGraphic * (formData.urgentTimeReduction ?? 0.25))} min/grafikę)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Cennik bazowy
          </CardTitle>
          <CardDescription>
            Podstawowe ceny za pojedynczą grafikę
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pricePerGraphic">Cena za grafikę (PLN)</Label>
              <Input
                id="pricePerGraphic"
                type="number"
                step="0.01"
                value={formatCurrency(formData.pricePerGraphic)}
                onChange={(e) =>
                  updateFormData({ pricePerGraphic: parseCurrency(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500">
                Cena bazowa dla opcji NORMAL
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expressPriceMultiplier">
                Mnożnik EXPRESS (x)
              </Label>
              <Input
                id="expressPriceMultiplier"
                type="number"
                step="0.1"
                min="1"
                value={formData.expressPriceMultiplier}
                onChange={(e) =>
                  updateFormData({ expressPriceMultiplier: parseFloat(e.target.value) || 1 })
                }
              />
              <p className="text-xs text-gray-500">
                Cena EXPRESS:{" "}
                {formatCurrency(
                  formData.pricePerGraphic * formData.expressPriceMultiplier
                )}{" "}
                PLN
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgentPriceMultiplier">Mnożnik URGENT (x)</Label>
              <Input
                id="urgentPriceMultiplier"
                type="number"
                step="0.1"
                min="1"
                value={formData.urgentPriceMultiplier}
                onChange={(e) =>
                  updateFormData({ urgentPriceMultiplier: parseFloat(e.target.value) || 1 })
                }
              />
              <p className="text-xs text-gray-500">
                Cena URGENT:{" "}
                {formatCurrency(
                  formData.pricePerGraphic * formData.urgentPriceMultiplier
                )}{" "}
                PLN
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Designer Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Stawki dla grafików
          </CardTitle>
          <CardDescription>
            Wynagrodzenie grafików za wykonane zlecenia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="designerRatePerGraphic">
                Stawka za grafikę (PLN)
              </Label>
              <Input
                id="designerRatePerGraphic"
                type="number"
                step="0.01"
                value={formatCurrency(formData.designerRatePerGraphic)}
                onChange={(e) =>
                  updateFormData({ designerRatePerGraphic: parseCurrency(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500">
                Kwota za jedną ukończoną grafikę
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designerRatePerRevision">
                Stawka za poprawkę (PLN)
              </Label>
              <Input
                id="designerRatePerRevision"
                type="number"
                step="0.01"
                value={formatCurrency(formData.designerRatePerRevision)}
                onChange={(e) =>
                  updateFormData({ designerRatePerRevision: parseCurrency(e.target.value) })
                }
              />
              <p className="text-xs text-gray-500">
                Kwota za każdą poprawkę / reklamację
              </p>
            </div>
          </div>

          {/* Profit margin info */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Marża:</strong> Przy cenie {formatCurrency(formData.pricePerGraphic)} PLN za grafikę
              i stawce {formatCurrency(formData.designerRatePerGraphic)} PLN dla grafika,
              marża wynosi{" "}
              <strong>
                {formatCurrency(formData.pricePerGraphic - formData.designerRatePerGraphic)} PLN
              </strong>{" "}
              ({formData.pricePerGraphic > 0
                ? ((1 - formData.designerRatePerGraphic / formData.pricePerGraphic) * 100).toFixed(0)
                : 0}%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Queue & Timing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5" />
            Kolejkowanie i czasy
          </CardTitle>
          <CardDescription>
            Ustawienia przydzielania zleceń do grafików
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="queueMode">Tryb kolejkowania</Label>
              <Select
                value={formData.queueMode}
                onValueChange={(value) => updateFormData({ queueMode: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz tryb" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="least_loaded">Najmniej obciążony</SelectItem>
                  <SelectItem value="priority">Według priorytetu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Jak przydzielać zlecenia do grafików
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minutesPerGraphic">
                Czas na 1 grafikę (minuty)
              </Label>
              <Input
                id="minutesPerGraphic"
                type="number"
                min="1"
                value={formData.minutesPerGraphic}
                onChange={(e) =>
                  updateFormData({ minutesPerGraphic: parseInt(e.target.value) || 30 })
                }
              />
              <p className="text-xs text-gray-500">
                Szacowany czas wykonania jednej grafiki
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmationTimeout">
                Timeout potwierdzenia (minuty)
              </Label>
              <Input
                id="confirmationTimeout"
                type="number"
                min="1"
                max="30"
                value={formData.confirmationTimeout}
                onChange={(e) =>
                  updateFormData({ confirmationTimeout: parseInt(e.target.value) || 5 })
                }
              />
              <p className="text-xs text-gray-500">
                Czas na potwierdzenie zlecenia
              </p>
            </div>
          </div>

          {/* Queue mode explanation */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              {formData.queueMode === "round_robin" && (
                <>
                  <strong>Round Robin:</strong> Zlecenia są przydzielane po kolei do każdego dostępnego grafika.
                </>
              )}
              {formData.queueMode === "least_loaded" && (
                <>
                  <strong>Najmniej obciążony:</strong> Zlecenia trafiają do grafika z najmniejszą liczbą aktywnych zadań.
                </>
              )}
              {formData.queueMode === "priority" && (
                <>
                  <strong>Według priorytetu:</strong> Pilne zlecenia trafiają do najlepszych grafików.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-violet-600 mt-0.5" />
            <div>
              <p className="font-medium text-violet-900">
                Jak działają ustawienia?
              </p>
              <ul className="text-sm text-violet-700 mt-2 space-y-1 list-disc list-inside">
                <li>
                  <strong>Cena bazowa</strong> - używana przy zamówieniach
                  jednorazowych
                </li>
                <li>
                  <strong>Mnożniki</strong> - EXPRESS i URGENT mają wyższą cenę
                </li>
                <li>
                  <strong>Czas na grafikę</strong> - używany do szacowania
                  terminów
                </li>
                <li>
                  <strong>Timeout</strong> - grafik ma tyle minut na
                  potwierdzenie zlecenia
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
