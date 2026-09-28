"use client";

import { useEffect, useRef } from "react";

/**
 * "Solaris" con los colores de Crabsense: una esfera hecha de miles de
 * filamentos ondulados. Solo el contorno es visible, así que se ve como un
 * anillo fibroso que respira, con llamaradas arriba/abajo y donde pasa el
 * cursor. Al scrollear hacia abajo la esfera explota (ligado al scroll: si
 * volvés arriba se vuelve a armar).
 * Canvas 2D, sin dependencias. Respeta prefers-reduced-motion.
 */

const K_MAX = 1.08;
/** velocidad de las ondas de los filamentos (1 = original) */
const WAVE_SPEED = 0.18;
/** velocidad de giro del anillo (rad/s): una vuelta cada ~50 s */
const RING_SPEED = 0.125;
const MAX_SEG2 = 30 * 30;

type Theme = "light" | "dark";
type RGB = [number, number, number];

// arriba → abajo
const PALETTE_LIGHT: RGB[] = [
  [26, 150, 118],
  [36, 150, 165],
  [60, 140, 196],
  [72, 110, 190],
  [83, 83, 155],
  [61, 60, 137],
];
const PALETTE_DARK: RGB[] = [
  [120, 240, 190],
  [126, 222, 214],
  [110, 190, 235],
  [100, 150, 240],
  [122, 112, 244],
  [150, 110, 255],
];
/** Paleta de un solo color (con leves variaciones de luz, arriba más claro
 *  y abajo más oscuro) a partir de un hex, para usar el anillo con el color
 *  de una categoría. */
function monoPalette(hex: string): RGB[] {
  const n = parseInt(hex.replace("#", ""), 16);
  const base: RGB = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const mix = (t: number): RGB =>
    base.map((c) => Math.round(t >= 0 ? c + (255 - c) * t : c * (1 + t))) as RGB;
  return [mix(0.35), mix(0.22), mix(0.1), mix(0), mix(-0.1), mix(-0.2)];
}

const COLOR_BUCKETS = 14;
const LEVELS = 10;

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const ss = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

