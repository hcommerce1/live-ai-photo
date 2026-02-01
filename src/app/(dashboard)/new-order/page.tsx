"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { X, Plus, Mail, Phone } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface FeatureSettings {
  expressEnabled: boolean;
  urgentEnabled: boolean;
  packagesEnabled: boolean;
  pricePerGraphic: number;
  expressPriceMultiplier: number;
  urgentPriceMultiplier: number;
}

interface UserProfile {
  deliveryEmails: string[];
  notificationPhone: string | null;
}

type Step = 1 | 2 | 3 | 4;

interface OrderFormData {
  images: File[];
  quantity: number;
  instructions: string;
  style: string;
  platform: string;
  background: string;
  format: string;
  constraints: string[];
  priority: string;
  deliveryEmails: string[];
  notificationPhone: string;
}

const initialFormData: OrderFormData = {
  images: [],
  quantity: 5,
  instructions: "",
  style: "",
  platform: "",
  background: "",
  format: "1:1",
  constraints: [],
  priority: "NORMAL",
  deliveryEmails: [],
  notificationPhone: "",
};

const styles = [
  { value: "CLEAN", label: "Clean", description: "Minimalistyczny, czysty styl" },
  { value: "INDUSTRIAL", label: "Industrial", description: "Surowy, industrialny wygląd" },
  { value: "PREMIUM", label: "Premium", description: "Luksusowy, ekskluzywny styl" },
  { value: "LIFESTYLE", label: "Lifestyle", description: "Produkt w kontekście życia" },
  { value: "MINIMAL", label: "Minimal", description: "Prosty, bez zbędnych elementów" },
];

const platforms = [
  { value: "ALLEGRO", label: "Allegro" },
  { value: "AMAZON", label: "Amazon" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "LANDING_PAGE", label: "Landing Page" },
  { value: "UNIVERSAL", label: "Uniwersalne" },
];

const backgrounds = [
  { value: "WHITE", label: "Białe tło" },
  { value: "CONTEXTUAL", label: "Tło kontekstowe" },
  { value: "AI_GENERATED", label: "AI-generated" },
  { value: "TRANSPARENT", label: "Przezroczyste" },
];

const formats = [
  { value: "1:1", label: "1:1 (Kwadrat)" },
  { value: "4:5", label: "4:5 (Instagram)" },
  { value: "16:9", label: "16:9 (Panorama)" },
  { value: "9:16", label: "9:16 (Stories)" },
];

