"use client";

import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Palette,
  Eye,
  CheckCircle,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Zap,
  Leaf,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  previewUrl: string;
  thumbnail: string;
  features: string[];
  isPopular?: boolean;
  isNew?: boolean;
}

const templates: Template[] = [
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    description: "Minimalistyczny szablon z białym tłem, idealny dla produktów premium",
    category: "Minimalistyczne",
    previewUrl: "#",
    thumbnail: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    features: ["Białe tło", "Delikatne cienie", "Duże zdjęcia", "Elegancka typografia"],
    isPopular: true,
  },
  {
    id: "dark-luxury",
    name: "Dark Luxury",
    description: "Ciemny szablon dla produktów luksusowych i ekskluzywnych",
    category: "Premium",
    previewUrl: "#",
    thumbnail: "linear-gradient(135deg, #232526 0%, #414345 100%)",
    features: ["Ciemne tło", "Złote akcenty", "Efekty świetlne", "Kontrastowe zdjęcia"],
    isNew: true,
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    description: "Dynamiczny szablon pokazujący produkty w kontekście życia",
    category: "Lifestyle",
    previewUrl: "#",
    thumbnail: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    features: ["Kolorowe tła", "Kontekstowe zdjęcia", "Nowoczesny layout", "Social proof"],
  },
  {
    id: "eco-natural",
    name: "Eco Natural",
    description: "Naturalny szablon dla produktów ekologicznych i organicznych",
    category: "Eco",
    previewUrl: "#",
    thumbnail: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    features: ["Zielone akcenty", "Naturalne tekstury", "Ekologiczne ikony", "Ciepłe tony"],
  },
  {
    id: "tech-modern",
    name: "Tech Modern",
    description: "Nowoczesny szablon dla produktów technologicznych",
    category: "Tech",
    previewUrl: "#",
    thumbnail: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    features: ["Gradienty", "Geometryczne kształty", "Neonowe akcenty", "3D efekty"],
    isNew: true,
  },
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    description: "Klasyczny i elegancki szablon dla tradycyjnych marek",
    category: "Classic",
    previewUrl: "#",
    thumbnail: "linear-gradient(135deg, #d4a373 0%, #bc6c25 100%)",
    features: ["Kremowe tło", "Klasyczna typografia", "Ramki", "Złote detale"],
    isPopular: true,
  },
];

const categories = ["Wszystkie", "Minimalistyczne", "Premium", "Lifestyle", "Eco", "Tech", "Classic"];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Wszystkie");
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>("clean-minimal");

  const filteredTemplates = selectedCategory === "Wszystkie"
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  const handleApplyTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    setPreviewTemplate(null);
    // TODO: Save to system settings
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Premium":
        return <Sparkles className="w-3 h-3" />;
      case "Tech":
        return <Zap className="w-3 h-3" />;
      case "Eco":
        return <Leaf className="w-3 h-3" />;
      default:
        return <ShoppingBag className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Szablony dla klientów
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Wybierz globalny szablon prezentacji produktów dla wszystkich klientów
        </p>
      </div>

      {/* Current Template */}
      {activeTemplate && (
        <Card className="border-violet-500 bg-violet-50 dark:bg-violet-900/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-violet-600" />
              <div>
                <p className="font-medium text-violet-900 dark:text-violet-100">
                  Aktywny szablon: {templates.find((t) => t.id === activeTemplate)?.name}
                </p>
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  Ten szablon jest używany dla wszystkich klientów w systemie
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-violet-600 hover:bg-violet-700" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`overflow-hidden hover:shadow-lg transition-shadow ${
              activeTemplate === template.id ? "ring-2 ring-violet-500" : ""
            }`}
          >
            {/* Thumbnail */}
            <div
              className="h-40 relative"
              style={{ background: template.thumbnail }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                  <Palette className="w-8 h-8 text-gray-600" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-3 right-3 flex gap-2">
                {template.isPopular && (
                  <Badge className="bg-orange-500">Popularne</Badge>
                )}
                {template.isNew && (
                  <Badge className="bg-blue-500">Nowe</Badge>
                )}
                {activeTemplate === template.id && (
                  <Badge className="bg-violet-500">Aktywny</Badge>
                )}
              </div>
            </div>

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-1 mt-1">
                    {getCategoryIcon(template.category)}
                    <CardDescription>{template.category}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Podgląd
                </Button>
                <Button
                  size="sm"
                  className={`flex-1 ${
                    activeTemplate === template.id
                      ? "bg-gray-400"
                      : "bg-violet-600 hover:bg-violet-700"
                  }`}
                  disabled={activeTemplate === template.id}
                  onClick={() => handleApplyTemplate(template.id)}
                >
                  {activeTemplate === template.id ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aktywny
                    </>
                  ) : (
                    "Użyj szablonu"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Podgląd: {previewTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {/* Preview Area */}
          <div
            className="h-96 rounded-lg flex items-center justify-center"
            style={{ background: previewTemplate?.thumbnail }}
          >
            <div className="bg-white/95 rounded-xl p-8 shadow-2xl max-w-md text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Przykładowy produkt
              </h3>
              <p className="text-gray-600 mb-4">
                Tak będą wyglądać produkty klientów w systemie
              </p>
              <div className="flex justify-center gap-2">
                {previewTemplate?.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Zamknij
            </Button>
            <Button
              onClick={() => window.open(previewTemplate?.previewUrl, "_blank")}
              disabled={previewTemplate?.previewUrl === "#"}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Otwórz pełny podgląd
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={activeTemplate === previewTemplate?.id}
              onClick={() => previewTemplate && handleApplyTemplate(previewTemplate.id)}
            >
              {activeTemplate === previewTemplate?.id ? "Już aktywny" : "Użyj tego szablonu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info */}
      <Card className="bg-violet-50 border-violet-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Palette className="w-5 h-5 text-violet-600 mt-0.5" />
            <div>
              <p className="font-medium text-violet-900">Jak działają szablony?</p>
              <ul className="text-sm text-violet-700 mt-2 space-y-1 list-disc list-inside">
                <li>Wybrany szablon określa globalny styl prezentacji zdjęć</li>
                <li>Zmiana szablonu wpływa na wszystkich klientów w systemie</li>
                <li>Klienci zobaczą zmiany przy następnym zamówieniu</li>
                <li>Każdy szablon jest zoptymalizowany pod różne branże</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
