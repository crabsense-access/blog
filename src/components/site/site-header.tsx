"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  // Ancla a "Nuestros servicios" de la home (scroll suave)
  { href: "/#servicios", label: "Servicios" },
  { href: "/#casos", label: "Casos de éxito" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
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

  // El header ya no es sticky (se va con el scroll), así que los bloques
  // sticky de la página (ej. PostCategoriesStickyNav) se pegan arriba de todo.
  useEffect(() => {
    document.documentElement.style.setProperty("--site-header-offset", "0px");
  }, []);

  // En la home, los links con ancla ("/#servicios") hacen scroll suave
  // hasta la sección sin recargar; desde otras páginas navegan a la home y
  // bajan a la sección.
  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!isHome || !href.startsWith("/#")) return;
    const target = document.getElementById(href.slice(2));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  }

  return (
    <header
      ref={headerRef}
      // Header transparente y no fijo: se superpone al hero (que sube por
      // debajo con margen negativo) y se va con el scroll.
      className="relative z-50 bg-transparent px-4 md:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos, ver post-image.tsx */}
            <img
              src="/crabsense-logo.svg"
              alt="Crabsense"
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className="text-[0.8rem] font-bold uppercase tracking-wide text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* CTA Button */}
            {/* Pill en el violeta del servicio Analytics (#53539b) con flecha a 45° */}
            <Button
              asChild
              className="group h-auto rounded-full bg-[#53539b] py-3.5 pl-9 pr-8 has-[>svg]:pl-9 has-[>svg]:pr-8 text-[0.8rem] uppercase tracking-wide hover:bg-[#3d3c89]"
            >
              <Link href="/#contacto" onClick={(e) => handleAnchorClick(e, "/#contacto")}>
                Contactar
                <ArrowUpRight className="size-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>

            {/* Mobile Navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-11 rounded-full bg-white/60 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {NAV_LINKS.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="font-bold uppercase tracking-wide"
                    >
                      {link.label}
                    </Link>
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
