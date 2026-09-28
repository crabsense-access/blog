"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/blog", label: "Blog" },
  { href: "/glosario", label: "Glosario" },
];

// Px de scroll a partir de los cuales el header deja de ser transparente.
const SCROLLED_THRESHOLD = 8;

export function SiteHeader() {
  // En la home el header arranca transparente sobre el hero oscuro y pasa a
  // blanco apenas se scrollea (cuando queda "pegado" como sticky).
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const transparent = isHome && !scrolled;
  const headerRef = useRef<HTMLElement>(null);

  // Expone el alto real del header como variable CSS, para que otros
  // bloques (ej. el slider de la home, que arranca en top: 0 por debajo
  // del header) puedan compensarlo sin hardcodear un valor en px.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    function setHeaderHeightVar() {
      document.documentElement.style.setProperty("--site-header-height", `${el!.offsetHeight}px`);
    }

    setHeaderHeightVar();
    const observer = new ResizeObserver(setHeaderHeightVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Offset para bloques sticky que van pegados debajo del header (ej.
  // PostCategoriesStickyNav). El header ahora es siempre visible, así que
  // es siempre su alto real.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--site-header-offset",
      "var(--site-header-height, 4.5rem)"
    );
  }, []);

  // Solo detecta si la página está scrolleada (para el fondo blanco y la
  // línea de abajo). El header ya no se esconde nunca: queda siempre fijo.
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > SCROLLED_THRESHOLD);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    // estado inicial (ej. si la página carga ya scrolleada)
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "border-b sticky top-0 z-50 transition-[background-color,border-color] duration-300 ease-in-out",
        // sin línea abajo al inicio; aparece apenas se empieza a scrollear
        scrolled ? "border-neutral-200" : "border-transparent",
        transparent ? "bg-transparent" : "bg-white"
      )}
    >
      <div className="max-w-[108rem] mx-auto px-10">
        <div className="flex max-w-7xl mx-auto items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos, ver post-image.tsx */}
            <img
              src="/crabsense-logo.svg"
              alt="Crabsense"
              className="h-11 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* CTA Button */}
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/contacto">Contactar</Link>
            </Button>

            {/* Mobile Navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn("md:hidden", transparent && "bg-white/60")}
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {NAV_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
