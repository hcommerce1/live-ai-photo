import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QueuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Kolejka zadań</h1>
        <p className="text-muted-foreground mt-1">
          Zadania oczekujące na realizację
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Oczekujące</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>EXPRESS</CardDescription>
            <CardTitle className="text-3xl text-orange-500">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>W realizacji</CardDescription>
            <CardTitle className="text-3xl text-blue-500">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Do QA</CardDescription>
            <CardTitle className="text-3xl text-purple-500">0</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Oczekujące</TabsTrigger>
          <TabsTrigger value="express">EXPRESS</TabsTrigger>
          <TabsTrigger value="in-progress">W realizacji</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brak zadań w kolejce</CardTitle>
              <CardDescription>
                Nowe zadania pojawią się tutaj automatycznie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <svg
                  className="w-16 h-16 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p>Kolejka jest pusta</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="express" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brak zadań EXPRESS</CardTitle>
              <CardDescription>
                Zadania z priorytetem EXPRESS wymagają szybkiej realizacji
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Badge variant="outline" className="text-orange-500 border-orange-500 text-lg px-4 py-2">
                  EXPRESS
                </Badge>
                <p className="mt-4">Brak pilnych zadań</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brak zadań w realizacji</CardTitle>
              <CardDescription>
                Przypisz sobie zadanie z kolejki, aby rozpocząć pracę
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Button variant="outline" asChild>
                  <a href="#pending">Przejdź do kolejki</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
