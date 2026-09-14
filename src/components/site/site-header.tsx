"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

// Umbral en px antes de permitir que el header se esconda,
// para que no se oculte apenas se empieza a scrollear.
const HIDE_THRESHOLD = 80;

export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
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

  // Expone además el "offset" que le corresponde a cualquier bloque sticky
  // que vaya pegado justo debajo del header (ej. PostCategoriesStickyNav):
  // la altura del header mientras está visible, y 0 en el mismo instante
  // en que el header se esconde (translateY -100% al scrollear hacia
  // abajo) — así ese otro bloque puede subir a top:0 y ocupar el lugar del
  // header en vez de dejar un hueco en blanco, y volver a su lugar justo
  // debajo apenas el header reaparece. Al ser un valor "var(...)" en vez
  // de un px fijo, sigue reflejando la altura real del header (la que
  // actualiza el ResizeObserver de arriba) aun mientras está visible.
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--site-header-offset",
      hidden ? "0px" : "var(--site-header-height, 4.5rem)"
    );
  }, [hidden]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrollingDown = currentY > lastScrollY.current;

        if (currentY <= HIDE_THRESHOLD) {
          setHidden(false);
        } else {
          setHidden(scrollingDown);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "border-b bg-white sticky top-0 z-50 transition-transform duration-300 ease-in-out",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-[108rem] mx-auto px-10">
        <div className="flex max-w-7xl mx-auto items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos, ver post-image.tsx */}
            <img src="/crabsense-logo.svg" alt="Crabsense" className="h-9 w-auto" />
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
                <Button variant="outline" size="icon" className="md:hidden">
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
