"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo del hero: estelas horizontales de luz (tipo "data streams") que
 * corren de izquierda a derecha a distintas velocidades, agrupadas en bandas,
 * con los colores de Crabsense y fondo transparente. Cada estela tiene la
 * cabeza más intensa y la cola que se desvanece. Canvas: solo anima mientras
 * el hero está visible.
 */

const COUNT = 140;
// violeta, índigo, verde azulado, celeste y violeta claro de la marca (RGB)
const COLORS: [number, number, number][] = [
  [83, 83, 155],
  [61, 60, 137],
  [63, 120, 126],
  [75, 165, 185],
  [125, 123, 208],
];
// bandas donde se concentran las estelas (fracción del alto) y su dispersión
const BANDS: [number, number][] = [
  [0.22, 0.06],
  [0.5, 0.08],
  [0.74, 0.05],
];

type Trail = {
  y: number; // fracción del alto
  x: number; // px (posición de la cabeza)
  len: number;
  speed: number; // px/s
  width: number;
  alpha: number;
  color: [number, number, number];
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
// normal aproximada (suma de uniformes)
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

function makeTrail(W: number, anywhere: boolean): Trail {
  const banded = Math.random() < 0.75;
  const [c, d] = BANDS[Math.floor(Math.random() * BANDS.length)];
  const y = banded ? c + gauss() * d : Math.random();
  const len = rand(60, 420);
  // las largas son más rápidas (sensación de velocidad)
  const speed = rand(40, 90) + len * rand(0.25, 0.6);
  return {
    y: Math.min(0.98, Math.max(0.02, y)),
    x: anywhere ? rand(-len, W + len) : -rand(0, W * 0.4),
    len,
    speed,
    width: Math.random() < 0.15 ? rand(1.6, 2.6) : rand(0.6, 1.4),
    alpha: rand(0.25, 0.7),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  };
}

export function HeroLightTrails({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const trails = Array.from({ length: COUNT }, () => makeTrail(W, true));
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      for (const t of trails) {
        const y = Math.round(t.y * H) + 0.5;
        const tail = t.x - t.len;
        if (t.x < 0 || tail > W) continue;
        const [r, g, b] = t.color;
        // se apagan un poco en los bordes laterales del hero
        const edge = Math.min(1, t.x / (W * 0.08), (W - tail) / (W * 0.08));
        const a = t.alpha * Math.max(0, edge);
        const grad = ctx.createLinearGradient(tail, 0, t.x, 0);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},${(a * 0.6).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${a.toFixed(3)})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = t.width;
        ctx.beginPath();
        ctx.moveTo(tail, y);
        ctx.lineTo(t.x, y);
        ctx.stroke();
      }
    };

    draw();
    if (reduce) return () => {
      ro.disconnect();
      io.disconnect();
    };

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      for (let i = 0; i < trails.length; i++) {
        const t = trails[i];
        t.x += t.speed * dt;
        if (t.x - t.len > W) trails[i] = makeTrail(W, false);
      }
      draw();
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
