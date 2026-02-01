"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Mail, User, Lock, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    nip: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validate NIP format (10 digits)
  const validateNip = (nip: string): boolean => {
    if (!/^\d{10}$/.test(nip)) return false;

    // Polish NIP checksum validation
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    const digits = nip.split("").map(Number);
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
    const checksum = sum % 11;

    return checksum === digits[9];
  };

  const handleNipChange = (value: string) => {
    // Only allow digits, max 10
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, nip: cleaned });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Hasła nie są identyczne");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Hasło musi mieć minimum 8 znaków");
      return;
    }

    if (!validateNip(formData.nip)) {
      toast.error("Nieprawidłowy numer NIP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          companyName: formData.companyName,
          nip: formData.nip,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd rejestracji");
      }

      toast.success("Konto utworzone! Sprawdź email, aby potwierdzić.");
      router.push("/verify-pending");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Wystąpił błąd rejestracji"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Utwórz konto firmowe</CardTitle>
        <CardDescription>
          Zarejestruj firmę i otrzymaj 1 darmową grafikę
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="name"
                type="text"
                placeholder="Jan Kowalski"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nazwa firmy</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="companyName"
                type="text"
                placeholder="Nazwa Sp. z o.o."
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* NIP */}
          <div className="space-y-2">
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="nip"
              type="text"
              placeholder="1234567890"
              value={formData.nip}
              onChange={(e) => handleNipChange(e.target.value)}
              maxLength={10}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500">
              10 cyfr, bez myślników
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email firmowy</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="jan@firma.pl"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 znaków"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Powtórz hasło"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Free graphic info */}
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              🎁 Po rejestracji otrzymasz <strong>1 darmową grafikę</strong> na start!
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Tworzenie konta...
              </>
            ) : (
              "Zarejestruj firmę"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Masz już konto?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Zaloguj się
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
