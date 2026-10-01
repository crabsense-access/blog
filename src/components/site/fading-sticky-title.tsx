"use client";

import { useEffect, useRef } from "react";

/**
 * Título sticky que se va junto con un bloque de referencia: mientras la
 * columna fija (`[data-sticky-col]`) del bloque `followTargetId` está
 * pegada, el título queda quieto; en cuanto esa columna se suelta y empieza
 * a subir, el título sube exactamente lo mismo (se van los dos juntos).
 */
export function FadingStickyTitle({
  id,
  className,
  followTargetId,
  children,
}: {
  id?: string;
  className?: string;
  followTargetId: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const col = document.querySelector<HTMLElement>(`#${followTargetId} [data-sticky-col]`);
      if (!col || getComputedStyle(col).position !== "sticky") {
        el.style.transform = "";
        return;
      }
      const stickyTop = parseFloat(getComputedStyle(col).top) || 0;
      // < 0 cuando la columna ya se soltó y está subiendo
      const delta = Math.min(0, col.getBoundingClientRect().top - stickyTop);
      el.style.transform = delta ? `translateY(${delta}px)` : "";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [followTargetId]);

  return (
    <h2 ref={ref} id={id} className={className}>
      {children}
    </h2>
  );
}
