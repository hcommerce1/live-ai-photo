"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Link as LinkIcon,
  Loader2,
  Search,
  Check,
  X,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

interface ScrapedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

interface UrlScraperProps {
  onImagesSelected: (images: string[]) => void;
  maxImages?: number;
}

export function UrlScraper({ onImagesSelected, maxImages = 10 }: UrlScraperProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ScrapedImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [pageTitle, setPageTitle] = useState("");

  const handleScrape = async () => {
    if (!url) return;

    setLoading(true);
    setError(null);
    setImages([]);
    setSelectedImages(new Set());

    try {
      const res = await fetch("/api/scrape-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Nie udało się pobrać zdjęć");
      }

      setImages(data.images);
      setPageTitle(data.pageTitle);

      if (data.images.length === 0) {
        setError("Nie znaleziono zdjęć na tej stronie");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  const toggleImage = (imageUrl: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageUrl)) {
      newSelected.delete(imageUrl);
    } else {
      if (newSelected.size >= maxImages) {
        return; // Max reached
      }
      newSelected.add(imageUrl);
    }
    setSelectedImages(newSelected);
  };

  const handleConfirm = () => {
    onImagesSelected(Array.from(selectedImages));
  };

  const handleClear = () => {
    setImages([]);
    setSelectedImages(new Set());
    setUrl("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="url">Link do strony produktu</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="url"
              type="url"
              placeholder="https://sklep.pl/produkt/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleScrape}
            disabled={!url || loading}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Szukaj</span>
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Wklej link do strony produktu, a my pobierzemy z niej zdjęcia
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Results */}
      {images.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Znalezione zdjęcia</CardTitle>
                <CardDescription>
                  {pageTitle && <span className="block truncate">{pageTitle}</span>}
                  Wybierz zdjęcia produktu (max {maxImages})
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {selectedImages.size} / {maxImages} wybranych
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((image, index) => {
                const isSelected = selectedImages.has(image.url);
                const isDisabled = !isSelected && selectedImages.size >= maxImages;

                return (
                  <div
                    key={image.url}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : isDisabled
                        ? "border-gray-200 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => !isDisabled && toggleImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `Zdjęcie ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' x='50' y='50' text-anchor='middle' dy='.3em'%3E?%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleClear}>
                <X className="w-4 h-4 mr-2" />
                Wyczyść
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedImages.size === 0}
              >
                <Check className="w-4 h-4 mr-2" />
                Użyj wybranych ({selectedImages.size})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && images.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Wklej link i kliknij "Szukaj" aby pobrać zdjęcia</p>
        </div>
      )}
    </div>
  );
}
