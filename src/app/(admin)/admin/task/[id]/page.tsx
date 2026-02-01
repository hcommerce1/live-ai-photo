import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;

  // TODO: Fetch task from database
  const task = null;

  if (!task) {
    // For now, show a placeholder
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Zadanie #{id}</h1>
              <Badge variant="outline">Oczekujące</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Szczegóły zadania do realizacji
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Wróć do kolejki</Button>
            <Button>Przypisz do mnie</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original photos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Oryginalne zdjęcia</CardTitle>
                <Button variant="outline" size="sm">
                  Pobierz ZIP
                </Button>
              </div>
              <CardDescription>
                Zdjęcia produktu przesłane przez klienta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground">
                  Brak zdjęć
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Previews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Previews</CardTitle>
                <Button variant="outline" size="sm">
                  Pobierz ZIP
                </Button>
              </div>
              <CardDescription>
                Grafiki wygenerowane przez AI do edycji
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground">
                  Brak preview
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prompt and constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Instrukcje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Prompt:</Label>
              <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Brak promptu
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Ograniczenia:</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="destructive">Przykładowe ograniczenie</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload edited images */}
        <Card>
          <CardHeader>
            <CardTitle>Wgraj edytowane grafiki</CardTitle>
            <CardDescription>
              Pobierz AI previews, edytuj w swoim programie i wgraj gotowe pliki
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-muted-foreground mb-4">
                Przeciągnij pliki tutaj lub kliknij, aby wybrać
              </p>
              <Button variant="outline">Wybierz pliki</Button>
            </div>
          </CardContent>
        </Card>

        {/* QA Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Checklist QA</CardTitle>
            <CardDescription>
              Potwierdź jakość przed wysłaniem do klienta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Kształt produktu zgodny z oryginałem",
                "Proporcje zachowane",
                "Krawędzie czyste",
                "Brak artefaktów AI",
                "Logo/tekst czytelne",
                "Tło zgodne z wymaganiami",
                "Kolor produktu prawidłowy",
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Checkbox id={`check-${index}`} />
                  <Label htmlFor={`check-${index}`}>{item}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Zapisz postęp</Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Wyślij do QA
          </Button>
        </div>
      </div>
    );
  }

  return notFound();
}
