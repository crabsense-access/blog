import type { NextConfig } from "next";

// Único host permitido para next/image: el bucket público de Supabase
// Storage de este proyecto (portadas de posts, fotos de autor, fondos de
// categoría/subcategoría, logos de clientes). Nada de wildcards ni otros
// hosts — cover_image_url/avatar_url ya no aceptan URLs externas pegadas a
// mano, así que este es el único dominio del que el sitio sirve imágenes.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
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
