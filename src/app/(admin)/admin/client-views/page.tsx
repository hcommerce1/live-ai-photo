"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  Eye,
  Check,
  Layout,
  Sparkles,
  Moon,
  Minimize2,
  Palette,
  X,
  Loader2,
} from "lucide-react";

// Import widoków
import {
  ClassicView,
  ModernView,
  DarkView,
  CompactView,
  CreativeView,
} from "@/components/client-views";

interface ViewConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<{ children: React.ReactNode }>;
  preview: string;
  features: string[];
}

const viewConfigs: ViewConfig[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Tradycyjny layout z sidebar po lewej stronie",
    icon: Layout,
    component: ClassicView,
    preview: "Klasyczna kolorystyka, przejrzysta nawigacja",
    features: ["Sidebar po lewej", "Jasne kolory", "Tradycyjna nawigacja", "Pełna responsywność"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Minimalistyczny design z górną nawigacją",
    icon: Sparkles,
    component: ModernView,
    preview: "Nowoczesny, czysty wygląd z dużą przestrzenią",
    features: ["Top bar navigation", "Dużo białej przestrzeni", "Zaokrąglone elementy", "Subtelne gradienty"],
  },
  {
    id: "dark",
    name: "Dark",
    description: "Elegancki ciemny motyw z neonowymi akcentami",
    icon: Moon,
    component: DarkView,
    preview: "Ciemne tło z efektami glow i gradientami",
    features: ["Ciemne tło", "Neonowe akcenty cyan/purple", "Efekty glow", "Gradienty"],
  },
  {
    id: "compact",
    name: "Compact",
    description: "Kompaktowy layout maksymalizujący przestrzeń",
    icon: Minimize2,
    component: CompactView,
    preview: "Zwijany sidebar, małe paddingi, data-dense",
    features: ["Zwijany sidebar", "Ikony zamiast tekstu", "Małe marginesy", "Maksimum treści"],
  },
  {
    id: "creative",
    name: "Creative",
    description: "Kreatywny design z animacjami i kolorami",
    icon: Palette,
    component: CreativeView,
    preview: "Kolorowe gradienty, animacje, FAB buttons",
    features: ["Animacje CSS", "Kolorowe gradienty", "Floating Action Button", "Odważna typografia"],
  },
];

// Demo content for preview
function DemoContent() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Aktywne zamówienia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ukończone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">48</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">W realizacji</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie zamówienia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">Zamówienie #{1000 + i}</p>
                  <p className="text-sm text-gray-500">5 grafik • W realizacji</p>
                </div>
                <Badge>W trakcie</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientViewsPage() {
  const [selectedView, setSelectedView] = useState<string>("classic");
  const [previewingView, setPreviewingView] = useState<ViewConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current setting on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSelectedView(data.settings?.defaultClientView || "classic");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSetDefault = async (viewId: string) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultClientView: viewId }),
      });

      if (res.ok) {
        setSelectedView(viewId);
        toast.success("Widok został zmieniony", {
          description: `Domyślny widok panelu klienta to teraz: ${viewConfigs.find(v => v.id === viewId)?.name}`,
        });
      } else {
        toast.error("Nie udało się zapisać zmian");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Wystąpił błąd podczas zapisywania");
    } finally {
      setIsSaving(false);
    }
  };

  const openPreview = (view: ViewConfig) => {
    setPreviewingView(view);
  };

  const closePreview = () => {
    setPreviewingView(null);
  };

  // Fullpage preview mode
  if (previewingView) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
        {/* Close button */}
        <div className="fixed top-4 right-4 z-[60]">
          <Button
            variant="outline"
            size="icon"
            onClick={closePreview}
            className="bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* View name badge */}
        <div className="fixed top-4 left-4 z-[60]">
          <Badge variant="secondary" className="bg-white dark:bg-gray-800 shadow-lg px-3 py-1">
            Podgląd: {previewingView.name}
          </Badge>
        </div>

        {/* Preview content */}
        <div className="w-full h-full overflow-auto">
          <previewingView.component>
            <DemoContent />
          </previewingView.component>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Widoki klienta
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Wybierz domyślny wygląd panelu klienta dla nowych użytkowników
        </p>
      </div>

      {/* Current Selection */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Check className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-violet-900">Aktualny domyślny widok</p>
                <p className="text-sm text-violet-700">
                  {viewConfigs.find((v) => v.id === selectedView)?.name} -
                  {viewConfigs.find((v) => v.id === selectedView)?.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {viewConfigs.map((view) => {
          const Icon = view.icon;
          const isSelected = selectedView === view.id;

          return (
            <Card
              key={view.id}
              className={`relative transition-all ${
                isSelected
                  ? "ring-2 ring-violet-500 shadow-lg"
                  : "hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-violet-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? "bg-violet-100 text-violet-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{view.name}</CardTitle>
                      <CardDescription>{view.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Preview Box */}
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="text-center p-4">
                    <Icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">{view.preview}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {view.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openPreview(view)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>

                  <Button
                    size="sm"
                    className="flex-1"
                    variant={isSelected ? "secondary" : "default"}
                    onClick={() => handleSetDefault(view.id)}
                    disabled={isSelected || isSaving}
                  >
                    {isSaving && !isSelected ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Wybrany
                      </>
                    ) : (
                      "Ustaw domyślny"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-gray-600">
            <strong>Uwaga:</strong> Zmiana domyślnego widoku wpłynie tylko na nowych użytkowników.
            Istniejący użytkownicy mogą zmienić swój widok w ustawieniach profilu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
