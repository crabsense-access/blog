/** Convierte un color hex (#rrggbb) a rgba(...) con la opacidad dada. */
export function hexToRgba(hex: string | null | undefined, alpha: number): string | null {
  const match = hex ? /^#?([0-9a-fA-F]{6})$/.exec(hex) : null;
  if (!match) return null;

  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseHex(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Mezcla `hex` con blanco: `amount` = opacidad del color (0-1) sobre blanco. */
export function tintOnWhite(hex: string, amount: number): string {
  const c = parseHex(hex);
  if (!c) return "#ffffff";
  return toHex(c.map((v) => 255 - (255 - v) * amount) as [number, number, number]);
}

/**
 * Oscurece `hex` (manteniendo el tono) lo mínimo necesario para que como
 * texto sobre `bg` llegue al contraste WCAG AA (`min`, 4.5:1 para texto
 * normal). Los colores de marca que ya cumplen se devuelven tal cual.
 * Ej.: el celeste de ADS (#4ba5b9, 2.8:1 sobre blanco) → #397d8d.
 */
export function readableOn(hex: string, bg = "#ffffff", min = 4.5): string {
  const c = parseHex(hex);
  const b = parseHex(bg);
  if (!c || !b) return hex;
  // un poco por encima del mínimo para no quedar al límite por redondeos
  const target = min + 0.1;
  if (contrast(c, b) >= target) return hex;
  for (let k = 0.98; k > 0; k -= 0.02) {
    const d = c.map((v) => v * k) as [number, number, number];
    if (contrast(d, b) >= target) return toHex(d);
  }
  return "#000000";
}
