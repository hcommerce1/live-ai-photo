"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Gift } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { update } = useSession();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        const res = await fetch(`/api/auth/verify-email/${token}`, {
          method: "POST",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Weryfikacja nie powiodła się");
          setStatus("error");
        } else {
          setStatus("success");
          // Refresh session to update emailVerified status
          await update();
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        }
      } catch (err) {
        setError("Wystąpił błąd podczas weryfikacji");
        setStatus("error");
      }
    }

    verifyEmail();
  }, [token, router, update]);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Weryfikuję email...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Weryfikacja nie powiodła się
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/login">
            <Button>Przejdź do logowania</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Email zweryfikowany!</CardTitle>
        <CardDescription>
          Twoje konto zostało aktywowane
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Masz 1 darmową grafikę!
              </p>
              <p className="text-sm text-green-700">
                Wykorzystaj ją przy pierwszym zamówieniu
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600">
          <p>Za chwilę zostaniesz przekierowany do panelu...</p>
        </div>

        <Link href="/dashboard" className="block">
          <Button className="w-full">Przejdź do panelu</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
