"use client";

import { useEffect, useRef } from "react";

/**
 * Correo gigante del footer. En mobile (< 768px) el tamaño de letra se
 * calcula para que el texto ocupe exactamente el 100% del ancho de la
 * pantalla (el contenedor rompe el padding lateral del footer). En
 * escritorio usa el tamaño fijo de la clase (8.2vw).
 */
export function FooterEmail({ email }: { email: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const fit = () => {
      if (!mq.matches) {
        text.style.fontSize = "";
        return;
      }
      // medir el ancho del texto a 100px y escalar al ancho disponible
      text.style.fontSize = "100px";
      const w = text.getBoundingClientRect().width;
      if (w > 0) text.style.fontSize = `${(wrap.clientWidth / w) * 100}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    mq.addEventListener("change", fit);
    document.fonts?.ready.then(fit);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", fit);
    };
  }, []);

  return (
    // mobile: el contenedor padre (site-footer) no tiene padding lateral,
    // así que este ancho = 100vw
    <div ref={wrapRef} className="max-md:text-center">
      <a
        href={`mailto:${email}`}
        className="-mb-[0.22em] block whitespace-nowrap font-heading text-[8.2vw] font-semibold leading-none tracking-tighter text-white/[0.05] transition-colors duration-300 hover:text-white/[0.12] max-md:text-white/[0.08]"
      >
        <span ref={textRef} className="inline-block">
          {email}
        </span>
      </a>
    </div>
  );
}
