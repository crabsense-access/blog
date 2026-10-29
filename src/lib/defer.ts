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

function onInteraction() {
  if (interacted) return;
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

/** requestIdleCallback con fallback a setTimeout. Devuelve cleanup. */
export function whenIdle(cb: () => void, timeout = 2000): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}
