// Anchos que acepta el optimizador de imágenes de Next (/_next/image).
// Los usa next.config.ts y también los helpers de src/lib/image-url.ts
// (un `w` fuera de estas listas da 400). imageSizes suma pasos intermedios
// (160-576) a los de Next por defecto para que las imágenes chicas del sitio
// (logos a 40px de alto, figuras de servicios, estatua del hero) se pidan
// casi al tamaño en que se muestran (PageSpeed: "Improve image delivery").
export const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 160, 192, 256, 320, 384, 448, 512, 576];
export const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