function lerpColor(t: number, pal: RGB[]) {
  const f = t * (pal.length - 1);
  const i = Math.min(pal.length - 2, Math.floor(f));
  const k = f - i;
  const a = pal[i];
  const b = pal[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(
    a[1] + (b[1] - a[1]) * k,
  )},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

const BG_CSS = `
.cs-orb-base{background:linear-gradient(180deg,#05070e 0%,#060814 55%,#05060c 100%)}
.cs-orb-aurora{position:absolute;will-change:transform;
  animation:cs-orb-drift 38s ease-in-out infinite alternate}
.cs-orb-aurora-a{width:62vmax;height:42vmax;left:-18vmax;top:-20vmax;
  background:radial-gradient(closest-side,rgba(126,203,214,.30),rgba(79,175,199,.12) 55%,rgba(0,0,0,0))}
.cs-orb-aurora-b{width:60vmax;height:44vmax;right:-20vmax;bottom:-22vmax;animation-duration:46s;animation-direction:alternate-reverse;
  background:radial-gradient(closest-side,rgba(122,112,224,.32),rgba(82,80,154,.14) 55%,rgba(0,0,0,0))}
.cs-orb-aurora-c{width:40vmax;height:28vmax;right:-6vmax;top:-12vmax;animation-duration:52s;
  background:radial-gradient(closest-side,rgba(160,236,214,.14),rgba(0,0,0,0))}
.cs-orb-halo{background:
  radial-gradient(34vmin 26vmin at 70% 56%,rgba(126,203,214,.16),rgba(0,0,0,0) 70%),
  radial-gradient(38vmin 28vmin at 70% 72%,rgba(122,112,224,.18),rgba(0,0,0,0) 70%)}
.cs-orb-grid{opacity:.5;
  background-image:radial-gradient(rgba(190,225,235,.16) 1px,transparent 1.2px);background-size:28px 28px;
  -webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 50%,transparent 25%,#000 60%,transparent 95%);
  mask-image:radial-gradient(ellipse 70% 60% at 50% 50%,transparent 25%,#000 60%,transparent 95%)}
.cs-orb-vignette{background:radial-gradient(ellipse 85% 75% at 50% 50%,rgba(0,0,0,0) 55%,rgba(2,3,8,.75) 100%)}
.cs-orb-grain{opacity:.035;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
.cs-orb-light .cs-orb-base{background:linear-gradient(180deg,#ffffff 0%,#fbfcfe 60%,#ffffff 100%)}
.cs-orb-light .cs-orb-aurora-a{background:radial-gradient(closest-side,rgba(126,203,214,.30),rgba(79,175,199,.10) 55%,rgba(255,255,255,0))}
.cs-orb-light .cs-orb-aurora-b{background:radial-gradient(closest-side,rgba(122,112,224,.22),rgba(83,83,155,.08) 55%,rgba(255,255,255,0))}
.cs-orb-light .cs-orb-aurora-c{background:radial-gradient(closest-side,rgba(105,232,160,.16),rgba(255,255,255,0))}
.cs-orb-light .cs-orb-halo{background:
  radial-gradient(34vmin 26vmin at 70% 56%,rgba(126,203,214,.16),rgba(255,255,255,0) 70%),
  radial-gradient(38vmin 28vmin at 70% 72%,rgba(122,112,224,.12),rgba(255,255,255,0) 70%)}
.cs-orb-light .cs-orb-grid{opacity:.6;background-image:radial-gradient(rgba(61,60,137,.14) 1px,transparent 1.2px)}
.cs-orb-light .cs-orb-vignette{background:radial-gradient(ellipse 90% 80% at 50% 50%,rgba(255,255,255,0) 60%,rgba(236,241,247,.6) 100%)}
.cs-orb-light .cs-orb-grain{opacity:.025}
@media (max-width:1023px){
  .cs-orb-halo,.cs-orb-light .cs-orb-halo{background-position:0 0;transform:translateX(-20%) translateY(4%)}
}
@keyframes cs-orb-drift{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(6vmax,4vmax,0) scale(1.08)}}
@media (prefers-reduced-motion:reduce){.cs-orb-aurora{animation:none}}
`;

export function HeroSolaris({
  className,
  theme = "light",
  anchorX = 0.7,
  anchorY = 0.55,
  size = 0.27,
  background = true,
  color,
  scrollExplode = true,
  stars: showStars = true,
  fixedAnchor = false,
}: {
  className?: string;
  /** "light" = fondo blanco (default) · "dark" = fondo oscuro */
  theme?: Theme;
  /** centro de la esfera en escritorio (fracción del ancho / alto) */
  anchorX?: number;
  anchorY?: number;
  /** radio de la esfera como fracción del lado más corto */
  size?: number;
  /** false = solo el anillo (canvas), sin las capas de fondo (aurora, halo,
   *  grilla de puntos, viñeta, grano): el hero queda con su propio fondo */
  background?: boolean;
  /** hex: dibuja el anillo en un solo color (ej. el de una categoría) */
  color?: string;
  /** false = el anillo no explota al scrollear */
  scrollExplode?: boolean;
  /** false = sin las estrellitas de fondo */
  stars?: boolean;
  /** true = usa anchorX/anchorY siempre (no solo en canvas >= 1024px) */
  fixedAnchor?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const light = theme === "light";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 768;

    // --- esfera: anillos de latitud (NLAT) × puntos por anillo (NLON) ---
    const NLAT = isSmall ? 80 : 140;
    const NLON = isSmall ? 160 : 200;
    const N = NLAT * NLON;
    const TH = new Float32Array(N); // latitud (desde el polo que mira a cámara)
    const PH = new Float32Array(N); // longitud
    for (let a = 0, n = 0; a < NLAT; a++) {
      // más densidad cerca del ecuador (que es lo que se ve como anillo)
      const q = (a + 0.5) / NLAT;
      const th = Math.PI / 2 + (q - 0.5) * Math.PI * 0.62;
      for (let b = 0; b < NLON; b++, n++) {
        TH[n] = th;
        PH[n] = ((b + (a % 2) * 0.5) / NLON) * Math.PI * 2;
      }
    }

    // dirección y velocidad de explosión (se re-sortean en cada ciclo)
    const DX = new Float32Array(N);
    const DY = new Float32Array(N);
    const DZ = new Float32Array(N);
    const SP = new Float32Array(N);
    const randomizeExplosion = () => {
      for (let n = 0; n < N; n++) {
        const st = Math.sin(TH[n]);
        let dx = st * Math.cos(PH[n]) + (Math.random() - 0.5) * 0.9;
        let dy = st * Math.sin(PH[n]) + (Math.random() - 0.5) * 0.9;
        let dz = Math.cos(TH[n]) + (Math.random() - 0.5) * 0.9;
        const l = Math.hypot(dx, dy, dz) || 1;
        dx /= l;
        dy /= l;
        dz /= l;
        DX[n] = dx;
        DY[n] = dy;
        DZ[n] = dz * 0.35;
        const r = Math.random();
        SP[n] = 0.6 + r * r * 4.5;
      }
    };
    randomizeExplosion();

    // --- explosión ligada al scroll ---
    // 0 = arriba de todo (esfera armada) · 1 = scrolleado el 45% del hero
    let scrollK = 0; // valor suavizado
    const scrollTarget = () => {
      const rect = canvas.getBoundingClientRect();
      const range = Math.max(1, rect.height * 0.45);
      // El hero sube por detrás del header (-mt-[--site-header-height]), así
      // que con la página arriba de todo el canvas ya arranca con top < 0.
      // Descontamos ese desfase inicial (top del canvas en el documento, si es
      // negativo) para que sin scroll la esfera esté armada (líneas) y no
      // medio explotada (puntos).
      const docTop = rect.top + window.scrollY;
      const scrolled = -rect.top + Math.min(0, docTop);
      // Zona muerta: los primeros px de scroll (un toque del trackpad, el
      // navegador restaurando la posición) no desarman la esfera — la
      // explosión es muy sensible al arrancar y con 5px ya se veía rota.
      const DEAD_ZONE = 80;
      return Math.min(1, Math.max(0, (scrolled - DEAD_ZONE) / range));
    };

    const pal = color ? monoPalette(color) : light ? PALETTE_LIGHT : PALETTE_DARK;
    const colors = Array.from({ length: COLOR_BUCKETS }, (_, i) =>
      lerpColor((i + 0.5) / COLOR_BUCKETS, pal),
    );

    // buffers por frame
    const PX = new Float32Array(N);
    const PY = new Float32Array(N);
    const PB = new Int16Array(N);
    const B = COLOR_BUCKETS * LEVELS;
    const dotCount = new Int32Array(B);
    const dotOff = new Int32Array(B);
    const dots = new Float32Array(N * 2);
    const segCount = new Int32Array(B);
    const segOff = new Int32Array(B);
    const segs = new Float32Array(N * 4);

    // estrellas
    const STARS = !showStars ? 0 : isSmall ? 50 : 110;
    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.45 + 0.1,
      s: Math.random() * 0.004 + 0.001,
      c: (light
        ? ["#6cc3b0", "#6fb8cc", "#8a86c9", "#9aa3c7"]
        : ["#bfeee4", "#9fd8e2", "#b8b2f2", "#dfe6ff"])[Math.floor(Math.random() * 4)],
    }));

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);

    // --- cursor: llamarada donde pasa el mouse cerca del anillo ---
    let pAng = 0;
    let pAmt = 0; // intensidad actual (se suaviza)
    let pTarget = 0;
    let lastCx = 0;
    let lastCy = 0;
    let lastR = 1;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - lastCx;
      const y = e.clientY - rect.top - lastCy;
      const d = Math.hypot(x, y);
      const near = 1 - Math.min(1, Math.abs(d - lastR) / (lastR * 0.6));
      pTarget = near;
      if (near > 0) pAng = Math.atan2(y, x);
    };
    const onLeave = () => {
      pTarget = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const start = performance.now();
    let raf = 0;
    let step = 1;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || w === 0) return;
      render(reduceMotion ? 2.5 : (now - start) / 1000);
    };

    const render = (time: number) => {
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const y = (s.y - time * s.s + 10) % 1;
        ctx.globalAlpha = s.a * Math.sin(Math.PI * y);
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x * w, y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const desktop = fixedAnchor || w >= 1024;
      const cx = desktop ? w * anchorX : w * 0.5;
      const cy = desktop ? h * anchorY : h * 0.62;
      const breath = 1 + 0.025 * Math.sin(time * 0.9);
      const R = Math.min(w, h) * size * breath;
      lastCx = cx;
      lastCy = cy;
      lastR = R;
      pAmt += (pTarget - pAmt) * 0.06;

      // suavizado para que la rueda del mouse no dé saltos
      if (!reduceMotion && scrollExplode) scrollK += (scrollTarget() - scrollK) * 0.12;
      if (scrollK < 0.0005) scrollK = 0;
      const k = K_MAX * easeOutCubic(scrollK);

      // orientación: el polo mira casi a cámara; gira despacio sobre sí mismo
      const tilt = 0.18 + 0.06 * Math.sin(time * 0.21);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const CAM = 5;
      // llamaradas fijas (arriba a la izquierda y a la derecha) que laten
      // las ondas avanzan a un tercio de la velocidad del resto de la animación
      const tw = time * WAVE_SPEED;
      // el giro también va lento: el dibujo de las hebras se desplaza con él
      const spin = tw * 0.1;
      // giro del anillo completo en el plano de la pantalla (hebras y
      // llamaradas giran juntas, sin deslizarse unas sobre otras)
      const rot = reduceMotion ? 0 : time * RING_SPEED;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const flareTop = 0.75 + 0.25 * Math.sin(tw * 1.3);
      const flareBot = 0.75 + 0.25 * Math.sin(tw * 1.1 + 2);

      PB.fill(-1);
      dotCount.fill(0);

      // con step > 1 se saltean anillos completos (nunca puntos sueltos), así
      // cada anillo dibujado conserva todos sus puntos vecinos
      for (let n = 0; n < N; n++) {
        if (Math.floor(n / NLON) % step) {
          n += NLON - 1 - (n % NLON);
          continue;
        }
        const th = TH[n];
        const ph = PH[n] + spin;
        const sth = Math.sin(th);
        // dirección unitaria en espacio esfera
        const ux = sth * Math.cos(ph);
        const uy0 = sth * Math.sin(ph);
        const uz0 = Math.cos(th);
        // inclinación leve sobre X
        const uy = uy0 * ct - uz0 * st;
        const uz = uy0 * st + uz0 * ct;

        // ángulo en pantalla y cercanía al borde (fresnel)
        const rim = 1 - Math.abs(uz);
        // lo que mira de frente es invisible: se descarta antes de calcular nada
        if (rim < 0.36) continue;
        const ang = Math.atan2(uy, ux);

        // ruido 3D suave → filamentos ondulados
        const nse =
          0.35 * Math.sin(3.1 * ux + 1.7 * uy0 + tw * 0.6) +
          0.25 * Math.sin(5.3 * uy0 - 2.9 * uz0 + tw * 0.9) +
          0.2 * Math.sin(7.7 * uz0 + 4.1 * ux - tw * 1.3);
        // hebras: cada anillo ondula distinto → filamentos que se cruzan
        const fib =
          Math.sin(9 * ph + 23 * th + tw * 1.2) * 0.6 +
          Math.sin(14 * ph - 31 * th - tw * 0.8) * 0.4 +
          Math.sin(27 * ph + 17 * th + tw * 2.1) * 0.25;

        // llamaradas: arriba (-π/2), abajo (π/2) y la del cursor
        // llamarada arriba a la izquierda (arriba la tapa la cabeza de la estatua)
        const dTop = Math.atan2(Math.sin(ang + 2.25), Math.cos(ang + 2.25));
        // segunda llamarada a la derecha (abajo la taparía la estatua)
        const dBot = Math.atan2(Math.sin(ang - 0.35), Math.cos(ang - 0.35));
        const dP = Math.atan2(Math.sin(ang + rot - pAng), Math.cos(ang + rot - pAng));
        const fl =
          flareTop * Math.exp(-(dTop * dTop) / 0.035) +
          flareBot * Math.exp(-(dBot * dBot) / 0.035) +
          pAmt * 1.2 * Math.exp(-(dP * dP) / 0.05);
        // picos de la llamarada anclados a la pantalla (no giran con la esfera)
        // y cambiando muy despacio → sin movimiento rápido en esas zonas
        const fk = 0.5 + 0.5 * Math.sin(40 * ang + tw * 0.8 + th * 29);
        const flick = fk * fk * fk;

        const rr = 1 + 0.03 * nse + 0.022 * fib + fl * (0.05 + 0.16 * flick);
        let x = ux * rr;
        let y = uy * rr;
        let z = uz * rr;
        if (k > 0) {
          const d = SP[n] * k;
          x += DX[n] * d;
          y += DY[n] * d;
          z += DZ[n] * d;
        }
        if (z > CAM - 0.4) continue;
        const p = CAM / (CAM - z);
        const ox = x * R * p;
        const oy = y * R * p;
        const sx = cx + ox * cr - oy * sr;
        const syo = ox * sr + oy * cr;
        const sy = cy + syo;
        if (sx < -30 || sx > w + 30 || sy < -30 || sy > h + 30) continue;

        // solo el contorno brilla (y más en las llamaradas)
        const r2 = rim * rim;
        const lvl = Math.min(1, r2 * r2 * rim * (1 + 2.2 * fl));
        if (lvl < 0.04) continue;
        const li = Math.min(LEVELS - 1, Math.floor(lvl * LEVELS));
        // el degradé de color queda fijo en pantalla (verde arriba, violeta abajo)
        const cpos = (syo / R + 1) / 2;
        const cb = cpos <= 0 ? 0 : cpos >= 1 ? COLOR_BUCKETS - 1 : Math.floor(cpos * COLOR_BUCKETS);
        const b = cb * LEVELS + li;
        PX[n] = sx;
        PY[n] = sy;
        PB[n] = b;
        dotCount[b]++;
      }

      // filamentos con la esfera armada; se vuelven puntos al empezar a explotar
      const lineA = 1 - ss(scrollK / 0.06);
      const dotA = 1 - lineA;
      ctx.globalCompositeOperation = light ? "multiply" : "lighter";

      // --- filamentos (líneas continuas por anillo de latitud) ---
      if (lineA > 0.001) {
        segCount.fill(0);
        for (let a = 0; a < NLAT; a++) {
          if (a % step) continue;
          const base = a * NLON;
          for (let q = 0; q < NLON; q++) {
            const n1 = base + q;
            const n2 = base + ((q + 1) % NLON);
            const b = PB[n1];
            if (b < 0 || PB[n2] < 0) continue;
            const ddx = PX[n2] - PX[n1];
            const ddy = PY[n2] - PY[n1];
            if (ddx * ddx + ddy * ddy <= MAX_SEG2) segCount[b]++;
          }
        }
        let acc = 0;
        for (let b = 0; b < B; b++) {
          segOff[b] = acc;
          acc += segCount[b];
        }
        segCount.fill(0);
        for (let a = 0; a < NLAT; a++) {
          if (a % step) continue;
          const base = a * NLON;
          for (let q = 0; q < NLON; q++) {
            const n1 = base + q;
            const n2 = base + ((q + 1) % NLON);
            const b = PB[n1];
            if (b < 0 || PB[n2] < 0) continue;
            const ddx = PX[n2] - PX[n1];
            const ddy = PY[n2] - PY[n1];
            if (ddx * ddx + ddy * ddy > MAX_SEG2) continue;
            const o = (segOff[b] + segCount[b]++) * 4;
            segs[o] = PX[n1];
            segs[o + 1] = PY[n1];
            segs[o + 2] = PX[n2];
            segs[o + 3] = PY[n2];
          }
        }
        ctx.lineCap = "round";
        for (let c = 0; c < COLOR_BUCKETS; c++) {
          ctx.strokeStyle = colors[c];
          for (let l = 0; l < LEVELS; l++) {
            const b = c * LEVELS + l;
            const count = segCount[b];
            if (!count) continue;
            const lv = (l + 0.5) / LEVELS;
            ctx.globalAlpha = Math.min(1, (light ? 0.9 : 0.8) * lv * lineA);
            ctx.lineWidth = 0.4 + lv * 0.45;
            ctx.beginPath();
            for (let q = 0; q < count; q++) {
              const o = (segOff[b] + q) * 4;
              ctx.moveTo(segs[o], segs[o + 1]);
              ctx.lineTo(segs[o + 2], segs[o + 3]);
            }
            ctx.stroke();
          }
        }
      }

      // --- puntos (explosión y rearmado) ---
      if (dotA > 0.001) {
        let acc = 0;
        for (let b = 0; b < B; b++) {
          dotOff[b] = acc;
          acc += dotCount[b];
        }
        dotCount.fill(0);
        for (let n = 0; n < N; n++) {
          const b = PB[n];
          if (b < 0) continue;
          const o = (dotOff[b] + dotCount[b]++) * 2;
          dots[o] = PX[n];
          dots[o + 1] = PY[n];
        }
        const fade = 1 - Math.min(1, k) * 0.25;
        for (let c = 0; c < COLOR_BUCKETS; c++) {
          ctx.fillStyle = colors[c];
          for (let l = 0; l < LEVELS; l++) {
            const b = c * LEVELS + l;
            const count = dotCount[b];
            if (!count) continue;
            const lv = (l + 0.5) / LEVELS;
            ctx.globalAlpha = Math.min(1, (light ? 0.75 : 0.7) * lv * fade * dotA);
            const s = 1.3 + lv * 1.2;
            ctx.beginPath();
            for (let q = 0; q < count; q++) {
              const o = (dotOff[b] + q) * 2;
              ctx.rect(dots[o] - s / 2, dots[o + 1] - s / 2, s, s);
            }
            ctx.fill();
          }
        }
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    // benchmark invisible para elegir la densidad una sola vez
    if (!reduceMotion) {
      const t0 = performance.now();
      for (let i = 0; i < 4; i++) render(1 + i * 0.016);
      const avg = (performance.now() - t0) / 4;
      step = avg > 24 ? 3 : avg > 12 ? 2 : 1;
      ctx.clearRect(0, 0, w, h);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [theme, anchorX, anchorY, size, color, scrollExplode, showStars, fixedAnchor]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${theme === "light" ? "cs-orb-light" : ""} ${className ?? ""}`}
    >
      {background && (
        <>
          <style>{BG_CSS}</style>
          <div className="cs-orb-base absolute inset-0" />
          <div className="cs-orb-aurora cs-orb-aurora-a" />
          <div className="cs-orb-aurora cs-orb-aurora-b" />
          <div className="cs-orb-aurora cs-orb-aurora-c" />
          <div className="cs-orb-halo absolute inset-0" />
          <div className="cs-orb-grid absolute inset-0" />
          <div className="cs-orb-vignette absolute inset-0" />
          <div className="cs-orb-grain absolute inset-0" />
        </>
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
