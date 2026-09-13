/**
 * cover_image_url y avatar_url son URLs arbitrarias que cualquier admin
 * puede tipear (no hay upload propio ni allowlist de dominios), así que no
 * podemos pasarlas por next/image sin arriesgarnos a romper imágenes de
 * hosts futuros no contemplados. Para el host que sí conocemos y que hoy
 * usan casi todos los posts de ejemplo (Unsplash, backend Imgix), pedimos
 * el formato moderno (WebP/AVIF según el Accept header del browser) vía su
 * propio parámetro de query — no afecta a ningún otro host, que se
 * devuelve sin tocar.
 */
export function optimizeExternalImageUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.hostname === "images.unsplash.com" && !parsed.searchParams.has("auto")) {
    parsed.searchParams.set("auto", "format");
    return parsed.toString();
  }

  return url;
}
