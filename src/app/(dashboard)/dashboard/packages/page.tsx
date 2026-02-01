"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Package,
  Check,
  Loader2,
  CreditCard,
  Sparkles,
  AlertCircle,
  CheckCircle,
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

interface PackagePurchase {
  id: string;
  creditsLeft: number;
  createdAt: string;
  package: {
    name: string;
    photoCount: number;
  };
}

export default function PackagesPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const { data: packagesData } = useSWR<{ packages: PhotoPackage[] }>(
    "/api/packages",
    fetcher
  );

  const { data: purchasesData } = useSWR<{ purchases: PackagePurchase[] }>(
    "/api/user/packages",
    fetcher
  );

  const handlePurchase = async (packageId: string) => {
    setPurchasingId(packageId);
    try {
      const res = await fetch("/api/checkout/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create checkout:", error);
    } finally {
      setPurchasingId(null);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(cents / 100);
  };

  const totalCredits =
    purchasesData?.purchases?.reduce((acc, p) => acc + p.creditsLeft, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">
                  Płatność zakończona sukcesem!
                </p>
                <p className="text-sm text-green-700">
                  Kredyty zostały dodane do Twojego konta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {canceled && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  Płatność została anulowana
                </p>
                <p className="text-sm text-orange-700">
                  Możesz spróbować ponownie w dowolnym momencie.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pakiety zdjęć
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kup pakiet i płać mniej za każde zdjęcie
        </p>
      </div>

      {/* Current Credits */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Twoje kredyty</p>
              <p className="text-4xl font-bold mt-1">{totalCredits}</p>
              <p className="text-blue-100 text-sm mt-1">
                dostępnych grafik do wykorzystania
              </p>
            </div>
            <CreditCard className="w-16 h-16 text-white/20" />
          </div>
        </CardContent>
      </Card>

      {/* Active Purchases */}
      {purchasesData?.purchases && purchasesData.purchases.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Twoje pakiety</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {purchasesData.purchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{purchase.package.name}</p>
                      <p className="text-sm text-gray-500">
                        Pozostało: {purchase.creditsLeft} /{" "}
                        {purchase.package.photoCount}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-blue-600">
                        {purchase.creditsLeft}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Packages */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dostępne pakiety</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packagesData?.packages?.filter((p) => p.isActive).map((pkg, index) => {
            const isPopular = index === 1; // Middle package is "popular"
            const isPurchasing = purchasingId === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={`relative ${
                  isPopular ? "border-2 border-blue-500 shadow-lg" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Najpopularniejszy
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    {pkg.photoCount} grafik w pakiecie
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(pkg.totalPrice)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(pkg.pricePerPhoto)} / grafika
                    </p>
                  </div>

                  <ul className="space-y-2 text-left">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {pkg.photoCount} grafik do wykorzystania
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Kredyty nie wygasają
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      Wszystkie priorytety
                    </li>
                  </ul>

                  <Button
                    className={`w-full ${
                      isPopular
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Kup pakiet
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Info */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Jak działają pakiety?</p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Kupujesz pakiet i otrzymujesz kredyty</li>
                <li>Przy każdym zamówieniu automatycznie wykorzystujesz kredyty</li>
                <li>Im większy pakiet, tym niższa cena za grafikę</li>
                <li>Kredyty nie wygasają - możesz ich użyć kiedy chcesz</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