const constraintOptions = [
  { id: "no-color-change", label: "Nie zmieniaj koloru produktu" },
  { id: "no-text", label: "Nie dodawaj tekstu" },
  { id: "keep-logo", label: "Zachowaj logo produktu" },
  { id: "no-props", label: "Bez dodatkowych rekwizytów" },
  { id: "keep-proportions", label: "Zachowaj dokładne proporcje" },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Fetch feature settings and user profile
  const { data: settingsData } = useSWR<{ settings: FeatureSettings }>(
    "/api/settings/features",
    fetcher
  );
  const { data: profileData } = useSWR<{ user: UserProfile }>(
    "/api/user/profile",
    fetcher
  );

  const settings = settingsData?.settings;

  // Initialize delivery data from profile
  useEffect(() => {
    if (profileData?.user) {
      setFormData((prev) => ({
        ...prev,
        deliveryEmails: profileData.user.deliveryEmails || [],
        notificationPhone: profileData.user.notificationPhone || "",
      }));
    }
  }, [profileData]);

  // Calculate price based on priority
  const calculatePrice = () => {
    const basePrice = settings?.pricePerGraphic || 4900;
    let multiplier = 1;
    if (formData.priority === "EXPRESS") {
      multiplier = settings?.expressPriceMultiplier || 2;
    } else if (formData.priority === "URGENT") {
      multiplier = settings?.urgentPriceMultiplier || 4;
    }
    return (basePrice * formData.quantity * multiplier) / 100;
  };

  // Email management
  const addEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail && emailRegex.test(newEmail) && !formData.deliveryEmails.includes(newEmail)) {
      setFormData({ ...formData, deliveryEmails: [...formData.deliveryEmails, newEmail] });
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setFormData({
      ...formData,
      deliveryEmails: formData.deliveryEmails.filter((e) => e !== email),
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length + formData.images.length > 10) {
        toast.error("Maksymalnie 10 zdjęć");
        return;
      }
      setFormData({ ...formData, images: [...formData.images, ...files] });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length + formData.images.length > 10) {
        toast.error("Maksymalnie 10 zdjęć");
        return;
      }
      setFormData({ ...formData, images: [...formData.images, ...files] });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const toggleConstraint = (constraint: string) => {
    if (formData.constraints.includes(constraint)) {
      setFormData({
        ...formData,
        constraints: formData.constraints.filter((c) => c !== constraint),
      });
    } else {
      setFormData({
        ...formData,
        constraints: [...formData.constraints, constraint],
      });
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.images.length >= 1;
      case 2:
        return formData.instructions.length > 0;
      case 3:
        return formData.style && formData.platform && formData.background;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      // Add images
      formData.images.forEach((file, index) => {
        formDataToSend.append(`image${index}`, file);
      });

      // Add form fields
      formDataToSend.append("quantity", String(formData.quantity));
      formDataToSend.append("instructions", formData.instructions);
      formDataToSend.append("style", formData.style);
      formDataToSend.append("platform", formData.platform);
      formDataToSend.append("background", formData.background);
      formDataToSend.append("format", formData.format);
      formDataToSend.append("constraints", JSON.stringify(formData.constraints));
      formDataToSend.append("priority", formData.priority);

      // Delivery data
      if (formData.deliveryEmails.length > 0) {
        formDataToSend.append("deliveryEmailsOverride", JSON.stringify(formData.deliveryEmails));
      }
      if (formData.notificationPhone) {
        formDataToSend.append("notificationPhoneOverride", formData.notificationPhone);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      toast.success("Zamówienie zostało złożone!");
      router.push("/orders");
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Wystąpił błąd podczas składania zamówienia");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Nowe zamówienie</h1>
        <p className="text-muted-foreground mt-1">
          Krok {step} z 4 - {step === 1 && "Wgraj zdjęcia"}
          {step === 2 && "Opisz wymagania"}
          {step === 3 && "Wybierz styl"}
          {step === 4 && "Podsumowanie"}
        </p>
      </div>

      <Progress value={(step / 4) * 100} className="h-2" />

      {/* Step 1: Upload Images */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Wgraj zdjęcia produktu</CardTitle>
            <CardDescription>
              Dodaj 1-10 zdjęć produktu. Akceptowane formaty: JPG, PNG, WebP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 dark:border-gray-700"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg
                className="w-12 h-12 mx-auto mb-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-muted-foreground mb-4">
                Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
              </p>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <Button variant="outline" asChild>
                <label htmlFor="file-input" className="cursor-pointer">
                  Wybierz pliki
                </label>
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-5 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {formData.images.length}/10 zdjęć
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Instructions */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Opisz wymagania</CardTitle>
            <CardDescription>
              Powiedz nam, jakie grafiki chcesz otrzymać
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Ile grafik potrzebujesz?</Label>
              <Select
                value={String(formData.quantity)}
                onValueChange={(v) =>
                  setFormData({ ...formData, quantity: parseInt(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 grafiki</SelectItem>
                  <SelectItem value="5">5 grafik</SelectItem>
                  <SelectItem value="10">10 grafik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instrukcje</Label>
              <Textarea
                id="instructions"
                placeholder="Opisz dokładnie, jakie grafiki chcesz otrzymać. Np. 'Zdjęcia produktowe na białym tle, z delikatnym cieniem, w stylu premium. Produkt ma być pokazany z przodu i z boku.'"
                rows={6}
                value={formData.instructions}
                onChange={(e) =>
                  setFormData({ ...formData, instructions: e.target.value })
                }
              />
              <p className="text-sm text-muted-foreground">
                Im dokładniejszy opis, tym lepszy wynik
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Style */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz styl</CardTitle>
            <CardDescription>
              Określ styl wizualny i platformę docelową
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Styl wizualny</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() =>
                      setFormData({ ...formData, style: style.value })
                    }
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.style === style.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium">{style.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {style.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Platforma docelowa</Label>
              <Select
                value={formData.platform}
                onValueChange={(v) =>
                  setFormData({ ...formData, platform: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz platformę" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tło</Label>
              <Select
                value={formData.background}
                onValueChange={(v) =>
                  setFormData({ ...formData, background: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz tło" />
                </SelectTrigger>
                <SelectContent>
                  {backgrounds.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select
                value={formData.format}
                onValueChange={(v) => setFormData({ ...formData, format: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ograniczenia (opcjonalne)</Label>
              <div className="space-y-3">
                {constraintOptions.map((constraint) => (
                  <div key={constraint.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={constraint.id}
                      checked={formData.constraints.includes(constraint.id)}
                      onCheckedChange={() => toggleConstraint(constraint.id)}
                    />
                    <Label htmlFor={constraint.id} className="font-normal">
                      {constraint.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie zamówienia</CardTitle>
            <CardDescription>
              Sprawdź szczegóły przed złożeniem zamówienia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Zdjęcia</p>
                <p className="font-medium">{formData.images.length} plików</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ilość grafik</p>
                <p className="font-medium">{formData.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Styl</p>
                <p className="font-medium">
                  {styles.find((s) => s.value === formData.style)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platforma</p>
                <p className="font-medium">
                  {platforms.find((p) => p.value === formData.platform)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tło</p>
                <p className="font-medium">
                  {backgrounds.find((b) => b.value === formData.background)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium">
                  {formats.find((f) => f.value === formData.format)?.label}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Instrukcje</p>
              <p className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {formData.instructions}
              </p>
            </div>

            {formData.constraints.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Ograniczenia</p>
                <div className="flex flex-wrap gap-2">
                  {formData.constraints.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Priorytet</p>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) =>
                      setFormData({ ...formData, priority: v })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NORMAL">Normalny (do 24h)</SelectItem>
                      {settings?.expressEnabled !== false && (
                        <SelectItem value="EXPRESS">EXPRESS (do 4h)</SelectItem>
                      )}
                      {settings?.urgentEnabled !== false && (
                        <SelectItem value="URGENT">URGENT (do 1h)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Do zapłaty</p>
                  <p className="text-2xl font-bold">
                    {calculatePrice().toFixed(2)} PLN
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Data */}
            <div className="border-t pt-4 space-y-4">
              <p className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Dane dostawy
              </p>

              {/* Delivery Emails */}
              <div className="space-y-2">
                <Label>Maile do wysyłki gotowych grafik</Label>
                {formData.deliveryEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.deliveryEmails.map((email) => (
                      <Badge
                        key={email}
                        variant="secondary"
                        className="pl-3 pr-1 py-1.5 text-sm"
                      >
                        {email}
                        <button
                          onClick={() => removeEmail(email)}
                          className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Dodaj adres email..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEmail}
                    disabled={!newEmail}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefon do powiadomień SMS
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.notificationPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, notificationPhone: e.target.value })
                  }
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => (s - 1) as Step)}
          disabled={step === 1}
        >
          Wstecz
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={!canProceed()}
          >
            Dalej
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Składanie zamówienia..." : "Złóż zamówienie"}
          </Button>
        )}
      </div>
    </div>
  );
}
