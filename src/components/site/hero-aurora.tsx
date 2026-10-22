"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo del hero: manchas chicas y difuminadas en los colores más oscuros
 * del logo de Crabsense, que recorren todo el hero (de lado a lado y de
 * arriba abajo) de forma aleatoria y muy lenta, sin detenerse. Solo se actualiza el transform de
 * cada div por frame (el blur lo resuelve la GPU). Con
 * prefers-reduced-motion quedan quietas.
 */

// Colores más oscuros del logo (public/crabsense-logo.svg)
const COLORS = ["#2c2b6b", "#2c5b60", "#3d3c89", "#3e787e"]; // versiones más oscuras de los colores del logo
// Celeste del logo (#4faec4, el del servicio ADS) en versión más oscura.
// Por ahora solo en escritorio (ver desktopAvoidBottom / isDesktop).
const DESKTOP_COLORS = [...COLORS, "#2f8094"];
const COUNT = 12;
// Difuminado moderado: bordes suaves pero se distingue el contorno ondulado.
const BLUR_PX = 8;
// Leve estiramiento (contrafase entre ejes) + giro lento: la forma "respira".
const STRETCH = 0.15;
// Forma de cada mancha: contorno orgánico tipo "blob" (lóbulos y entrantes
// suaves, estilo manchas de vaca / formas fluidas), generado al azar como un
// path SVG cerrado.
const BLOB_POINTS: [number, number] = [5, 7];
const MAX_SCALE = 1.2;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Trayectoria suave y sin pausas: suma de dos senoidales con frecuencias y
 * fases al azar por eje, así el recorrido no se repite de forma evidente.
 * Muy lento: cruzar el hero de lado a lado lleva más de un minuto.
 */
interface Blob {
  color: string;
  size: number; // vmax
  fx: [number, number];
  fy: [number, number];
  px: [number, number];
  py: [number, number];
  fs: number;
  ps: number;
  /** estiramiento (frecuencias y fases de cada eje) */
  fsx: number;
  fsy: number;
  psx: number;
  psy: number;
  /** rotación inicial (grados) y velocidad (grados/s, con signo) */
  rot0: number;
  vrot: number;
}

/**
 * Path SVG (viewBox 0 0 100 100) de una mancha orgánica: puntos alrededor del
 * centro con radios muy variables (lóbulos que salen y entrantes que se
 * meten), unidos con curvas suaves (Catmull-Rom → Bézier).
 */
const blobPath = () => {
  const n = BLOB_POINTS[0] + Math.floor(Math.random() * (BLOB_POINTS[1] - BLOB_POINTS[0] + 1));
  const pts: [number, number][] = [];
  for (let k = 0; k < n; k++) {
    const ang = (k / n) * Math.PI * 2 + rand(-0.2, 0.2);
    // lóbulos llenos y redondeados, con algún entrante suave al azar
    const r = Math.random() < 0.3 ? rand(24, 32) : rand(36, 47);
    pts.push([50 + Math.cos(ang) * r, 50 + Math.sin(ang) * r]);
  }
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const p0 = pts[(k - 1 + n) % n];
    const p1 = pts[k];
    const p2 = pts[(k + 1) % n];
    const p3 = pts[(k + 2) % n];
    const t = 1 / 4.2; // tensión: más alta = curvas más redondas y llenas
    d += ` C${f(p1[0] + (p2[0] - p0[0]) * t)},${f(p1[1] + (p2[1] - p0[1]) * t)} ${f(p2[0] - (p3[0] - p1[0]) * t)},${f(p2[1] - (p3[1] - p1[1]) * t)} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d} Z`;
};

