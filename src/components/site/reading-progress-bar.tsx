"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Barra de progreso de lectura: una línea fina pegada justo debajo del
 * menú sticky de categorías (post-categories-sticky-nav.tsx), que se va
 * rellenando de color a medida que el usuario scrollea la nota — el mismo
 * patrón que usa Google en sus artículos de ayuda (ver referencia del
 * pedido). Vive como último hijo de ese <nav> (que ya es sticky), así que
 * sube y baja pegada a él sin necesitar su propio cálculo de posición: si
 * el header principal se esconde y el nav sube a top:0, esta barra sube
 * con él en el mismo movimiento porque es parte del mismo elemento.
 *
 * A diferencia del propio <nav> (que respeta el ancho de contenido del
 * sitio, angosto), esta línea SÍ tiene que ocupar el 100% del ancho de la
 * pantalla -- por eso usa left-1/2 + w-screen + -translate-x-1/2 (el mismo
 * truco de "full-bleed" que ya se usa en client-logos-carousel.tsx) en vez
 * de heredar el ancho de <nav> con inset-x-0. Funciona sin importar cuán
 * angosto sea <nav> porque <nav> siempre está centrado (mx-auto) dentro
 * de la pantalla en las dos páginas donde se usa este componente.
 *
 * El progreso se mide sobre el scroll de toda la página (0% arriba del
 * todo, 100% al llegar al final del documento), igual que la mayoría de
 * las reading progress bars — no depende de conocer los límites exactos
 * del contenido del post.
 *
 * El color del relleno es el color de la categoría principal del post
 * (post.category.pill_color, pasado por post-categories-sticky-nav.tsx),
 * no un color fijo del sitio — así la barra queda asociada visualmente a
 * esa categoría, igual que el resto de sus pills.
 */
interface ReadingProgressBarProps {
  color?: string | null;
}

export function ReadingProgressBar({ color }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    function updateProgress() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, nextProgress)));
      ticking.current = false;
    }

    function handleScrollOrResize() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Progreso de lectura"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="absolute bottom-0 left-1/2 h-[3px] w-screen -translate-x-1/2 bg-border"
    >
      <div
        className="h-full bg-blue-600"
        style={{ width: `${progress}%`, backgroundColor: color || undefined }}
      />
    </div>
  );
}
