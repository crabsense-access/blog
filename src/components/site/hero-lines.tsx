/**
 * Fondo del hero: haces de líneas finas paralelas que corren en diagonal y
 * doblan 90° con esquinas redondeadas concéntricas (estilo "technology
 * abstract background"), sobre fondo blanco. Colores de la marca en tonos
 * suaves y un desplazamiento muy lento de cada haz.
 *
 * Cada haz se dibuja en un marco local como una "L" (brazo horizontal que
 * llega a la esquina y brazo vertical que sale) con arcos concéntricos
 * centrados en (0,0), y después se rota/ubica:
 *   rotate(-45)  → ∧ (vértice arriba)
 *   rotate(135)  → ∨ (vértice abajo)
 *   rotate(45)   → > (vértice a la derecha)
 *   rotate(-135) → < (vértice a la izquierda)
 */

type Bundle = {
  x: number;
  y: number;
  rot: number;
  /** cantidad de líneas */
  n: number;
  /** radio de la línea interior */
  r0: number;
  /** separación entre líneas */
  gap: number;
  /** largo de cada brazo (antes y después de la curva) */
  armA: number;
  armB: number;
  color: string;
  /** opacidad máxima del trazo */
  opacity: number;
  /** clase de animación (deriva lenta) */
  drift: "a" | "b" | "c";
};

// viewBox 1440×900 (se recorta con "slice" para cubrir cualquier proporción)
const BUNDLES: Bundle[] = [
  // arriba a la izquierda: ∨ que baja desde el borde superior
  { x: 520, y: 150, rot: 135, n: 12, r0: 40, gap: 7, armA: 700, armB: 520, color: "#53539b", opacity: 0.38, drift: "a" },
  // abajo a la izquierda: ∧ que entra por el borde izquierdo
  { x: 90, y: 420, rot: -45, n: 10, r0: 60, gap: 7, armA: 420, armB: 900, color: "#3f787e", opacity: 0.32, drift: "b" },
  // abajo al centro: ∧
  { x: 900, y: 560, rot: -45, n: 12, r0: 50, gap: 7, armA: 620, armB: 700, color: "#4ba5b9", opacity: 0.3, drift: "c" },
  // derecha arriba: ∧ que baja hacia la derecha
  { x: 1240, y: 70, rot: -45, n: 11, r0: 70, gap: 7, armA: 380, armB: 900, color: "#53539b", opacity: 0.32, drift: "b" },
];

// líneas rectas muy tenues de fondo (profundidad, como en la referencia)
const FAINT: { x1: number; y1: number; x2: number; y2: number; n: number; color: string }[] = [
  { x1: 620, y1: 0, x2: 1320, y2: 700, n: 14, color: "#53539b" },
  { x1: 120, y1: 300, x2: 720, y2: 900, n: 10, color: "#3f787e" },
];

function bundlePaths(b: Bundle) {
  return Array.from({ length: b.n }, (_, i) => {
    const r = b.r0 + i * b.gap;
    // los brazos de las líneas de afuera son un poco más largos (extremos escalonados)
    const a = b.armA + i * 6;
    const c = b.armB + i * 6;
    return `M${-a},${-r} L0,${-r} A${r},${r} 0 0 1 ${r},0 L${r},${c}`;
  });
}

export function HeroLines({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden bg-white ${className}`}>
      <style>{`
        @keyframes heroLinesA { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-18px, 14px) } }
        @keyframes heroLinesB { 0%,100% { transform: translate(0,0) } 50% { transform: translate(16px, -12px) } }
        @keyframes heroLinesC { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-12px, -16px) } }
        .hero-lines-a { animation: heroLinesA 26s ease-in-out infinite; }
        .hero-lines-b { animation: heroLinesB 32s ease-in-out infinite; }
        .hero-lines-c { animation: heroLinesC 29s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-lines-a, .hero-lines-b, .hero-lines-c { animation: none; }
        }
      `}</style>
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          {BUNDLES.map((b, i) => (
            // el trazo se desvanece en las puntas de cada línea
            <linearGradient key={i} id={`hl-g${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={b.color} stopOpacity="0" />
              <stop offset="35%" stopColor={b.color} stopOpacity={b.opacity} />
              <stop offset="65%" stopColor={b.color} stopOpacity={b.opacity} />
              <stop offset="100%" stopColor={b.color} stopOpacity="0" />
            </linearGradient>
          ))}
          {FAINT.map((f, i) => (
            <linearGradient
              key={i}
              id={`hl-f${i}`}
              gradientUnits="userSpaceOnUse"
              x1={f.x1}
              y1={f.y1}
              x2={f.x2}
              y2={f.y2}
            >
              <stop offset="0%" stopColor={f.color} stopOpacity="0" />
              <stop offset="50%" stopColor={f.color} stopOpacity="0.12" />
              <stop offset="100%" stopColor={f.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {FAINT.map((f, i) => (
          <g key={`f${i}`} className={i % 2 ? "hero-lines-b" : "hero-lines-a"} stroke={`url(#hl-f${i})`} strokeWidth="1">
            {Array.from({ length: f.n }, (_, k) => (
              <line key={k} x1={f.x1 + k * 9} y1={f.y1 - k * 9} x2={f.x2 + k * 9} y2={f.y2 - k * 9} />
            ))}
          </g>
        ))}

        {BUNDLES.map((b, i) => (
          <g key={i} className={`hero-lines-${b.drift}`}>
            <g transform={`translate(${b.x} ${b.y}) rotate(${b.rot})`} stroke={`url(#hl-g${i})`} strokeWidth="1.4" strokeLinecap="round">
              {bundlePaths(b).map((d, k) => (
                <path key={k} d={d} />
              ))}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
