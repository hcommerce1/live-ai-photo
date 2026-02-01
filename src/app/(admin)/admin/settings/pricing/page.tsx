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
  ArrowLeft,
  Package,
  CreditCard,
  Plus,
  Loader2,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface PhotoPackage {
  id: string;
  name: string;
  photoCount: number;
  pricePerPhoto: number;
  totalPrice: number;
  isActive: boolean;
}

export default function PricingPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PhotoPackage | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    photoCount: 10,
    pricePerPhoto: 39,
  });

  const { data, error, isLoading, mutate } = useSWR<{
    packages: PhotoPackage[];
  }>("/api/admin/packages", fetcher);

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const url = editingPackage
        ? `/api/admin/packages/${editingPackage.id}`
        : "/api/admin/packages";
      const method = editingPackage ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          photoCount: formData.photoCount,
          pricePerPhoto: formData.pricePerPhoto * 100, // Convert to cents
          totalPrice: formData.photoCount * formData.pricePerPhoto * 100,
        }),
      });

      if (res.ok) {
        mutate();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save package:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć ten pakiet?")) return;

    try {
      await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      mutate();
    } catch (error) {
      console.error("Failed to delete package:", error);
    }
  };

  const handleToggleActive = async (pkg: PhotoPackage) => {
    try {
      await fetch(`/api/admin/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pkg, isActive: !pkg.isActive }),
      });
      mutate();
    } catch (error) {
      console.error("Failed to toggle package:", error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", photoCount: 10, pricePerPhoto: 39 });
    setEditingPackage(null);
  };

  const openEdit = (pkg: PhotoPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      photoCount: pkg.photoCount,
      pricePerPhoto: pkg.pricePerPhoto / 100,
    });
    setDialogOpen(true);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pakiety i ceny
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Zarządzaj pakietami zdjęć
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj pakiet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? "Edytuj pakiet" : "Nowy pakiet"}
              </DialogTitle>
              <DialogDescription>
                Pakiety pozwalają klientom kupić zdjęcia taniej w zestawach
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa pakietu</Label>
                <Input
                  id="name"
                  placeholder="np. Starter, Business, Enterprise"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="photoCount">Liczba zdjęć</Label>
                  <Input
                    id="photoCount"
                    type="number"
                    min="1"
                    value={formData.photoCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        photoCount: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerPhoto">Cena za zdjęcie (PLN)</Label>
                  <Input
                    id="pricePerPhoto"
                    type="number"
                    min="1"
                    value={formData.pricePerPhoto}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pricePerPhoto: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Cena pakietu</p>
                <p className="text-2xl font-bold text-violet-600">
                  {formatCurrency(
                    formData.photoCount * formData.pricePerPhoto * 100
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formData.photoCount} zdjęć × {formData.pricePerPhoto} PLN
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Anuluj
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || formLoading}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {formLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {editingPackage ? "Zapisz zmiany" : "Dodaj pakiet"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : data?.packages?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak pakietów</p>
            <p className="text-sm text-gray-500 mt-1">
              Dodaj pierwszy pakiet zdjęć
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.packages?.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${!pkg.isActive ? "opacity-60" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <CardDescription>
                      {pkg.photoCount} zdjęć w pakiecie
                    </CardDescription>
                  </div>
                  <Badge
                    variant={pkg.isActive ? "default" : "secondary"}
                    className={
                      pkg.isActive ? "bg-green-100 text-green-700" : ""
                    }
                  >
                    {pkg.isActive ? "Aktywny" : "Nieaktywny"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-violet-600">
                    {formatCurrency(pkg.totalPrice)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(pkg.pricePerPhoto)} / zdjęcie
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(pkg)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(pkg)}
                  >
                    {pkg.isActive ? "Dezaktywuj" : "Aktywuj"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Jak działają pakiety?</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Klient kupuje pakiet i otrzymuje kredyty</li>
                <li>Kredyty można wykorzystać na zamówienia</li>
                <li>Im większy pakiet, tym niższa cena za zdjęcie</li>
                <li>Pakiety nie wygasają (chyba że ustawisz datę)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
