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

// Anchos que acepta el optimizador de Next (/_next/image): la unión de los
// imageSizes y deviceSizes por defecto. Un `w` fuera de esta lista da 400.
const NEXT_IMAGE_WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

const SUPABASE_HOST = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/** Ancho permitido más chico que sea >= `width` (o el máximo). */
export function nextImageWidth(width: number): number {
  return NEXT_IMAGE_WIDTHS.find((w) => w >= width) ?? NEXT_IMAGE_WIDTHS[NEXT_IMAGE_WIDTHS.length - 1];
}

/**
 * Pasa una imagen pública de Supabase Storage por el optimizador de Next
 * (mismo endpoint que usa next/image): la devuelve redimensionada al ancho
 * pedido, en WebP/AVIF según el navegador y con caché larga
 * (images.minimumCacheTTL). Sirve para los <img> planos del sitio que no
 * pueden usar next/image (CutoutImage, marquee de logos). Cualquier otro
 * host se devuelve sin tocar.
 */
export function optimizedStorageImage(url: string, width: number): string {
  const parsed = parseUrl(url);
  if (
    !parsed ||
    !SUPABASE_HOST ||
    parsed.hostname !== SUPABASE_HOST ||
    !parsed.pathname.startsWith("/storage/v1/object/public/")
  ) {
    return url;
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${nextImageWidth(width)}&q=75`;
}