const makeBlob = (i: number): Blob => ({
  color: COLORS[i % COLORS.length],
  size: rand(9, 17),
  fx: [rand(0.004, 0.007), rand(0.009, 0.014)],
  fy: [rand(0.005, 0.008), rand(0.01, 0.016)],
  px: [rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
  py: [rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
  fs: rand(0.008, 0.015),
  ps: rand(0, Math.PI * 2),
  fsx: rand(0.02, 0.045),
  fsy: rand(0.02, 0.045),
  psx: rand(0, Math.PI * 2),
  psy: rand(0, Math.PI * 2),
  rot0: rand(0, 360),
  vrot: rand(2, 6) * (Math.random() < 0.5 ? -1 : 1),
});

// Escala de tamaño de las manchas (1 = tamaño original, 9–17 vmax).
const SIZE_SCALE = 0.5;

// Tamaños fijos para el render del servidor; el movimiento (al azar) se
// arma recién en el cliente.
const SIZES = Array.from({ length: COUNT }, (_, i) => (9 + ((i * 7) % 9)) * SIZE_SCALE);

export function HeroAurora({
  className = "",
  desktopAvoidBottom = false,
}: {
  className?: string;
  /** escritorio (≥ 1024px): las manchas no llegan a tocar el borde de abajo */
  desktopAvoidBottom?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs = SIZES.map((size, i) => ({ ...makeBlob(i), size }));

    // Forma de cada mancha (al azar, solo en el cliente): un path SVG
    // orgánico relleno con el color de la mancha (--blob-c).
    refs.current.forEach((el) => {
      if (!el) return;
      el.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style="overflow:visible"><path d="${blobPath()}" fill="var(--blob-c)"/></svg>`;
    });
    const offset = rand(0, 600); // arranque en un punto al azar del recorrido

    let W = wrap.clientWidth;
    let H = wrap.clientHeight;
    // multiplicador de tamaño (--aurora-k) y si aplica el límite de abajo
    const readLayout = () => ({
      k: parseFloat(getComputedStyle(wrap).getPropertyValue("--aurora-k")) || 1,
      avoid: desktopAvoidBottom && window.innerWidth >= 1024,
      // escritorio del hero: paleta completa con el celeste de ADS
      palette: desktopAvoidBottom && window.innerWidth >= 1024 ? DESKTOP_COLORS : COLORS,
      vmax: Math.max(window.innerWidth, window.innerHeight) / 100,
    });
    let layout = readLayout();
    const ro = new ResizeObserver(() => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      layout = readLayout();
    });
    ro.observe(wrap);

    const place = (tSec: number) => {
      const t = tSec + offset;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const b = blobs[i];
        const nx = 0.65 * Math.sin(t * b.fx[0] * Math.PI * 2 + b.px[0]) + 0.35 * Math.sin(t * b.fx[1] * Math.PI * 2 + b.px[1]);
        const ny = 0.65 * Math.sin(t * b.fy[0] * Math.PI * 2 + b.py[0]) + 0.35 * Math.sin(t * b.fy[1] * Math.PI * 2 + b.py[1]);
        // La suma de senoidales pasa poco tiempo cerca de ±1 (se concentra en
        // el centro). Con una curva |n|^0.6 se "estira" hacia los extremos, así
        // las manchas recorren todo el hero: de lado a lado y de arriba abajo.
        const spread = (n: number) => Math.sign(n) * Math.pow(Math.abs(n), 0.6);
        const x = W * (0.5 + spread(nx) * 0.5);
        const s = 1 + (MAX_SCALE - 1) * Math.sin(t * b.fs * Math.PI * 2 + b.ps);
        // Con desktopAvoidBottom, el centro baja como máximo hasta donde la
        // parte visible de la mancha (≈70% del radio, + el blur) queda por
        // encima del borde inferior.
        const reach = layout.avoid
          ? (b.size / 2) * layout.vmax * layout.k * MAX_SCALE * (1 + STRETCH) * 0.7 + BLUR_PX * 2
          : 0;
        const yMax = Math.max(H * 0.3, H - reach);
        const y = layout.avoid
          ? yMax * (0.5 + spread(ny) * 0.5)
          : H * (0.5 + spread(ny) * 0.5);
        // estiramiento en contrafase: cuando un eje crece, el otro se achica
        const sx = s * (1 + STRETCH * Math.sin(t * b.fsx * Math.PI * 2 + b.psx));
        const sy = s * (1 - STRETCH * Math.sin(t * b.fsy * Math.PI * 2 + b.psy));
        const rot = b.rot0 + t * b.vrot;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
        el.style.setProperty("--blob-c", layout.palette[i % layout.palette.length]);
      });
    };

    const start = performance.now();
    place(0);
    if (reduceMotion) return () => ro.disconnect();

    let raf = 0;
    const loop = (now: number) => {
      place((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [desktopAvoidBottom]);

  return (
    <div ref={wrapRef} aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      {SIZES.map((size, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute left-0 top-0 opacity-90 will-change-transform"
          // --aurora-k: multiplicador opcional del tamaño de las manchas,
          // seteable desde afuera por breakpoint (ej. lg:[--aurora-k:1.5])
          style={{
            width: `calc(${size}vmax * var(--aurora-k, 1))`,
            height: `calc(${size}vmax * var(--aurora-k, 1))`,
            marginLeft: `calc(${size / 2}vmax * var(--aurora-k, 1) * -1)`,
            marginTop: `calc(${size / 2}vmax * var(--aurora-k, 1) * -1)`,
            filter: `blur(${BLUR_PX}px)`,
            transform: "translate3d(-9999px, 0, 0)",
          }}
        />
      ))}
    </div>
  );
}
