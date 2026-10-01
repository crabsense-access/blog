import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { buildOrganizationSchema } from "@/lib/structured-data";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={buildOrganizationSchema()} />
      <SiteHeader />
      {/* La página va por encima del footer (z-10 + fondo blanco): al llegar
          al final, el contenido sube y va descubriendo el footer, que está
          fijo abajo por detrás. */}
      <main className="relative z-10 flex-1 bg-white">{children}</main>
      <SiteFooter />
    </div>
  );
}
