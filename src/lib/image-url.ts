// Anchos servidos en el srcset de Unsplash para la imagen de portada
// (el elemento LCP de la página del post). Cubre desde mobile angosto
// hasta un monitor grande a 2x DPR sin pedir de más en el resto de casos.
const UNSPLASH_RESPONSIVE_WIDTHS = [480, 768, 1080, 1600];

/**
 * cover_image_url y avatar_url son URLs arbitrarias que cualquier admin
 * puede tipear (no hay upload propio ni allowlist de dominios), así que no
 * podemos pasarlas por next/image sin arriesgarnos a romper imágenes de
 * hosts futuros no contemplados. Para el host que sí conocemos y que hoy
 * usan casi todos los posts de ejemplo (Unsplash, backend Imgix), pedimos
 * el formato moderno (WebP/AVIF según el Accept header del browser) y un
 * srcset responsive vía sus propios parámetros de query — no afecta a
 * ningún otro host, que se devuelve sin tocar.
 */
export function optimizeExternalImageUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;

  if (parsed.hostname === "images.unsplash.com" && !parsed.searchParams.has("auto")) {
    parsed.searchParams.set("auto", "format");
    return parsed.toString();
  }

  return url;
}

export interface ResponsiveImage {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * Devuelve src + srcset/sizes para que el browser pida una imagen del
 * ancho que realmente necesita en cada viewport, en vez de siempre bajar
 * la versión de 1200px (que en mobile se muestra a una fracción de ese
 * ancho). `sizes="100vw"` porque la imagen de portada siempre ocupa el
 * ancho completo de su contenedor (w-full).
 */
export function getResponsiveCoverImage(url: string): ResponsiveImage {
  const optimized = optimizeExternalImageUrl(url);
  const parsed = parseUrl(optimized);

  if (!parsed || parsed.hostname !== "images.unsplash.com") {
    return { src: optimized };
  }

  const srcSet = UNSPLASH_RESPONSIVE_WIDTHS.map((width) => {
    const variant = new URL(parsed.toString());
    variant.searchParams.set("w", String(width));
    return `${variant.toString()} ${width}w`;
  }).join(", ");

  return { src: optimized, srcSet, sizes: "100vw" };
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
