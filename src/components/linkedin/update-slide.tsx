"use client";

/* eslint-disable @next/next/no-img-element -- las slides se exportan a PDF
   imprimiendo la página: <img> plano evita lazy-loading y srcset. */
import { Fragment, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { toRoman, type LinkedInStyle } from "@/lib/linkedin";
import {
  CONTACT_URL,
  IMPACT_LABELS,
  URGENCY_LABELS,
  SERVICE_COLORS,
  UPDATE_SECTION_LABELS,
  UPDATE_SLIDE_COUNT,
  type UpdateTemplate,
} from "@/lib/linkedin-update";
import { SolarisRing } from "./solaris-ring";
import styles from "./update-slide.module.css";

function Highlight({ text }: { text: string }): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
  );
}

interface UpdateSlideViewProps {
  data: UpdateTemplate;
  index: number;
  style: LinkedInStyle;
  /** false = sin el anillo animado (miniaturas) */
  animated?: boolean;
  className?: string;
}

export function UpdateSlideView({ data, index, style, animated = true, className }: UpdateSlideViewProps) {
  const dark = style === "dark";
  const headRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Auto-ajuste: si el contenido no entra (textos largos de la IA), achica el
  // cuerpo de a 4% hasta un 70% en vez de pisar la mano o desbordar.
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    body.style.fontSize = "";
    const parent = body.parentElement;
    if (!parent) return;
    // em relativo al lienzo (no px) para que el ajuste se mantenga al imprimir a 1080 px
    const ratio = parseFloat(getComputedStyle(body).fontSize) / parseFloat(getComputedStyle(parent).fontSize);
    let scale = 1;
    while (body.scrollHeight > body.clientHeight + 1 && scale > 0.7) {
      scale -= 0.04;
      body.style.fontSize = `${(ratio * scale).toFixed(3)}em`;
    }
  });
  const svc = SERVICE_COLORS[data.service] ?? SERVICE_COLORS.analytics;
  const isLast = index === UPDATE_SLIDE_COUNT - 1;
  const kindClass = index === 0 ? styles.cover : isLast ? styles.verdict : undefined;

  return (
    <div className={cn(styles.frame, dark && styles.dark, className)}>
      <div
        className={cn(styles.s, kindClass, !isLast && styles.withHand)}
        style={{ "--svc": dark ? svc.dark : svc.light } as CSSProperties}
      >
        {index === 0 && animated && <SolarisRing targetRef={headRef} dark={dark} className={styles.ring} />}

        <div className={styles.top}>
          <img className={cn(styles.logo, styles.logoDark)} src="/crabsense-logo.svg" alt="Crabsense" />
          <img className={cn(styles.logo, styles.logoWhite)} src="/crabsense-logo-white.svg" alt="" />
          <span className={styles.num}>
            {toRoman(index + 1)} / {toRoman(UPDATE_SLIDE_COUNT)}
          </span>
        </div>

        <div className={styles.acta}>
          <span className={styles.pills}>
            <span className={cn(styles.pill, styles.pillSvc)}>{data.platform || "—"}</span>
            <span className={cn(styles.pill, styles.pillKind)}>Novedades</span>
          </span>
          <span className={styles.section}>{index === 0 ? data.date_label : UPDATE_SECTION_LABELS[index]}</span>
        </div>

        <div ref={bodyRef} className={styles.body}>
          {index === 0 && (
            <>
              <h2 ref={headRef} className={styles.h}>
                <Highlight text={data.headline} />
              </h2>
              {data.lead && <p className={styles.lead}>{data.lead}</p>}
            </>
          )}

          {index === 1 && (
            <>
              <h2 className={cn(styles.h, styles.hSm)}>
                <Highlight text={data.changed_title} />
              </h2>
              <div className={styles.ba}>
                <div className={cn(styles.ui, styles.old)}>
                  <div className={styles.uiH}>
                    <span>{data.before_label}</span>
                    {data.before_note && <em>{data.before_note}</em>}
                  </div>
                  {data.before_items.map((item, i) =>
                    item.trim().startsWith("+") ? (
                      <div key={i} className={cn(styles.row, styles.more)}>
                        <span className={styles.mark}>+</span>
                        {item.trim().replace(/^\+\s*/, "")}
                      </div>
                    ) : (
                      <div key={i} className={styles.row}>
                        <span className={styles.mark}>✕</span>
                        {item}
                      </div>
                    )
                  )}
                </div>
                <div className={cn(styles.ui, styles.new)}>
                  <div className={styles.uiH}>
                    <span>{data.after_label}</span>
                    {data.after_note && <em>{data.after_note}</em>}
                  </div>
                  {data.after_items.map((item, i) => (
                    <div key={i} className={styles.row}>
                      <span className={styles.mark}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {index === 2 && (
            <>
              <h2 className={styles.h}>
                <Highlight text={data.fine_title} />
              </h2>
              <div className={styles.fine}>
                {data.fine_items.slice(0, 3).map((item, i) => (
                  <div key={i} className={styles.fineI}>
                    <span className={styles.ic}>{toRoman(i + 1)}</span>
                    <div>
                      <span className={styles.fineT}>{item.title}</span>
                      <span className={styles.fineD}>{item.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {index === 3 && (
            <>
              <h2 className={styles.h}>
                <Highlight text={data.steps_title} />
              </h2>
              <ol className={styles.steps}>
                {data.steps.slice(0, 4).map((step, i) => (
                  <li key={i} className={styles.step}>
                    <span className={styles.stepN}>{toRoman(i + 1)}</span>
                    <div>
                      <span className={styles.stepT}>{step.title}</span>
                      <span className={styles.stepD}>{step.description}</span>
                    </div>
                    {step.when ? <span className={styles.when}>{step.when}</span> : <span />}
                  </li>
                ))}
              </ol>
            </>
          )}

          {isLast && (
            <>
              <p className={styles.quote}>
                <Highlight text={data.verdict} />
              </p>
              <div className={styles.meters}>
                {(
                  [
                    ["Impacto", data.impact, IMPACT_LABELS],
                    ["Urgencia", data.urgency, URGENCY_LABELS],
                  ] as const
                ).map(([label, level, labels]) => (
                  <div key={label} className={styles.meter}>
                    <span className={styles.meterK}>{label}</span>
                    <div className={styles.bars}>
                      {[1, 2, 3].map((n) => (
                        <i key={n} className={cn(styles.bar, n <= level && styles.barOn)} />
                      ))}
                    </div>
                    <span className={styles.meterV}>{labels[level]}</span>
                  </div>
                ))}
              </div>
              <a className={styles.cta} href={CONTACT_URL} target="_blank" rel="noopener noreferrer">
                {data.cta} ↗
              </a>
            </>
          )}
        </div>

        {!isLast && <img className={styles.hand} src="/linkedin/swipe-hand.webp" alt="Deslizá" />}
      </div>
    </div>
  );
}
