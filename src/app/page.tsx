import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-lg">LIVE AI PHOTO</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#portfolio" className="text-muted-foreground hover:text-foreground transition">
              Zobacz przykłady
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition">
              Jak to działa
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition">
              Cennik
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Zaloguj się</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Zamów teraz</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
            Już ponad 2000+ zadowolonych klientów
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Zamień zwykłe zdjęcie produktu w
            <span className="text-primary"> grafikę, która sprzedaje</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Wrzuć zdjęcie z telefonu. Dostaniesz profesjonalną grafikę gotową na Allegro, Amazon czy Instagram.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary">
              <span>od 13 zł netto</span>
              <span className="text-muted-foreground text-base font-normal">/ grafikę</span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 text-lg">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Gotowe w 1 godzinę</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/register">Zamów swoje grafiki</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="#portfolio">Zobacz przykłady</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Speed banner */}
      <section className="py-8 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-semibold">Gotowe w 1h na mailu</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-semibold">Sprawdzone przez grafika</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-xl font-semibold">Darmowe poprawki</span>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Zobacz efekty naszej pracy
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Tak wyglądają grafiki, które tworzymy dla naszych klientów
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Example 1 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Elektronika</p>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">Allegro</span>
                <p className="mt-2 font-medium">Słuchawki bezprzewodowe</p>
              </div>
            </div>

            {/* Example 2 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Kosmetyki</p>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-1 rounded">Amazon</span>
                <p className="mt-2 font-medium">Krem do twarzy premium</p>
              </div>
            </div>

            {/* Example 3 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Moda</p>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded">Instagram</span>
                <p className="mt-2 font-medium">Torebka skórzana</p>
              </div>
            </div>

            {/* Example 4 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">AGD</p>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-blue-600 bg-blue-500/10 px-2 py-1 rounded">Allegro</span>
                <p className="mt-2 font-medium">Ekspres do kawy</p>
              </div>
            </div>

            {/* Example 5 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Biżuteria</p>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-purple-600 bg-purple-500/10 px-2 py-1 rounded">Sklep własny</span>
                <p className="mt-2 font-medium">Złoty naszyjnik</p>
              </div>
            </div>

            {/* Example 6 */}
            <div className="group relative overflow-hidden rounded-xl border bg-card">
              <div className="aspect-square bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Książki</p>
                </div>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-red-600 bg-red-500/10 px-2 py-1 rounded">Facebook</span>
                <p className="mt-2 font-medium">Książka kulinarna</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/register">Chcę takie grafiki dla siebie</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Jak to działa?
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            3 proste kroki do profesjonalnych grafik
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-background rounded-xl p-8 border">
              <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="font-bold text-xl mb-3">Wrzuć zdjęcie</h3>
              <p className="text-muted-foreground">
                Wystarczy zdjęcie z telefonu. Nie musi być idealne - my się tym zajmiemy.
              </p>
            </div>
            <div className="text-center bg-background rounded-xl p-8 border">
              <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="font-bold text-xl mb-3">Wybierz styl</h3>
              <p className="text-muted-foreground">
                Allegro? Amazon? Instagram? Powiedz gdzie chcesz sprzedawać, a my dobierzemy najlepszy format.
              </p>
            </div>
            <div className="text-center bg-background rounded-xl p-8 border">
              <div className="w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="font-bold text-xl mb-3">Odbierz na mailu</h3>
              <p className="text-muted-foreground">
                W ciągu godziny masz gotowe grafiki. Sprawdzone przez grafika i gotowe do publikacji.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Prosta wycena
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Bez ukrytych kosztów. Płacisz tylko za grafiki.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border p-8 text-center">
              <h3 className="font-bold text-lg mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-1">19 zł</div>
              <div className="text-muted-foreground mb-6">netto / grafikę</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>1-3 grafiki</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Realizacja do 24h</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>1 darmowa poprawka</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register">Wybieram</Link>
              </Button>
            </div>

            <div className="rounded-xl border-2 border-primary p-8 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                Najpopularniejszy
              </div>
              <h3 className="font-bold text-lg mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-1">15 zł</div>
              <div className="text-muted-foreground mb-6">netto / grafikę</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>5-10 grafik</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Realizacja do 4h</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Nielimitowane poprawki</span>
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">Wybieram</Link>
              </Button>
            </div>

            <div className="rounded-xl border p-8 text-center">
              <h3 className="font-bold text-lg mb-2">Business</h3>
              <div className="text-4xl font-bold mb-1">13 zł</div>
              <div className="text-muted-foreground mb-6">netto / grafikę</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>20+ grafik</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Realizacja do 1h</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Dedykowany opiekun</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register">Wybieram</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Zacznij sprzedawać więcej już dziś
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Profesjonalne grafiki = więcej kliknięć = więcej sprzedaży
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/register">Zamów pierwsze grafiki</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 LIVE AI PHOTO. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}
