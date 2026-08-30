/**
 * Calcula el tiempo de lectura estimado en minutos basado en la longitud del contenido.
 * Asume aproximadamente 200 palabras por minuto.
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes); // Mínimo 1 minuto
}
