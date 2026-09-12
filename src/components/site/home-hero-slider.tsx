"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PostImage } from "@/components/site/post-image";
import { AuthorAvatar } from "@/components/site/author-avatar";
import { cn } from "@/lib/utils";
import type { PostWithRelations } from "@/lib/types";

// Píxeles de movimiento antes de decidir si el gesto táctil es horizontal
// (para el slider) o vertical (scroll normal de la página).
const TOUCH_DIRECTION_THRESHOLD = 6;
// Fracción del viewport height que representa el recorrido total del
// gesto de scroll/drag necesario para atravesar todos los slides.
const MAX_SCROLL_VH_FRACTION = 0.8;
// Factor de interpolación (lerp) por frame entre renderedProgress y
// targetProgress. Más alto = sigue al input más de cerca (menos "lag");
// más bajo = más suavizado/inercia.
const LERP_FACTOR = 0.15;
// Umbral por debajo del cual consideramos que renderedProgress ya alcanzó
// a targetProgress, para poder dejar de re-renderizar en cada frame.
const LERP_EPSILON = 0.0005;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// % visible en reposo (progress=0) de cada card detrás de la card 1:
// card2 asoma 8%, card3 asoma 4% (más chico porque va por delante).
const REST_PEEK: Record<number, number> = { 2: 8, 3: 4 };
// translateY final al terminar de cubrir a la anterior: card2 deja 4%
// visible, card3 deja 8% (el doble).
const END_OFFSET: Record<number, number> = { 2: -4, 3: -8 };

// Cuánto "avanza" targetProgress por unidad de delta de wheel/drag,
// calculado para que el recorrido completo (0..maxProgress) equivalga a
// como máximo MAX_SCROLL_VH_FRACTION del alto del viewport acumulado.
function getSensitivity(maxProgress: number) {
  if (maxProgress <= 0) return 0;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  return maxProgress / (MAX_SCROLL_VH_FRACTION * viewportHeight);
}

interface HomeHeroSliderProps {
  posts: PostWithRelations[];
}

/**
 * Slider principal del home del blog (arriba de todo el Bloque Principal):
 * efecto de "stack de cards" (mazo apenas abierto) controlado por scroll
 * horizontal (wheel/trackpad/touch). El input (wheel/touch/flechas) mueve
 * targetProgress de forma inmediata; un loop de requestAnimationFrame
 * interpola (lerp) renderedProgress hacia targetProgress en cada frame, y
 * es renderedProgress el que maneja todas las transformaciones visuales
 * (posición, z-index, crossfade de fondo) — así el movimiento se siente
 * continuo en vez de saltar de a piquitos con cada evento de wheel.
 *
 * Estructura: las 3 cards viven dentro del mismo stage (position: relative)
 * y cada una es position: absolute ocupando el mismo bottom/left/width/
 * height (mismo "casillero"). z-index FIJO por card, según el índice
 * 1-based (card 1 = 10, card 2 = 20, card 3 = 30) — no depende del
 * scroll.
 *
 * En reposo (progress=0) solo la card 1 está en su posición final
 * (translateY(0%)); las cards 2 y 3 arrancan en translateY(100%),
 * totalmente fuera de vista por debajo del stage. No hay peek en este
 * punto.
 *
 * progress recorre 0..2 (totalSlides - 1):
 * - De 0 a 1: la card 2 sube de translateY(100%) a translateY(0%),
 *   tapando por completo a la card 1. La card 3 se mantiene sin
 *   moverse en translateY(100%).
 * - De 1 a 2: la card 3 sube de translateY(100%) a translateY(0%),
 *   tapando por completo a la card 2. La card 1 y la card 2 quedan
 *   fijas en su posición final del paso anterior.
 *
 * localProgress para la card de índice 1-based `index` (2 o 3):
 * clamp(progress - (index - 2), 0, 1) — card 2 usa el tramo 0→1, card 3
 * el tramo 1→2.
 *
 * La imagen de fondo va detrás del stack y hace crossfade entre slides
 * según la card activa. El recorrido completo de scroll/drag está
 * acotado a un 80% del alto del viewport (ver getSensitivity).
 */
