"use client";

import { useEffect, useRef, useState } from "react";

// Texto de ejemplo (placeholder) — se puede ajustar más adelante.
const REVEAL_TEXT =
  "En este espacio vas a encontrar contenido pensado para ayudarte a tomar mejores decisiones: análisis de datos, estrategias de SEO, casos reales de marketing digital y todo lo que aprendemos trabajando con marcas todos los días.";

const WORDS = REVEAL_TEXT.split(" ");

// gris tenue -> color de texto sólido (gray-900), la misma escala que usa
// el resto del sitio para texto principal.
const DIM_RGB: [number, number, number] = [209, 213, 219];
const SOLID_RGB: [number, number, number] = [17, 24, 39];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Sección "scroll text reveal": un contenedor alto (300vh) con un texto
 * centrado en position: sticky adentro. Mientras el usuario scrollea a
 * través de ese alto, el texto queda fijo en el centro de la pantalla y
 * sus palabras se van iluminando progresivamente (de gris tenue a color
 * sólido), de izquierda a derecha y de arriba hacia abajo, en sincronía
 * con cuánto se scrolleó dentro del contenedor. Una vez agotada esa
 * altura extra, el sticky se libera solo (comportamiento nativo de CSS)
 * y la página sigue su scroll normal hacia el contenido siguiente.
 */
export function ScrollTextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    function update() {
      ticking = false;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(total > 0 ? clamp(scrolled / total, 0, 1) : 0);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-start justify-center px-6 pt-6 sm:pt-8 md:pt-10">
        <p className="font-heading mx-auto max-w-3xl text-center text-3xl font-normal leading-tight sm:text-5xl md:max-w-4xl md:text-[3.2rem]">
          {WORDS.map((word, i) => {
            const t = clamp(progress * WORDS.length - i, 0, 1);
            const color = `rgb(${lerp(DIM_RGB[0], SOLID_RGB[0], t)}, ${lerp(
              DIM_RGB[1],
              SOLID_RGB[1],
              t
            )}, ${lerp(DIM_RGB[2], SOLID_RGB[2], t)})`;

            return (
              <span key={i} style={{ color }}>
                {word}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
