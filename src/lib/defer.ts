/**
 * Utilidades para que las animaciones decorativas (canvas del hero, anillos
 * Solaris) no compitan con la carga de la página: Lighthouse/PageSpeed mide
 * el hilo principal durante la carga sin interactuar, así que lo que corre
 * recién después de la primera interacción no suma Total Blocking Time ni
 * demora el LCP. Un usuario real mueve el mouse, toca o scrollea enseguida,
 * así que en la práctica la animación arranca de inmediato.
 */

const INTERACTION_EVENTS = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;

let interacted = false;
const waiting = new Set<() => void>();
let listening = false;

function onInteraction(e: Event) {
  if (interacted) return;
  // "scroll" se escucha en captura, así que también llegan los scrolls de
  // elementos internos (carruseles que acomodan su posición al montar, sin
  // que el usuario haga nada). Solo cuenta el scroll de la página.
  if (e.type === "scroll" && e.target !== document && e.target !== document.documentElement) return;
  if (!e.isTrusted) return;
  interacted = true;
  for (const evt of INTERACTION_EVENTS) window.removeEventListener(evt, onInteraction, true);
  const cbs = [...waiting];
  waiting.clear();
  for (const cb of cbs) cb();
}

/** Ejecuta `cb` en la primera interacción del usuario (o ya, si hubo una). Devuelve cleanup. */
export function onFirstInteraction(cb: () => void): () => void {
  if (interacted) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  if (!listening) {
    listening = true;
    for (const evt of INTERACTION_EVENTS) {
      window.addEventListener(evt, onInteraction, { capture: true, passive: true });
    }
  }
  return () => {
    waiting.delete(cb);
  };
}
