/**
 * Fondo del hero: estelas de luz (estilo "speed lines" / velocidad) que
 * salen abiertas desde el borde izquierdo y convergen en un punto a la
 * derecha, sobre fondo blanco, con los colores de Crabsense. Capas:
 * - halo: trazos anchos y difuminados (el "glow" de la luz)
 * - líneas: trazos finos y nítidos
 * - destellos: pulsos cortos que recorren algunas líneas de izquierda a derecha
 *
 * Las curvas se generan con un PRNG con semilla fija → mismo SVG en el
 * servidor y en el cliente (sin problemas de hidratación).
 */

const W = 1440;
const H = 900;
// punto de fuga (hacia donde convergen las estelas), apenas fuera del borde derecho
const VX = W + 60;
const VY = 500;

// violeta, índigo, verde azulado, celeste y violeta claro de la marca
const COLORS = ["#53539b", "#3d3c89", "#3f787e", "#4ba5b9", "#7d7bd0"];

function prng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Streak = { d: string; color: number; width: number; opacity: number };

function makeStreaks(count: number, seed: number, spread: number): Streak[] {
  const r = prng(seed);
  return Array.from({ length: count }, () => {
    // distribución concentrada al centro y más rala hacia los bordes
    const u = r() * 2 - 1;
    const t = Math.sign(u) * Math.pow(Math.abs(u), 0.75);
    const y0 = VY + t * spread;
    const x0 = -80 - r() * 120;
    // curva: se mantiene abierta un tramo y después converge al punto de fuga
    const c1x = 520 + r() * 260;
    const c2x = 880 + r() * 220;
    const c2y = VY + (y0 - VY) * (0.01 + r() * 0.05);
    const vy = VY + (r() - 0.5) * 18;
    return {
      d: `M${x0.toFixed(0)},${y0.toFixed(1)} C${c1x.toFixed(0)},${y0.toFixed(1)} ${c2x.toFixed(0)},${c2y.toFixed(1)} ${VX},${vy.toFixed(1)}`,
      color: Math.floor(r() * COLORS.length),
      width: 0.6 + r() * 1.6,
      opacity: 0.35 + r() * 0.45,
    };
  });
}

const GLOW = makeStreaks(16, 7, 560);
const LINES = makeStreaks(46, 21, 560);
// destellos: algunas de las líneas finas, con su duración y retraso
const PULSES = LINES.filter((_, i) => i % 5 === 0).map((s, i) => ({
  ...s,
  dur: 5 + ((i * 1.7) % 4),
  delay: -((i * 2.3) % 6),
}));

export function HeroStreaks({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden bg-white ${className}`}>
      <style>{`
        @keyframes heroStreakPulse { from { stroke-dashoffset: 1100; } to { stroke-dashoffset: 0; } }
        @keyframes heroStreakBreath { 0%,100% { opacity: 1; } 50% { opacity: .75; } }
        .hero-streak-pulse { stroke-dasharray: 90 1100; animation: heroStreakPulse linear infinite; }
        .hero-streak-glow { animation: heroStreakBreath 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-streak-pulse { display: none; }
          .hero-streak-glow { animation: none; }
        }
      `}</style>
      <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          {/* cada color se desvanece al entrar por la izquierda y al llegar al punto de fuga */}
          {COLORS.map((c, i) => (
            <linearGradient key={i} id={`hs-c${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={VX} y2="0">
              <stop offset="0%" stopColor={c} stopOpacity="0" />
              <stop offset="12%" stopColor={c} stopOpacity="0.18" />
              <stop offset="40%" stopColor={c} stopOpacity="0.55" />
              <stop offset="75%" stopColor={c} stopOpacity="0.95" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="hs-blur" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* halo */}
        <g className="hero-streak-glow" filter="url(#hs-blur)" strokeLinecap="round">
          {GLOW.map((s, i) => (
            <path key={i} d={s.d} stroke={`url(#hs-c${s.color})`} strokeWidth={6 + s.width * 5} opacity={s.opacity * 0.55} />
          ))}
        </g>

        {/* líneas finas */}
        <g strokeLinecap="round">
          {LINES.map((s, i) => (
            <path key={i} d={s.d} stroke={`url(#hs-c${s.color})`} strokeWidth={s.width} opacity={s.opacity} />
          ))}
        </g>

        {/* destellos que corren hacia el punto de fuga */}
        <g strokeLinecap="round">
          {PULSES.map((s, i) => (
            <path
              key={i}
              d={s.d}
              pathLength={1000}
              className="hero-streak-pulse"
              stroke={COLORS[s.color]}
              strokeWidth={s.width + 1.2}
              opacity={0.7}
              style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