export function HomeHeroSlider({ posts }: HomeHeroSliderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const targetProgressRef = useRef(0);
  const renderedProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [renderedProgress, setRenderedProgress] = useState(0);

  const totalSlides = posts.length;
  const maxProgress = Math.max(0, totalSlides - 1);

  // Loop de lerp: corre durante toda la vida del componente, interpolando
  // renderedProgress hacia targetProgress. Cuando ya convergieron, deja de
  // disparar setState (evita re-renders innecesarios) pero sigue pidiendo
  // el próximo frame para detectar el próximo movimiento de targetProgress.
  useEffect(() => {
    function loop() {
      const current = renderedProgressRef.current;
      const target = targetProgressRef.current;
      const diff = target - current;

      if (Math.abs(diff) > LERP_EPSILON) {
        const next = current + diff * LERP_FACTOR;
        renderedProgressRef.current = next;
        setRenderedProgress(next);
      } else if (current !== target) {
        renderedProgressRef.current = target;
        setRenderedProgress(target);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || maxProgress === 0) return;

    function onWheel(e: WheelEvent) {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const current = targetProgressRef.current;
      // Ya llegamos al final (o al principio) y se sigue scrolleando hacia
      // ese mismo lado: soltamos el evento (sin preventDefault) para que
      // el scroll de la página siga su curso normal en vez de quedar
      // "atrapado" en el slider.
      const atMaxGoingForward = current >= maxProgress - 1e-6 && delta > 0;
      const atMinGoingBackward = current <= 1e-6 && delta < 0;
      if (atMaxGoingForward || atMinGoingBackward) return;

      e.preventDefault();
      targetProgressRef.current = clamp(current + delta * getSensitivity(maxProgress), 0, maxProgress);
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [maxProgress]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || maxProgress === 0) return;

    let startX = 0;
    let startY = 0;
    let startProgress = 0;
    let decided = false;
    let dragging = false;

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startProgress = targetProgressRef.current;
      decided = false;
      dragging = false;
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (!decided) {
        if (Math.abs(dx) < TOUCH_DIRECTION_THRESHOLD && Math.abs(dy) < TOUCH_DIRECTION_THRESHOLD) {
          return;
        }
        decided = true;
        dragging = Math.abs(dx) > Math.abs(dy);
      }

      if (!dragging) return;

      const current = targetProgressRef.current;
      const rawTarget = startProgress - dx * getSensitivity(maxProgress);
      // Mismo criterio que en onWheel: si ya estamos en un extremo y el
      // drag sigue empujando hacia ese lado, soltamos el gesto para que
      // el scroll vertical de la página siga funcionando normalmente.
      const atMaxGoingForward = current >= maxProgress - 1e-6 && rawTarget > current;
      const atMinGoingBackward = current <= 1e-6 && rawTarget < current;
      if (atMaxGoingForward || atMinGoingBackward) return;

      e.preventDefault();
      targetProgressRef.current = clamp(rawTarget, 0, maxProgress);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [maxProgress]);

  function goTo(direction: 1 | -1) {
    const current = targetProgressRef.current;
    const target =
      direction === 1
        ? Math.min(maxProgress, Math.floor(current) + 1)
        : Math.max(0, Math.ceil(current) - 1);
    targetProgressRef.current = target;
  }

  if (totalSlides === 0) return null;

  const progress = renderedProgress;
  const activeIndex = clamp(Math.round(progress), 0, maxProgress);
  const canScrollPrev = progress > 0.001;
  const canScrollNext = progress < maxProgress - 0.001;
  const progressPercent = maxProgress > 0 ? (progress / maxProgress) * 100 : 100;

  return (
    <div
      className="relative z-0 mb-10"
      style={{ marginTop: "calc(-1 * var(--site-header-height, 4.5rem))" }}
    >
      <div
        ref={stageRef}
        className="relative h-[70vh] w-full touch-pan-y select-none overflow-hidden rounded-2xl bg-gray-900"
      >
        {posts.map((post, i) => {
          const distance = Math.abs(progress - i);
          const opacity = clamp(1 - distance, 0, 1);
          if (opacity <= 0) return null;

          return (
            <div key={`${post.id}-bg`} className="absolute inset-0" style={{ opacity }}>
              <PostImage src={post.cover_image_url} alt="" className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            </div>
          );
        })}

        {posts.map((post, i) => {
          // index 1-based, tal como en la fórmula de referencia (card1=1,
          // card2=2, card3=3).
          const index = i + 1;
          const zIndex = index * 10; // card1: 10, card2: 20, card3: 30 — fijo.

          let translateY: number;
          if (index === 1) {
            // La card 1 nunca se mueve: siempre en su posición final.
            translateY = 0;
          } else {
            // card2 usa el tramo de progress 0→1; card3 el tramo 1→2.
            const localProgress = clamp(progress - (index - 2), 0, 1);
            // Reposo: card2 en 90% (asoma 10%), card3 en 95% (asoma 5%).
            // Final escalonado por card: card2 termina en -5% (deja 5%
            // visible), card3 en -10% (deja 10%, el doble).
            const startY = 100 - REST_PEEK[index];
            const endY = END_OFFSET[index];
            translateY = startY + localProgress * (endY - startY);
          }

          const active = i === activeIndex;

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              className={cn(
                "absolute bottom-0 left-1/2 flex h-[54vh] w-[80%] flex-col justify-center gap-2 rounded-md border border-gray-200 bg-white px-6 py-4 sm:px-9 sm:py-5",
                active ? "pointer-events-auto" : "pointer-events-none"
              )}
              style={{
                transform: `translateX(-50%) translateY(${translateY}%)`,
                zIndex,
                // Sombra suave arriba de cada card (además de la sombra
                // general) para dar sensación de profundidad entre capas
                // cuando una tapa a la anterior. Más sutil que la versión
                // anterior (menos opacidad y blur).
                boxShadow: "0 -6px 10px rgba(0,0,0,0.08), 0 8px 18px rgba(0,0,0,0.05)",
              }}
            >
              {post.category && (
                <span
                  className="mr-[2%] inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border-2 bg-transparent px-4 py-1 text-base font-bold uppercase"
                  style={{
                    borderColor: post.category.pill_color || "#9ca3af",
                    color: post.category.pill_color || "#9ca3af",
                  }}
                >
                  {post.category.name}
                </span>
              )}
              <h2 className="font-heading line-clamp-2 mt-4 text-2xl font-normal leading-[1.1] sm:text-4xl md:text-[2.4rem] md:tracking-[-1px]">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="font-heading line-clamp-1 text-xl font-light text-muted-foreground">
                  {post.excerpt}
                </p>
              )}
              <div className="mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className="font-heading inline-flex w-fit items-center gap-1.5 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: post.category?.pill_color || "#111827" }}
                >
                  Leer más
                  <ChevronRight className="size-4" />
                </span>

                {(post.author?.full_name || post.author?.email) && (
                  <div className="flex items-center gap-2">
                    <AuthorAvatar author={post.author ?? {}} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium text-foreground">
                        {post.author?.full_name || post.author?.email}
                      </span>
                      {post.published_at && (
                        <span className="text-xs uppercase text-muted-foreground">
                          {new Date(post.published_at).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 px-1">
        <div className="flex shrink-0 items-stretch overflow-hidden rounded-full bg-gray-50 shadow-sm">
          <button
            type="button"
            aria-label="Slide anterior"
            onClick={() => goTo(-1)}
            disabled={!canScrollPrev}
            className={cn(
              "flex h-10 w-10 items-center justify-center text-gray-300 transition-colors hover:bg-gray-100",
              "disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <div className="w-px bg-gray-200" />
          <button
            type="button"
            aria-label="Slide siguiente"
            onClick={() => goTo(1)}
            disabled={!canScrollNext}
            className={cn(
              "flex h-10 w-10 items-center justify-center text-gray-900 transition-colors hover:bg-gray-100",
              "disabled:pointer-events-none disabled:opacity-30"
            )}
          >
            <ChevronRight className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gray-400"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
