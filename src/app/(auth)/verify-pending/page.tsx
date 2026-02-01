"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, Loader2, CheckCircle, LogOut } from "lucide-react";

export default function VerifyPendingPage() {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      setResent(true);
    } catch (error) {
      console.error("Failed to resend:", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl">Potwierdź email</CardTitle>
        <CardDescription>
          Wysłaliśmy link weryfikacyjny na Twój adres email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center text-gray-600">
          <p>
            Sprawdź swoją skrzynkę odbiorczą i kliknij link, aby aktywować konto.
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Link jest ważny przez 24 godziny.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resending || resent}
          >
            {resending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : resent ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {resent ? "Email wysłany!" : "Wyślij ponownie"}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj i wróć do logowania
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>Nie widzisz emaila? Sprawdź folder spam.</p>
        </div>
      </CardContent>
    </Card>
  );
}
