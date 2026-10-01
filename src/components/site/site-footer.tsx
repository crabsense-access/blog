import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CONTACT_EMAIL = "hola@crabsense.com";

const SERVICE_LINKS = [
  { href: "/#servicio-analytics", label: "Analytics" },
  { href: "/#servicio-seo", label: "SEO & GEO" },
  { href: "/#servicio-ads", label: "ADS" },
];

const EXPLORE_LINKS = [
  { href: "/#casos", label: "Casos de éxito" },
  { href: "/blog", label: "Blog" },
  { href: "/glosario", label: "Glosario" },
  { href: "/#contacto", label: "Contacto" },
];

// Redes: agregá acá LinkedIn, YouTube, etc. cuando tengas las URLs
const SOCIAL_LINKS = [{ href: "https://instagram.com/crabsense", label: "Instagram" }];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="sticky bottom-0 z-0 overflow-hidden bg-[#131220] text-white">
      {/* resplandores de los colores de la marca */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 size-[34rem] rounded-full bg-[#4ba5b9]/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 size-[30rem] rounded-full bg-[#53539b]/30 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[108rem] px-10">
        {/* Correo gigante, mismo estilo que la marca de abajo: tenue y
            recortado apenas por la línea inferior */}
        <div className="overflow-hidden border-b border-white/10 pt-12 md:pt-16">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="-mb-[0.22em] block font-heading text-[8.2vw] font-semibold leading-none tracking-tighter text-white/[0.05] transition-colors duration-300 hover:text-white/[0.12]"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Columnas */}
        <div className="grid gap-12 py-16 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element -- el proyecto usa <img> plano para assets estáticos */}
              <img src="/crabsense-logo-white.svg" alt="Crabsense" className="h-10 w-auto" />
            </Link>
            <p className="mt-6 font-heading text-lg font-extralight leading-snug text-white/60">
              Analytics, SEO y performance apoyados con IA para que tu negocio crezca con datos.
            </p>
          </div>

          <FooterColumn title="Servicios" links={SERVICE_LINKS} />
          <FooterColumn title="Explorar" links={EXPLORE_LINKS} />
          <FooterColumn title="Seguinos" links={SOCIAL_LINKS} external />
        </div>
      </div>

      {/* Marca gigante recortada abajo */}
      <div aria-hidden className="relative select-none overflow-hidden">
        <p className="-mb-[0.22em] text-center font-heading text-[19vw] font-semibold leading-none tracking-tighter text-white/[0.05]">
          crabsense
        </p>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[108rem] flex-col gap-2 px-10 py-6 text-xs text-white/40 md:flex-row md:justify-between">
          <p>© {year} Crabsense. Todos los derechos reservados.</p>
          <p>Hecho en Buenos Aires</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  external = false,
}: {
  title: string;
  links: { href: string; label: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-white/40">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            {external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-white/80 transition-colors hover:text-white"
              >
                {l.label}
                <ArrowUpRight className="size-3.5 opacity-50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </a>
            ) : (
              <Link href={l.href} className="text-white/80 transition-colors hover:text-white">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
