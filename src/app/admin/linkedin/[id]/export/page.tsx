import { notFound } from "next/navigation";

import { LinkedInSlideView } from "@/components/linkedin/linkedin-slide";
import { UpdateSlideView } from "@/components/linkedin/update-slide";
import { UPDATE_SLIDE_COUNT, normalizeUpdateTemplate } from "@/lib/linkedin-update";
import { getLinkedInPostByIdForAdmin } from "@/lib/queries/linkedin";
import { PngDownloadButton } from "./png-download-button";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

// Vista para exportar: cada slide ocupa una página de 1080×1350 px.
// - Carrusel (PDF): Imprimir → Guardar como PDF (sin márgenes). El layout
//   del admin oculta la barra lateral al imprimir.
// - Carrusel (imágenes) / imagen única: botón que baja cada slide como PNG
//   (un ZIP si son varias).
export default async function ExportLinkedInPostPage({ params }: PageProps<"/admin/linkedin/[id]/export">) {
  const { id } = await params;
  const post = await getLinkedInPostByIdForAdmin(id);
  if (!post) notFound();

  const isUpdate = post.type === "product_update";
  const update = isUpdate ? normalizeUpdateTemplate(post.template_data, post.platform ?? "GA4") : null;
  const slides = post.format === "image" ? post.slides.slice(0, 1) : post.slides;
  const pageCount = update ? (post.format === "image" ? 1 : UPDATE_SLIDE_COUNT) : slides.length;
  const asImages = post.format === "image_carousel" || post.format === "image";
  const fileBase =
    post.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "linkedin";

  return (
    <div className="grid gap-6">
      <style>{`
        @page { size: 1080px 1350px; margin: 0; }
        @media print {
          html, body { background: #fff !important; }
          .li-export-page { width: 1080px !important; break-after: page; page-break-after: always; }
          .li-export-page:last-child { break-after: auto; page-break-after: auto; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        /* mientras se generan los PNG: cada slide a su tamaño real */
        html.li-exporting-png .li-export-page { width: 1080px !important; max-width: none !important; box-shadow: none !important; }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Exportar: {post.title}</h1>
          {asImages ? (
            <p className="text-sm text-muted-foreground">
              {pageCount} {pageCount === 1 ? "imagen" : "imágenes"} PNG de 1080×1350
              {pageCount > 1 && " (se descargan en un ZIP, numeradas en orden)"}. En LinkedIn, creá el post con{" "}
              <b>Agregar multimedia</b> y subí {pageCount === 1 ? "la imagen" : "todas las imágenes juntas, en orden"}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {pageCount} {pageCount === 1 ? "página" : "páginas"} de 1080×1350. En el diálogo de
              impresión elegí <b>Guardar como PDF</b>, márgenes <b>Ninguno</b> y activá <b>Gráficos de fondo</b>.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {asImages ? (
            <>
              <PngDownloadButton fileBase={fileBase} />
              <PrintButton />
            </>
          ) : (
            <>
              <PrintButton />
              <PngDownloadButton fileBase={fileBase} />
            </>
          )}
        </div>
      </div>

      {update ? (
        <div className="grid gap-6 print:block">
          {Array.from({ length: pageCount }, (_, i) => (
            <div key={i} className="li-export-page w-full max-w-[540px] shadow-md print:max-w-none print:shadow-none">
              <UpdateSlideView data={update} index={i} style={post.style} />
            </div>
          ))}
        </div>
      ) : slides.length === 0 ? (
        <p className="text-sm text-muted-foreground">Este post no tiene slides.</p>
      ) : (
        <div className="grid gap-6 print:block">
          {slides.map((slide, i) => (
            <div key={i} className="li-export-page w-full max-w-[540px] shadow-md print:max-w-none print:shadow-none">
              <LinkedInSlideView slide={slide} index={i} total={slides.length} style={post.style} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
