"use client";

import { useEffect, useRef } from "react";

/**
 * Esfera de partículas (toroide deformado) con los colores de Crabsense.
 * - Los anillos giran a distintas velocidades.
 * - Loop: se forma → 5 s estable → explota → se vuelve a formar.
 * Renderizado en canvas 2D, sin dependencias. Respeta prefers-reduced-motion.
 */

// Tiempos del loop (segundos)
const T_REFORM = 0.9; // rearmado rápido
const T_FORM = 5;
const T_EXPLODE = 1.6;
const T_HOLD = 0.9;
const T_CYCLE = T_REFORM + T_FORM + T_EXPLODE + T_HOLD;
const K_MAX = 1.08;
const STRETCH_X = 1.65; // bien ovalada en horizontal
const LINE_EVERY = 1;
const MAX_SEG2 = 40 * 40; // segmentos más largos (puntos separados) no se dibujan // cada cuántos anillos se dibuja una línea continua
const TUBE = 0.47; // grosor del anillo

// Paleta Crabsense adaptada a fondo oscuro (arriba → abajo)
// Paleta para fondo blanco: tonos más profundos/saturados de Crabsense
const PALETTE_LIGHT: [number, number, number][] = [
  [34, 168, 128], // verde (arriba)
  [40, 160, 170], // verde azulado
  [79, 174, 196], // #4FAEC4
  [72, 128, 196], // azul transición
  [83, 83, 155], // #53539B
  [61, 60, 137], // #3D3C89 (abajo)
];

type Theme = "light" | "dark";

const PALETTE: [number, number, number][] = [
  [105, 232, 160], // verde (arriba)
  [118, 226, 196], // menta/celeste
  [126, 203, 214], // #7ECBD6
  [95, 160, 225], // azul transición
  [112, 110, 240], // violeta
  [135, 100, 250], // violeta brillante (abajo)
]
const COLOR_BUCKETS = 14;
const DEPTH_LEVELS = 8; // más niveles = transiciones de brillo sin saltos

const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInOutCubic = (x: number) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

