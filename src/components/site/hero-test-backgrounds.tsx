"use client";

import dynamic from "next/dynamic";

// Fondos de prueba del hero (/?hero=gradient|manchas|lineas|estelas|onda).
// Se cargan con next/dynamic desde un Client Component para que su JS quede
// en chunks aparte y solo se descargue cuando se pide la prueba: importados
// directo en la home (Server Component) entraban todos en el bundle de cada
// visita aunque no se rendericen.
export const HeroGradientTest = dynamic(() =>
  import("@/components/site/hero-gradient").then((m) => m.HeroGradient),
);
export const HeroLinesTest = dynamic(() => import("@/components/site/hero-lines").then((m) => m.HeroLines));
export const HeroStreaksTest = dynamic(() =>
  import("@/components/site/hero-streaks").then((m) => m.HeroStreaks),
);
export const HeroWaveTest = dynamic(() => import("@/components/site/hero-wave").then((m) => m.HeroWave));
