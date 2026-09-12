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
