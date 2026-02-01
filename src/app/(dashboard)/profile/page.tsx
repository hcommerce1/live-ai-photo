"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  deliveryEmails: string[];
  notificationPhone: string | null;
  company: {
    id: string;
    name: string;
    nip: string;
  } | null;
}

export default function ProfilePage() {
  const { data, isLoading, mutate } = useSWR<{ user: UserProfile }>(
    "/api/user/profile",
    fetcher
  );

  const [name, setName] = useState("");
  const [deliveryEmails, setDeliveryEmails] = useState<string[]>([]);
  const [notificationPhone, setNotificationPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name || "");
      setDeliveryEmails(data.user.deliveryEmails || []);
      setNotificationPhone(data.user.notificationPhone || "");
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          deliveryEmails,
          notificationPhone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      mutate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Nie udało się zapisać profilu");
    } finally {
      setSaving(false);
    }
  };

  const addEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail && emailRegex.test(newEmail) && !deliveryEmails.includes(newEmail)) {
      setDeliveryEmails([...deliveryEmails, newEmail]);
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setDeliveryEmails(deliveryEmails.filter((e) => e !== email));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mój profil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Zarządzaj swoimi danymi i ustawieniami powiadomień
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Dane podstawowe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię i nazwisko</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email logowania</Label>
            <Input
              id="email"
              value={data?.user.email || ""}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              Email logowania nie może być zmieniony
            </p>
          </div>
          {data?.user.company && (
            <div className="pt-4 border-t">
              <Label>Firma</Label>
              <div className="mt-2 p-3 bg-violet-50 rounded-lg">
                <p className="font-medium text-violet-900">
                  {data.user.company.name}
                </p>
                <p className="text-sm text-violet-700">
                  NIP: {data.user.company.nip}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Emails */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Maile do wysyłki grafik
          </CardTitle>
          <CardDescription>
            Na te adresy zostaną wysłane gotowe grafiki
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current emails */}
          {deliveryEmails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {deliveryEmails.map((email) => (
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

          {/* Add new email */}
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

          <p className="text-xs text-gray-500">
            Możesz dodać wiele adresów email. Wszystkie otrzymają powiadomienie o
            gotowych grafikach.
          </p>
        </CardContent>
      </Card>

      {/* Phone for SMS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Telefon do powiadomień SMS
          </CardTitle>
          <CardDescription>
            Otrzymaj SMS gdy zamówienie będzie gotowe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Numer telefonu</Label>
            <Input
              id="phone"
              type="tel"
              value={notificationPhone}
              onChange={(e) => setNotificationPhone(e.target.value)}
              placeholder="+48 123 456 789"
            />
            <p className="text-xs text-gray-500">
              Format: 9 cyfr (np. 123456789) lub z prefixem +48
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            "Zapisz zmiany"
          )}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Zapisano!</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
