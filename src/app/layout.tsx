import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { getPublicSiteSettings } from "@/lib/queries/site-settings";

const googleSansFlex = Google_Sans_Flex({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Crabsense",
    template: "%s | Crabsense",
  },
  description: "Sitio institucional y blog de Crabsense.",
  // Para que Google Discover pueda mostrar la imagen de portada en su
  // tamaño más grande (sin esto, Discover puede recortarla o no mostrarla).
  robots: {
    "max-image-preview": "large",
  },
};

// Script de arranque de GTM: no carga el contenedor de entrada, solo deja
// listeners de interacción (o un fallback a los 1,5s) y recién ahí injecta
// el <script src="gtm.js">. Es intencionalmente inline y chico -- next/script
// con strategy="beforeInteractive" lo inyecta en el <head> del documento sin
// importar en qué parte del árbol de componentes esté (ver docs de
// next/script), así que se puede declarar acá aunque se use dentro de
// <body> más abajo.
function buildGtmBootstrapScript(gtmId: string) {
  return `
(function(w,d){
  var GTM_ID = ${JSON.stringify(gtmId)};
  var loaded = false;
  var events = ['scroll','mousemove','touchstart','keydown','click'];

  function loadGTM(){
    if (loaded) return;
    loaded = true;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
    var f = d.getElementsByTagName('script')[0], j = d.createElement('script');
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    f.parentNode.insertBefore(j, f);
    events.forEach(function(evt){ w.removeEventListener(evt, loadGTM); });
    clearTimeout(fallback);
  }

  events.forEach(function(evt){
    w.addEventListener(evt, loadGTM, {passive:true, once:true});
  });
  var fallback = setTimeout(loadGTM, 1500);
})(window, document);
`;
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // getPublicSiteSettings ya tiene su propio fallback (gtm_id: null) si la
  // consulta falla por cualquier motivo, así que nunca rompe el layout raíz
  // -- ni siquiera en /login o /admin, que también pasan por acá.
  const { gtm_id } = await getPublicSiteSettings();

  return (
    <html
      lang="es"
      className={`h-full antialiased ${googleSansFlex.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {gtm_id && (
          // Google Tag Manager (noscript) -- inmediatamente después de
          // abrir <body>, como pide Google para cuando JS está deshabilitado.
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtm_id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {gtm_id && (
          <Script id="gtm-deferred-bootstrap" strategy="beforeInteractive">
            {buildGtmBootstrapScript(gtm_id)}
          </Script>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
