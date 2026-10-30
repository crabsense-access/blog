"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [scrolled, setScrolled] = useState(false);

  // Expone el alto real del header como variable CSS, para que otros
  // bloques (ej. el slider de la home, que arranca en top: 0 por debajo
  // del header) puedan compensarlo sin hardcodear un valor en px.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    function setHeaderHeightVar() {
      const h = `${el!.offsetHeight}px`;
      document.documentElement.style.setProperty("--site-header-height", h);
      // El header es sticky: los bloques sticky de la página (ej.
      // PostCategoriesStickyNav) se pegan justo debajo de él.
      document.documentElement.style.setProperty("--site-header-offset", h);
    }

    setHeaderHeightVar();
    const observer = new ResizeObserver(setHeaderHeightVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Arriba de todo el header es transparente (se superpone al hero); al
  // scrollear toma fondo blanco translúcido para no quedar sobre el contenido.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
      // Header sticky: siempre visible arriba. Se superpone al hero (que sube
      // por debajo con margen negativo); transparente arriba de todo y con
      // fondo blanco translúcido una vez que se scrollea.
      className={`sticky top-0 z-50 px-6 md:px-10 transition-[background-color,box-shadow] duration-300 ${
        // transparente solo arriba de todo en la home (encima del hero); en
        // el resto de las páginas siempre con fondo (detrás está el footer fijo)
        !isHome
          ? "bg-white shadow-[0_1px_0_rgba(15,23,42,0.06)]"
          : scrolled
            ? "bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.06)] backdrop-blur-md"
            : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between py-4 max-md:justify-center">
          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos, ver post-image.tsx */}
            <img
              src="/crabsense-logo.svg"
              alt="Crabsense"
              // medidas explícitas (proporción del SVG: 954×185) y block, así
              // el logo no cambia de ancho al cargar ni suma espacio de línea
              width={206}
              height={40}
              className="block h-10 w-auto"
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

          <div className="flex items-center gap-2 max-md:hidden">
            {/* CTA Button */}
            {/* Pill en el violeta del servicio Analytics (#53539b) con flecha a 45° */}
            <Button
              asChild
              className="group hidden h-auto rounded-full bg-[#53539b] py-3.5 pl-9 pr-8 md:inline-flex has-[>svg]:pl-9 has-[>svg]:pr-8 text-[0.8rem] uppercase tracking-wide hover:bg-[#3d3c89]"
            >
              <Link href="/#contacto" onClick={(e) => handleAnchorClick(e, "/#contacto")}>
                Contactar
                <ArrowUpRight className="size-4.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>

          </div>
        </div>
      </div>

      {/* Mobile: "Contactar" flotante abajo a la derecha (en escritorio va en
          el header). Respeta el área segura inferior del iPhone. */}
      <Link
        href="/#contacto"
        onClick={(e) => handleAnchorClick(e, "/#contacto")}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-6 z-50 inline-flex items-center gap-2 rounded-full bg-[#53539b] py-3.5 pl-6 pr-5 text-[0.8rem] font-medium uppercase tracking-wide text-white shadow-[0_10px_30px_-8px_rgba(61,60,137,0.6)] transition-colors hover:bg-[#3d3c89] md:hidden"
      >
        Contactar
        <ArrowUpRight className="size-4.5" />
      </Link>
    </header>
  );
}
