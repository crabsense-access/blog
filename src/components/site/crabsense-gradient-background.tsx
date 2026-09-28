import styles from "./crabsense-gradient-background.module.css";

type Props = {
  className?: string;
  /** Muestra el grano sutil sobre el degradé (default: true) */
  grain?: boolean;
};

/**
 * Fondo animado con los colores de Crabsense sobre base blanca.
 * Se posiciona en absolute e inset-0: ponelo dentro de un contenedor `relative`
 * y el contenido encima con `relative z-10`.
 */
export function CrabsenseGradientBackground({ className, grain = true }: Props) {
  return (
    <div aria-hidden className={`${styles.root} ${className ?? ""}`}>
      <div className={`${styles.blob} ${styles.cyan}`} />
      <div className={`${styles.blob} ${styles.teal}`} />
      <div className={`${styles.blob} ${styles.purple}`} />
      <div className={`${styles.blob} ${styles.accent}`} />
      <div className={styles.veil} />
      {grain && <div className={styles.grain} />}
    </div>
  );
}
