"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Anillo "Solaris" del hero (mismo algoritmo, paleta y llamaradas que
 * src/components/site/hero-solaris.tsx), sin scroll ni cursor, para la
 * portada del tipo II. Se centra y dimensiona según el elemento `targetRef`
 * (el titular): ancho × padX, alto × padY, con un alto mínimo de
 * minRatio × ancho para que no quede demasiado ovalado.
 */
const LEVELS = 10;
const BUCKETS = 14;
const WAVE_SPEED = 0.18;
const RING_SPEED = 0.125;
const MAX_SEG2 = 30 * 30;
type RGB = [number, number, number];
const PAL_L: RGB[] = [[26, 150, 118], [36, 150, 165], [60, 140, 196], [72, 110, 190], [83, 83, 155], [61, 60, 137]];
const PAL_D: RGB[] = [[120, 240, 190], [126, 222, 214], [110, 190, 235], [100, 150, 240], [122, 112, 244], [150, 110, 255]];

function lerp(t: number, p: RGB[]) {
  const f = t * (p.length - 1);
  const i = Math.min(p.length - 2, Math.floor(f));
  const k = f - i;
  const a = p[i];
  const b = p[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

const NLAT = 140;
const NLON = 200;
const N = NLAT * NLON;
let geometry: { TH: Float32Array; PH: Float32Array } | null = null;
function getGeometry() {
  if (geometry) return geometry;
  const TH = new Float32Array(N);
  const PH = new Float32Array(N);
  for (let a = 0, n = 0; a < NLAT; a++) {
    const q = (a + 0.5) / NLAT;
    const th = Math.PI / 2 + (q - 0.5) * Math.PI * 0.62;
    for (let b = 0; b < NLON; b++, n++) {
      TH[n] = th;
      PH[n] = ((b + (a % 2) * 0.5) / NLON) * Math.PI * 2;
    }
  }
  geometry = { TH, PH };
  return geometry;
}
const COLS_L = Array.from({ length: BUCKETS }, (_, i) => lerp((i + 0.5) / BUCKETS, PAL_L));
const COLS_D = Array.from({ length: BUCKETS }, (_, i) => lerp((i + 0.5) / BUCKETS, PAL_D));

interface Frame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  dark: boolean;
  lineScale: number;
}

function makeRenderer() {
  const { TH, PH } = getGeometry();
  const B = BUCKETS * LEVELS;
  const PX = new Float32Array(N);
  const PY = new Float32Array(N);
  const PB = new Int16Array(N);
  const segCount = new Int32Array(B);
  const segOff = new Int32Array(B);
  const segs = new Float32Array(N * 4);

  return (ctx: CanvasRenderingContext2D, w: number, h: number, o: Frame, time: number) => {
    const light = !o.dark;
    const colors = light ? COLS_L : COLS_D;
    ctx.clearRect(0, 0, w, h);
    const breath = 1 + 0.025 * Math.sin(time * 0.9);
    const R = o.rx * breath;
    const ey = o.ry / o.rx;
    const tilt = 0.18 + 0.06 * Math.sin(time * 0.21);
    const ct = Math.cos(tilt);
    const st = Math.sin(tilt);
    const CAM = 5;
    const tw = time * WAVE_SPEED;
    const spin = tw * 0.1;
    const rot = time * RING_SPEED;
    const cr = Math.cos(rot);
    const sr = Math.sin(rot);
    const flareTop = 0.75 + 0.25 * Math.sin(tw * 1.3);
    const flareBot = 0.75 + 0.25 * Math.sin(tw * 1.1 + 2);
    PB.fill(-1);
    for (let n = 0; n < N; n++) {
      const th = TH[n];
      const ph = PH[n] + spin;
      const sth = Math.sin(th);
      const ux = sth * Math.cos(ph);
      const uy0 = sth * Math.sin(ph);
      const uz0 = Math.cos(th);
      const uy = uy0 * ct - uz0 * st;
      const uz = uy0 * st + uz0 * ct;
      const rim = 1 - Math.abs(uz);
      if (rim < 0.36) continue;
      const ang = Math.atan2(uy, ux);
      const nse =
        0.35 * Math.sin(3.1 * ux + 1.7 * uy0 + tw * 0.6) +
        0.25 * Math.sin(5.3 * uy0 - 2.9 * uz0 + tw * 0.9) +
        0.2 * Math.sin(7.7 * uz0 + 4.1 * ux - tw * 1.3);
      const fib =
        Math.sin(9 * ph + 23 * th + tw * 1.2) * 0.6 +
        Math.sin(14 * ph - 31 * th - tw * 0.8) * 0.4 +
        Math.sin(27 * ph + 17 * th + tw * 2.1) * 0.25;
      const dTop = Math.atan2(Math.sin(ang + 2.25), Math.cos(ang + 2.25));
      const dBot = Math.atan2(Math.sin(ang - 0.35), Math.cos(ang - 0.35));
      const fl = flareTop * Math.exp(-(dTop * dTop) / 0.035) + flareBot * Math.exp(-(dBot * dBot) / 0.035);
      const fk = 0.5 + 0.5 * Math.sin(40 * ang + tw * 0.8 + th * 29);
      const flick = fk * fk * fk;
      const rr = 1 + 0.03 * nse + 0.022 * fib + fl * (0.05 + 0.16 * flick);
      const x = ux * rr;
      const y = uy * rr;
      const z = uz * rr;
      if (z > CAM - 0.4) continue;
      const p = CAM / (CAM - z);
      const ox = x * R * p;
      const oy = y * R * p;
      const sx = o.cx + ox * cr - oy * sr;
      const syo = ox * sr + oy * cr;
      const sy = o.cy + syo * ey;
      const r2 = rim * rim;
      const lvl = Math.min(1, r2 * r2 * rim * (1 + 2.2 * fl));
      if (lvl < 0.04) continue;
      const li = Math.min(LEVELS - 1, Math.floor(lvl * LEVELS));
      const cpos = (syo / R + 1) / 2;
      const cb = cpos <= 0 ? 0 : cpos >= 1 ? BUCKETS - 1 : Math.floor(cpos * BUCKETS);
      PX[n] = sx;
      PY[n] = sy;
      PB[n] = cb * LEVELS + li;
    }
    const sc = o.lineScale;
    const maxSeg = MAX_SEG2 * sc * sc;
    ctx.globalCompositeOperation = light ? "multiply" : "lighter";
    segCount.fill(0);
    for (let pass = 0; pass < 2; pass++) {
      if (pass === 1) {
        let acc = 0;
        for (let b = 0; b < B; b++) {
          segOff[b] = acc;
          acc += segCount[b];
        }
        segCount.fill(0);
      }
      for (let a = 0; a < NLAT; a++) {
        const base = a * NLON;
        for (let q = 0; q < NLON; q++) {
          const n1 = base + q;
          const n2 = base + ((q + 1) % NLON);
          const b = PB[n1];
          if (b < 0 || PB[n2] < 0) continue;
          const dx = PX[n2] - PX[n1];
          const dy = PY[n2] - PY[n1];
          if (dx * dx + dy * dy > maxSeg) continue;
          if (pass === 0) {
            segCount[b]++;
            continue;
          }
          const off = (segOff[b] + segCount[b]++) * 4;
          segs[off] = PX[n1];
          segs[off + 1] = PY[n1];
          segs[off + 2] = PX[n2];
          segs[off + 3] = PY[n2];
        }
      }
    }
    ctx.lineCap = "round";
    for (let c = 0; c < BUCKETS; c++) {
      ctx.strokeStyle = colors[c];
      for (let l = 0; l < LEVELS; l++) {
        const b = c * LEVELS + l;
        const count = segCount[b];
        if (!count) continue;
        const lv = (l + 0.5) / LEVELS;
        ctx.globalAlpha = Math.min(1, (light ? 0.9 : 0.8) * lv);
        ctx.lineWidth = (0.4 + lv * 0.45) * sc;
        ctx.beginPath();
        for (let q = 0; q < count; q++) {
          const off = (segOff[b] + q) * 4;
          ctx.moveTo(segs[off], segs[off + 1]);
          ctx.lineTo(segs[off + 2], segs[off + 3]);
        }
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  };
}

interface SolarisRingProps {
  targetRef: RefObject<HTMLElement | null>;
  dark: boolean;
  className?: string;
  padX?: number;
  padY?: number;
  minRatio?: number;
  /** desplazamiento vertical del centro, como fracción del alto del lienzo */
  offY?: number;
}

export function SolarisRing({
  targetRef,
  dark,
  className,
  padX = 1.2,
  padY = 1.28,
  minRatio = 0.7,
  offY = 0.02,
}: SolarisRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const render = makeRenderer();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const r = canvas.getBoundingClientRect();
      const target = targetRef.current;
      if (!visible || !r.width || !target) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.round(r.width * dpr);
      const H = Math.round(r.height * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const b = target.getBoundingClientRect();
      const rx = (b.width / 2) * padX;
      const ry = Math.max((b.height / 2) * padY, rx * minRatio);
      render(
        ctx,
        r.width,
        r.height,
        {
          cx: b.left - r.left + b.width / 2,
          cy: b.top - r.top + b.height / 2 + r.height * offY,
          rx,
          ry,
          dark,
          lineScale: r.width / 540,
        },
        reduce ? 2.5 : (now - t0) / 1000,
      );
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [targetRef, dark, padX, padY, minRatio, offY]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
