import { Metadata } from "next";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard - LIVE AI PHOTO",
  description: "Panel klienta LIVE AI PHOTO - twórz profesjonalne grafiki produktowe",
};
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Witaj, {session?.user?.name || "Użytkowniku"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Twórz profesjonalne grafiki produktowe z pomocą AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Zamówienia w trakcie</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Aktywne zamówienia
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ukończone</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Wszystkie zrealizowane zamówienia
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Grafiki</CardDescription>
            <CardTitle className="text-4xl">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Łącznie wygenerowanych grafik
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rozpocznij nowe zamówienie</CardTitle>
          <CardDescription>
            Wgraj zdjęcia produktu i opisz, jakie grafiki chcesz otrzymać
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/new-order">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nowe zamówienie
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/orders">Zobacz historię zamówień</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jak to działa?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium">Wgraj zdjęcia</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Dodaj 1-10 zdjęć produktu
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium">Opisz wymagania</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Wybierz styl i platformę
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium">AI + Grafik</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI generuje, grafik dopracowuje
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">4</span>
              </div>
              <h3 className="font-medium">Gotowe!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pobierz profesjonalne grafiki
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
