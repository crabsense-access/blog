"use client";

/* eslint-disable @next/next/no-img-element -- las slides se exportan a PDF
   imprimiendo la página: <img> plano evita lazy-loading y srcset. */
import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { FIGURES, toRoman, type LinkedInSlide, type LinkedInStyle } from "@/lib/linkedin";
import styles from "./linkedin-slide.module.css";

/** Pinta en color de acento lo que está entre **dobles asteriscos**. */
function Highlight({ text }: { text: string }): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  );
}

interface LinkedInSlideViewProps {
  slide: LinkedInSlide;
  index: number;
  total: number;
  style: LinkedInStyle;
  className?: string;
}

export function LinkedInSlideView({ slide, index, total, style, className }: LinkedInSlideViewProps) {
  const isLast = index === total - 1;
  // Las figuras solo entran donde hay aire: portada, cierre, texto y dato sin barras.
  const figureAllowed =
    slide.kind === "cover" ||
    slide.kind === "cta" ||
    slide.kind === "text" ||
    (slide.kind === "stat" && slide.bars.length === 0);
  const figure = figureAllowed && slide.figure !== "none" ? FIGURES[slide.figure] : null;
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-ajuste: si el contenido no entra en la slide, achica la tipografía
  // del cuerpo de a 4% (hasta un 65%; logo y pie no cambian) en vez de desbordar.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    let scale = 1;
    body.style.fontSize = "";
    const fits = () => body.scrollHeight <= body.clientHeight + 1;
    while (!fits() && scale > 0.65) {
      scale -= 0.04;
      body.style.fontSize = `${scale.toFixed(2)}em`;
    }
  });
  const figureCentered = slide.kind === "cta";
  const kindClass =
    slide.kind === "cover" ? styles.cover : slide.kind === "cta" ? styles.cta : undefined;

  return (
    <div className={cn(styles.frame, style === "dark" && styles.dark, className)}>
      <div className={cn(styles.s, kindClass, figure && !figureCentered && styles.withFig, figure && figureCentered && styles.withFigCenter)}>
        <div className={styles.top}>
          <img className={cn(styles.logo, styles.logoDark)} src="/crabsense-logo.svg" alt="Crabsense" />
          <img className={cn(styles.logo, styles.logoWhite)} src="/crabsense-logo-white.svg" alt="" />
          {total > 1 && (
            <span className={styles.num}>
              {toRoman(index + 1)} / {toRoman(total)}
            </span>
          )}
        </div>

        <div ref={bodyRef} className={styles.body}>
          {slide.eyebrow && <div className={styles.eb}>{slide.eyebrow}</div>}
          <SlideContent slide={slide} />
        </div>

        {figure && (
          <img
            className={cn(styles.fig, figureCentered ? styles.figCenter : styles.figCorner)}
            src={figure.src}
            alt=""
          />
        )}

        <div className={styles.foot}>
          <span>{total === 1 || isLast ? "crabsense.com" : "crabsense.com/blog"}</span>
          {total > 1 && !isLast && (
            <span className={styles.swipe}>
              Deslizá <i className={styles.arrow} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SlideContent({ slide }: { slide: LinkedInSlide }) {
  switch (slide.kind) {
    case "cover":
      return (
        <>
          <h2 className={cn(styles.h, styles.hXl)}>
            <Highlight text={slide.title} />
          </h2>
          {slide.body && <p className={styles.lead}>{slide.body}</p>}
        </>
      );
    case "stat":
      return (
        <>
          {slide.value && <div className={styles.big}>{slide.value}</div>}
          {slide.title && (
            <h2 className={cn(styles.h, styles.hSm)}>
              <Highlight text={slide.title} />
            </h2>
          )}
          {slide.body && <p className={styles.lead}>{slide.body}</p>}
          {slide.bars.length > 0 && (
            <div className={styles.bars}>
              {slide.bars.map((bar, i) => (
                <div key={i} className={styles.bar}>
                  <span className={styles.barLbl}>{bar.label}</span>
                  <div className={styles.track}>
                    <span
                      className={styles.fill}
                      style={{ width: `${Math.max(0, Math.min(100, Number(bar.value) || 0))}%` }}
                    >
                      {bar.display}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {slide.source && <div className={styles.src}>Fuente: {slide.source}</div>}
        </>
      );
    case "list":
      return (
        <>
          <h2 className={styles.h}>
            <Highlight text={slide.title} />
          </h2>
          {slide.body && <p className={styles.lead}>{slide.body}</p>}
          <ul className={styles.list}>
            {slide.items.map((item, i) => (
              <li key={i} className={styles.li}>
                <span
                  className={cn(
                    styles.mark,
                    slide.list_style === "cross" && styles.markCross,
                    slide.list_style === "check" && styles.markCheck
                  )}
                >
                  {slide.list_style === "check" ? "✓" : slide.list_style === "cross" ? "✕" : toRoman(i + 1)}
                </span>
                <span>
                  <span className={styles.liT}>{item.title}</span>
                  {item.description && <span className={styles.liD}>{item.description}</span>}
                </span>
              </li>
            ))}
          </ul>
          {slide.source && <div className={styles.src}>Fuente: {slide.source}</div>}
        </>
      );
    case "compare":
      return (
        <>
          {slide.title && (
            <h2 className={styles.h}>
              <Highlight text={slide.title} />
            </h2>
          )}
          <div className={styles.cmp}>
            <div className={cn(styles.panel, styles.panelBad)}>
              <div className={styles.panelLbl}>{slide.left_label || "Antes"}</div>
              <div className={styles.panelTxt}>{slide.left_body}</div>
            </div>
            <div className={cn(styles.panel, styles.panelGood)}>
              <div className={styles.panelLbl}>{slide.right_label || "Después"}</div>
              <div className={styles.panelTxt}>{slide.right_body}</div>
            </div>
          </div>
          {slide.source && <div className={styles.src}>Fuente: {slide.source}</div>}
        </>
      );
    case "cta":
      return (
        <>
          <h2 className={styles.h}>
            <Highlight text={slide.title} />
          </h2>
          {slide.body && <p className={styles.lead}>{slide.body}</p>}
          {slide.button && <span className={styles.pill}>{slide.button} ↗</span>}
        </>
      );
    case "text":
    default:
      return (
        <>
          <h2 className={styles.h}>
            <Highlight text={slide.title} />
          </h2>
          {slide.body && <p className={cn(styles.lead, styles.leadLg)}>{slide.body}</p>}
          {slide.source && <div className={styles.src}>Fuente: {slide.source}</div>}
        </>
      );
  }
}
