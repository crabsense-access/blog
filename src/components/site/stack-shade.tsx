"use client";

import { useEffect, useRef } from "react";

/**
 * Sombreado progresivo de las cards apiladas (sticky): a medida que la card
 * siguiente se le sube encima, la de atrás se oscurece desde abajo.
 * Se coloca dentro del contenedor de las cards y actualiza la variable CSS
 * --cover (0 → 1) de cada card [data-stack-card]; el overlay de cada card usa
 * esa variable como opacidad. No renderiza nada visible.
 */
export function StackShade() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = ref.current?.parentElement;
    if (!container) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>("[data-stack-card]"),
      );
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) {
          card.style.setProperty("--cover", "0");
          return;
        }
        const h = card.offsetHeight;
        // distancia entre el borde superior de esta card y el de la siguiente:
        // >= alto de la card → todavía no la tapa; ~0 → ya está apilada encima
        const d = next.getBoundingClientRect().top - card.getBoundingClientRect().top;
        const progress = Math.min(1, Math.max(0, (h - d) / (h * 0.85)));
        card.style.setProperty("--cover", progress.toFixed(3));
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <span ref={ref} aria-hidden className="hidden" />;
}
