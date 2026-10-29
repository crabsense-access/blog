import type { NextConfig } from "next";

// Único host permitido para next/image: el bucket público de Supabase
// Storage de este proyecto (portadas de posts, fotos de autor, fondos de
// categoría/subcategoría, logos de clientes). Nada de wildcards ni otros
// hosts — cover_image_url/avatar_url ya no aceptan URLs externas pegadas a
// mano, así que este es el único dominio del que el sitio sirve imágenes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // Los formularios del admin suben imágenes por Server Actions (hasta 5MB
  // cada una, ver src/lib/storage.ts). El límite por defecto de Next es
  // 1MB por request, y el form de casos de éxito puede mandar dos imágenes
  // (fondo + logo), así que se sube a 12MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
    // CSS en un <style> dentro del HTML en vez de <link>: elimina la request
    // que bloqueaba el render (PageSpeed: "Render-blocking requests"). Con
    // Tailwind el CSS es chico, así que no infla mucho el HTML.
    inlineCss: true,
  },
  // Imágenes fijas de /public que se ven en todas las cargas (estatua del
  // hero, logo del header). Vercel sirve /public con max-age=0; con esto el
  // navegador las guarda un año. OJO: si se reemplaza alguna, subirla con
  // otro nombre (o el que ya la tiene en caché va a seguir viendo la vieja).
  async headers() {
    return [
      {
        source: "/:file(hero-estatua\\.webp|crabsense-logo\\.svg|crabsense-logo-white\\.svg)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  images: {
    // Los archivos de Storage tienen nombre único por subida (timestamp +
    // sufijo aleatorio), así que la versión optimizada se puede cachear un
    // año. Supabase los sirve con max-age de 1h (PageSpeed: "Use efficient
    // cache lifetimes").
    minimumCacheTTL: 31536000,
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
