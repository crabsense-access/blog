"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo del hero: manchas chicas y difuminadas en los colores más oscuros
 * del logo de Crabsense, que recorren todo el hero de forma aleatoria y muy
 * lenta, sin detenerse. Nunca llegan al borde inferior del hero (así no se
 * ve un corte al terminar la sección). Solo se actualiza el transform de
 * cada div por frame (el blur lo resuelve la GPU). Con
 * prefers-reduced-motion quedan quietas.
 */

// Colores más oscuros del logo (public/crabsense-logo.svg)
const COLORS = ["#3d3c89", "#3e787e", "#53539b", "#579191"];
const COUNT = 12;
const BLUR_PX = 48;
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
}

const makeBlob = (i: number): Blob => ({
  color: COLORS[i % COLORS.length],
  size: rand(9, 17),
  fx: [rand(0.004, 0.007), rand(0.009, 0.014)],
  fy: [rand(0.005, 0.008), rand(0.01, 0.016)],
  px: [rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
  py: [rand(0, Math.PI * 2), rand(0, Math.PI * 2)],
  fs: rand(0.008, 0.015),
  ps: rand(0, Math.PI * 2),
});

// Tamaños fijos para el render del servidor; el movimiento (al azar) se
// arma recién en el cliente.
const SIZES = Array.from({ length: COUNT }, (_, i) => 9 + ((i * 7) % 9));

export function HeroAurora({ className = "" }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blobs = SIZES.map((size, i) => ({ ...makeBlob(i), size }));
    const offset = rand(0, 600); // arranque en un punto al azar del recorrido

    let W = wrap.clientWidth;
    let H = wrap.clientHeight;
    let vmax = Math.max(window.innerWidth, window.innerHeight) / 100;
    const ro = new ResizeObserver(() => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      vmax = Math.max(window.innerWidth, window.innerHeight) / 100;
    });
    ro.observe(wrap);

    const place = (tSec: number) => {
      const t = tSec + offset;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const b = blobs[i];
        const nx = 0.65 * Math.sin(t * b.fx[0] * Math.PI * 2 + b.px[0]) + 0.35 * Math.sin(t * b.fx[1] * Math.PI * 2 + b.px[1]);
        const ny = 0.65 * Math.sin(t * b.fy[0] * Math.PI * 2 + b.py[0]) + 0.35 * Math.sin(t * b.fy[1] * Math.PI * 2 + b.py[1]);
        // Radio visible de la mancha (gradiente + blur) a escala máxima
        const r = (b.size * vmax * 0.5) * 0.75 * MAX_SCALE + BLUR_PX * 2;
        // X: todo el ancho (puede asomar por los costados).
        // Y: desde arriba hasta que el borde de la mancha quede por encima
        // del fondo del hero.
        const minY = H * 0.05;
        const maxY = Math.max(minY, H - r);
        const x = W * (0.5 + nx * 0.52);
        const y = minY + (maxY - minY) * (0.5 + ny * 0.5);
        const s = 1 + (MAX_SCALE - 1) * Math.sin(t * b.fs * Math.PI * 2 + b.ps);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        el.style.background = `radial-gradient(circle at center, ${b.color} 0%, ${b.color}cc 35%, transparent 70%)`;
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
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      {SIZES.map((size, i) => (
        <div
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="absolute left-0 top-0 rounded-full opacity-45 will-change-transform"
          style={{
            width: `${size}vmax`,
            height: `${size}vmax`,
            marginLeft: `-${size / 2}vmax`,
            marginTop: `-${size / 2}vmax`,
            filter: `blur(${BLUR_PX}px)`,
            transform: "translate3d(-9999px, 0, 0)",
          }}
        />
      ))}
    </div>
  );
}
