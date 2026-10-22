"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo del hero: cinta ondulada hecha de muchas líneas finas que se tuercen
 * (el ancho de la cinta cambia de signo a lo largo del recorrido, así se ve
 * el "giro"), con los colores de Crabsense y fondo transparente. La onda se
 * mueve muy lento. Canvas: se redibuja por frame solo mientras está visible.
 */

const LINES = 64;
const STEP = 10; // px entre muestras de cada línea

// degradado horizontal: violeta → índigo → verde azulado → celeste
const STOPS: [number, string][] = [
  [0, "rgba(83,83,155,0)"],
  [0.12, "rgba(83,83,155,0.55)"],
  [0.4, "rgba(61,60,137,0.7)"],
  [0.65, "rgba(63,120,126,0.65)"],
  [0.88, "rgba(75,165,185,0.6)"],
  [1, "rgba(75,165,185,0)"],
];

export function HeroWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let grad: CanvasGradient | null = null;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grad = ctx.createLinearGradient(0, 0, W, 0);
      for (const [o, c] of STOPS) grad.addColorStop(o, c);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const TAU = Math.PI * 2;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      if (!grad || !W) return;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.9;
      // mobile: la cinta un poco más baja (debajo del prompt queda más aire)
      const baseY = W < 768 ? 0.62 : 0.55;
      const amp = Math.min(H * 0.2, 190);
      const wid = Math.min(H * 0.17, 160);
      for (let i = 0; i < LINES; i++) {
        const s = i / (LINES - 1) - 0.5;
        ctx.globalAlpha = 0.35 + 0.65 * (1 - Math.abs(s) * 1.6);
        ctx.beginPath();
        for (let x = -STEP; x <= W + STEP; x += STEP) {
          const u = x / W;
          const center =
            H * baseY +
            amp * Math.sin(TAU * 0.85 * u + 0.9 + t * 0.12) +
            amp * 0.3 * Math.sin(TAU * 1.9 * u - t * 0.09);
          // el ancho pasa por cero → la cinta "se tuerce"
          const width = wid * Math.sin(TAU * 0.7 * u + 0.4 + t * 0.1);
          // leve desfase por línea: le da volumen a la torsión
          const y = center + width * s + Math.sin(TAU * 1.3 * u + s * 2.2 + t * 0.15) * 6;
          if (x === -STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const start = performance.now();
    draw(0);
    if (reduce) return () => {
      ro.disconnect();
      io.disconnect();
    };

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (visible) draw((now - start) / 1000);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