function lerpColor(t: number, pal: [number, number, number][]) {
  const f = t * (pal.length - 1);
  const i = Math.min(pal.length - 2, Math.floor(f));
  const k = f - i;
  const a = pal[i];
  const b = pal[i + 1];
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(
    a[1] + (b[1] - a[1]) * k,
  )},${Math.round(a[2] + (b[2] - a[2]) * k)})`;
}

/** Factor de dispersión (0 = figura, 1 = explotada) según el momento del loop */
function scatterAt(time: number) {
  const t = time % T_CYCLE;
  // arranca exactamente donde terminó el "hold" del ciclo anterior → sin saltos
  if (t < T_REFORM) return K_MAX * (1 - easeInOutCubic(t / T_REFORM));
  if (t < T_REFORM + T_FORM) return 0;
  if (t < T_REFORM + T_FORM + T_EXPLODE)
  {
    const x = (t - T_REFORM - T_FORM) / T_EXPLODE;
    // arranque suavizado (~100 ms) para que el estallido no se vea como un parpadeo
    const ramp = x < 0.065 ? (x / 0.065) * (x / 0.065) * (3 - 2 * (x / 0.065)) : 1;
    return easeOutExpo(x) * ramp;
  }
  // hold: sigue expandiéndose un poquito y frena suave hasta K_MAX
  const h = Math.min(1, (t - T_REFORM - T_FORM - T_EXPLODE) / T_HOLD);
  return 1 + (K_MAX - 1) * Math.sin((h * Math.PI) / 2);
}

/** Brillo extra de las partículas al explotar (0..1). Curva sin² → arranca y
 *  termina con pendiente 0, sin saltos de un frame a otro. */
function flashAt(time: number) {
  const t = (time % T_CYCLE) - T_REFORM - T_FORM;
  if (t <= 0 || t >= 0.8) return 0;
  const s = Math.sin((Math.PI * t) / 0.8);
  return s * s;
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

export function HeroParticleOrb({
  className,
  theme = "light",
  anchorX = 0.7,
  anchorY = 0.64,
  clipHalf,
}: {
  className?: string;
  /** posición del centro de la figura en escritorio (fracción del ancho/alto) */
  anchorX?: number;
  anchorY?: number;
  /** en escritorio, muestra solo una mitad de la figura: "top" = arco (∩), "bottom" = cuenco (∪) */
  clipHalf?: "top" | "bottom";
  /** "light" = fondo blanco (default) · "dark" = fondo oscuro */
  theme?: Theme;
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

    // --- Partículas del toroide ---
    const NU = isSmall ? 170 : 280; // alrededor del eje principal
    const NV = isSmall ? 56 : 84; // alrededor del tubo
    const N = NU * NV;
    const U = new Float32Array(N);
    const V = new Float32Array(N);
    const DX = new Float32Array(N); // dirección de explosión
    const DY = new Float32Array(N);
    const DZ = new Float32Array(N);
    const SP = new Float32Array(N); // velocidad de explosión
    // posición en pantalla y bucket de cada punto (para unirlos en líneas)
    const PX = new Float32Array(N);
    const PY = new Float32Array(N);
    const PB = new Int16Array(N);
    const segCount = new Int32Array(COLOR_BUCKETS * DEPTH_LEVELS);
    const segOff = new Int32Array(COLOR_BUCKETS * DEPTH_LEVELS);
    const segs = new Float32Array(Math.ceil(N / LINE_EVERY) * 4);

    for (let i = 0, n = 0; i < NU; i++) {
      for (let j = 0; j < NV; j++, n++) {
        const u = ((i + (j % 2) * 0.5) / NU) * Math.PI * 2;
        const v = (j / NV) * Math.PI * 2;
        U[n] = u;
        V[n] = v;
      }
    }

    // Direcciones de explosión: se re-sortean en cada ciclo (mientras la
    // figura está formada, así el cambio es invisible) para que ninguna
    // explosión sea idéntica a la anterior.
    const randomizeExplosion = () => {
      for (let n = 0; n < N; n++) {
        const u = U[n];
        const v = V[n];
        const bx = Math.cos(u) * (1 + TUBE * Math.cos(v));
        const by = Math.sin(u) * (1 + TUBE * Math.cos(v));
        const bz = TUBE * Math.sin(v);
        const dx = bx + (Math.random() - 0.5) * 1.6;
        const dy = by + (Math.random() - 0.5) * 1.6;
        const dz = bz + (Math.random() - 0.5) * 1.6;
        const len = Math.hypot(dx, dy, dz) || 1;
        DX[n] = dx / len;
        DY[n] = dy / len;
        DZ[n] = (dz / len) * 0.35; // poca profundidad: nunca cruzan la cámara
        const r = Math.random();
        SP[n] = 0.8 + r * r * 6;
      }
    };
    randomizeExplosion();
    let lastCycle = 0;

    const colors = Array.from({ length: COLOR_BUCKETS }, (_, i) =>
      lerpColor((i + 0.5) / COLOR_BUCKETS, light ? PALETTE_LIGHT : PALETTE),
    );

    // Buckets reutilizables (coordenadas x,y,size) por color*profundidad
    const B = COLOR_BUCKETS * DEPTH_LEVELS;
    const bx = Array.from({ length: B }, () => new Float32Array(N * 3));
    const bc = new Int32Array(B);

    // --- Estrellas de fondo ---
    const STARS = isSmall ? 70 : 140;
    const stars = Array.from({ length: STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.45 + 0.1,
      c: (light
        ? ["#6cc3b0", "#6fb8cc", "#8a86c9", "#9aa3c7"]
        : ["#bfeee4", "#9fd8e2", "#b8b2f2", "#dfe6ff"])[Math.floor(Math.random() * 4)],
      s: Math.random() * 0.004 + 0.001,
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

    const start = performance.now();
    let raf = 0;
    // Calidad: se decide UNA sola vez al montar (benchmark corto, invisible).
    // Antes se ajustaba en vivo y el cambio de cantidad de partículas se veía
    // como un parpadeo.
    let step = 1;
    let offX = 0;
    let offY = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible || w === 0) return;
      render(reduceMotion ? 3.5 : (now - start) / 1000);
    };

    const render = (time: number) => {

      ctx.clearRect(0, 0, w, h);

      // estrellas
      for (const s of stars) {
        const y = (s.y - time * s.s + 10) % 1;
        // se desvanecen en los bordes → no aparecen/desaparecen de golpe
        ctx.globalAlpha = s.a * Math.sin(Math.PI * y);
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x * w, y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // centrada en la pantalla: se corrige el pequeño corrimiento que genera
      // la perspectiva usando el bounding box real de la figura formada
      // posición: abajo a la derecha en escritorio, centrada abajo en mobile
      const ancX = w >= 1024 ? w * anchorX : w * 0.5;
      const ancY = w >= 1024 ? h * anchorY : h * 0.68;
      const cx = ancX - offX;
      const cy = ancY - offY;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const scale = Math.min(w, h) * 0.175;
      const k = reduceMotion ? 0 : scatterAt(time);
      const cycle = Math.floor(time / T_CYCLE);
      const tc = time - cycle * T_CYCLE;
      if (!reduceMotion && cycle !== lastCycle && tc > T_REFORM && tc < T_REFORM + T_FORM) {
        lastCycle = cycle;
        randomizeExplosion();
      }

      // rotación global suave (tumble)
      const ax = 0.24 + Math.sin(time * 0.23) * 0.08;
      const ay = -0.18 + Math.sin(time * 0.17) * 0.18;
      const az = time * 0.05;
      const cax = Math.cos(ax), sax = Math.sin(ax);
      const cay = Math.cos(ay), say = Math.sin(ay);
      const caz = Math.cos(az), saz = Math.sin(az);
      const CAM = 4.2;

      bc.fill(0);

      for (let n = 0; n < N; n += step) {
        PB[n] = -1;
        const v = V[n];
        // cada "anillo" (según v) gira a una velocidad distinta
        const speed = 0.12 + 0.32 * (0.5 + 0.5 * Math.sin(v * 2 + 1));
        const u = U[n] + time * speed;
        // deformación suave del tubo: pocas ondulaciones amplias, sin picos
        // lóbulos redondeados alrededor del anillo (borde festoneado como la
        // referencia) + arrugas suaves a lo largo del tubo
        const l = 0.5 + 0.5 * Math.sin(4 * u + time * 0.5 + 1.5 * Math.sin(v + time * 0.3));
        // amplitud irregular: cada lóbulo tiene un tamaño distinto y va cambiando
        const irregular = 0.55 + 0.45 * Math.sin(3 * u - time * 0.35 + 1.3) * Math.sin(2 * v + u + time * 0.25);
        // los bultos crecen hacia afuera y sobre la cara frontal; en el borde
        // interior casi nada, así el agujero queda redondo
        const outer = 0.5 + 0.5 * Math.cos(v);
        const lobes = 0.32 * (0.35 * l + 0.65 * l * l) * irregular * outer;
        const bulge = 0.1 * Math.sin(2 * u + 1.5 * v + time * 0.3) * outer;
        // algunos picos que sobresalen (pocos y marcados), girando despacio
        const sp = Math.sin(2 * u + time * 0.6) * Math.sin(2 * v - time * 0.4 + 0.8);
        const sp2 = sp * sp;
        const spikes = 0.24 * sp2 * sp2 * sp2 * outer;
        // pequeñas ondas que recorren la superficie
        const waves =
          0.025 * Math.sin(6 * v + 4 * u - time * 0.9) +
          0.02 * Math.sin(5 * u - 3 * v + time * 0.7);
        const r = TUBE * (1 + lobes + bulge + spikes + waves);
        const R = 1 + r * Math.cos(v);
        let x = R * Math.cos(u);
        let y = R * Math.sin(u);
        let z = r * Math.sin(v);

        // explosión
        if (k > 0) {
          const d = SP[n] * k;
          x += DX[n] * d;
          y += DY[n] * d;
          z += DZ[n] * d;
        }

        // rotaciones Z, X, Y
        let t1 = x * caz - y * saz;
        y = x * saz + y * caz;
        x = t1;
        t1 = y * cax - z * sax;
        z = y * sax + z * cax;
        y = t1;
        t1 = x * cay + z * say;
        z = -x * say + z * cay;
        x = t1;

        if (z > CAM - 0.4) continue;
        const p = CAM / (CAM - z);
        const sx = cx + x * scale * p * STRETCH_X;
        const sy = cy + y * scale * p;
        if (sx < minX) minX = sx;
        if (sx > maxX) maxX = sx;
        if (sy < minY) minY = sy;
        if (sy > maxY) maxY = sy;
        if (sx < -4 || sx > w + 4 || sy < -4 || sy > h + 4) continue;

        // profundidad → nivel de brillo
        // brillo: los bordes (superficie de canto) brillan más y la cara que mira
        // de frente queda más oscura → sensación de volumen como la referencia.
        const cv = Math.cos(v);
        const nx = cv * Math.cos(u);
        const ny = cv * Math.sin(u);
        const nz = Math.sin(v);
        const nx1 = nx * caz - ny * saz;
        const ny1 = nx * saz + ny * caz;
        const nz2 = (ny1 * sax + nz * cax);
        const nz3 = -nx1 * say + nz2 * cay;
        // el borde interior (agujero) brilla menos que el exterior
        const rim = (1 - Math.abs(nz3)) * (0.5 + 0.5 * outer);
        const depthN = Math.min(1, Math.max(0, (z + 1.8) / 3.6));
        // misma iluminación durante la explosión → sin saltos de brillo
        const light = 0.3 * depthN + 0.7 * rim;
        const depth = Math.min(DEPTH_LEVELS - 1, Math.floor(light * DEPTH_LEVELS));
        // color según la altura en pantalla: arriba menta/celeste, abajo violeta
        const ct = (y / 1.8 + 1) / 2;
        const cb = ct <= 0 ? 0 : ct >= 1 ? COLOR_BUCKETS - 1 : Math.floor(ct * COLOR_BUCKETS);
        const b = cb * DEPTH_LEVELS + depth;
        const arr = bx[b];
        const o = bc[b] * 3;
        arr[o] = sx;
        arr[o + 1] = sy;
        arr[o + 2] = Math.min(3.4, (1.5 + depth * 0.17) * p);
        bc[b]++;
        PX[n] = sx;
        PY[n] = sy;
        PB[n] = b;
      }

      if (k < 0.02 && maxX > minX) {
        const tx = (minX + maxX) / 2 + offX - ancX;
        const ty = (minY + maxY) / 2 + offY - ancY;
        offX += (tx - offX) * 0.03;
        offY += (ty - offY) * 0.03;
      }

      // corte horizontal por el centro de la figura: se ve solo una mitad
      const clip = !!clipHalf && w >= 1024;
      if (clip) {
        ctx.save();
        ctx.beginPath();
        if (clipHalf === "top") ctx.rect(0, 0, w, ancY);
        else ctx.rect(0, ancY, w, h - ancY);
        ctx.clip();
      }

      // dibujar por bucket (pocos cambios de fillStyle). Mezcla aditiva:
      // el resultado no depende del orden de dibujo → sin titileo al superponerse.
      const flash = reduceMotion ? 0 : flashAt(time);
      const fade = (1 - Math.min(1, k) * 0.25) * (1 + 0.6 * flash);
      // oscuro: suma de luz ("lighter"); blanco: multiplicación ("multiply").
      // Ambas son conmutativas → el orden de dibujo no importa y no titila.
      ctx.globalCompositeOperation = light ? "multiply" : "lighter";
      // Figura formada = líneas continuas (anillos). Al explotar las líneas se
      // desvanecen y quedan los puntos; al rearmarse vuelven las líneas.
      // fundido por tiempo entre líneas (figura formada) y puntos (explosión)
      const ss = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
      const tcy = time % T_CYCLE;
      // Las líneas solo existen con la figura quieta y armada: al terminar de
      // rearmarse los puntos se funden en líneas (0,3 s) y justo antes de
      // explotar las líneas se vuelven puntos (0,3 s). Así nunca se estiran.
      let lineA = 0;
      if (reduceMotion) lineA = 1;
      else if (tcy >= T_REFORM && tcy < T_REFORM + T_FORM) {
        const f = tcy - T_REFORM;
        lineA = ss(f / 0.3) * (1 - ss((f - (T_FORM - 0.3)) / 0.3));
      }
      const dotA = 1 - lineA;

      if (lineA > 0.001) {
        // agrupar segmentos por bucket (conteo → offsets → llenado)
        segCount.fill(0);
        for (let j = 0; j < NV; j += step) {
          if (j % LINE_EVERY) continue;
          for (let i = 0; i < NU; i++) {
            const n1 = i * NV + j;
            const n2 = ((i + 1) % NU) * NV + j;
            const b = PB[n1];
            if (b < 0 || PB[n2] < 0) continue;
            const ddx = PX[n2] - PX[n1];
            const ddy = PY[n2] - PY[n1];
            if (ddx * ddx + ddy * ddy <= MAX_SEG2) segCount[b]++;
          }
        }
        let acc = 0;
        for (let b = 0; b < segCount.length; b++) {
          segOff[b] = acc;
          acc += segCount[b];
        }
        segCount.fill(0);
        for (let j = 0; j < NV; j += step) {
          if (j % LINE_EVERY) continue;
          for (let i = 0; i < NU; i++) {
            const n1 = i * NV + j;
            const n2 = ((i + 1) % NU) * NV + j;
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
          for (let d = 0; d < DEPTH_LEVELS; d++) {
            const b = c * DEPTH_LEVELS + d;
            const count = segCount[b];
            if (!count) continue;
            ctx.globalAlpha = Math.min(1, (light ? 0.5 + d * 0.07 : 0.42 + d * 0.08) * fade * lineA);
            ctx.lineWidth = 1 + d * 0.1;
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

      for (let c = 0; c < COLOR_BUCKETS && dotA > 0.001; c++) {
        ctx.fillStyle = colors[c];
        for (let d = 0; d < DEPTH_LEVELS; d++) {
          const b = c * DEPTH_LEVELS + d;
          const count = bc[b];
          if (!count) continue;
          ctx.globalAlpha = Math.min(1, (light ? 0.3 + d * 0.07 : 0.28 + d * 0.08) * fade * dotA);
          const arr = bx[b];
          ctx.beginPath();
          for (let i = 0; i < count; i++) {
            const o = i * 3;
            const s = arr[o + 2];
            ctx.rect(arr[o] - s / 2, arr[o + 1] - s / 2, s, s);
          }
          ctx.fill();
        }
      }

      if (clip) ctx.restore();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    // benchmark invisible: 4 frames completos con la figura formada
    if (!reduceMotion) {
      const t0 = performance.now();
      for (let i = 0; i < 4; i++) render(T_REFORM + 1 + i * 0.016);
      offX = 0;
      offY = 0;
      const avg = (performance.now() - t0) / 4;
      step = avg > 24 ? 3 : avg > 12 ? 2 : 1;
      ctx.clearRect(0, 0, w, h);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [theme, anchorX, anchorY, clipHalf]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${theme === "light" ? "cs-orb-light" : ""} ${className ?? ""}`}
    >
      <style>{BG_CSS}</style>
      {/* Fondo: base profunda + halo con los colores de la figura + auroras
          que respiran muy lento + retícula de puntos + viñeta + grano */}
      <div className="cs-orb-base absolute inset-0" />
      <div className="cs-orb-aurora cs-orb-aurora-a" />
      <div className="cs-orb-aurora cs-orb-aurora-b" />
      <div className="cs-orb-aurora cs-orb-aurora-c" />
      <div className="cs-orb-halo absolute inset-0" />
      <div className="cs-orb-grid absolute inset-0" />
      <div className="cs-orb-vignette absolute inset-0" />
      <div className="cs-orb-grain absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
