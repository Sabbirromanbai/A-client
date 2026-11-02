"use client";

import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
  type TouchEvent,
} from "react";

const slides = [
  {
    src: "/image-1.jpg",
    category: "Community Care",
    caption: "Fresh food and care, shared with neighbors.",
    alt: "Volunteers sharing fresh food with a family at a community food drive.",
  },
  {
    src: "/image-2.jpg",
    category: "Greener Together",
    caption: "Planting a greener future, side by side.",
    alt: "Community volunteers planting young trees together.",
  },
  {
    src: "/image-3.jpg",
    category: "Learning & Opportunity",
    caption: "Creating brighter possibilities through learning.",
    alt: "A volunteer helping children learn in a community classroom.",
  },
  {
    src: "/image-4.jpg",
    category: "Neighborhood Action",
    caption: "Small acts of care make shared spaces shine.",
    alt: "Volunteers working together to clean a neighborhood park.",
  },
];

const SWIPE_THRESHOLD = 48;
const AUTOPLAY_INTERVAL_MS = 2500;
const SLIDE_TRANSITION_MS = 1100;

export default function HeroImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [userRequestedPlayback, setUserRequestedPlayback] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const transitionLock = useRef(false);
  const transitionTimeout = useRef<number | null>(null);
  const activeSlide = slides[activeIndex];
  const nextIndex = (activeIndex + 1) % slides.length;
  const isAutoplayEnabled =
    !isPausedByUser &&
    (!prefersReducedMotion || userRequestedPlayback);
  const isPlaying = isAutoplayEnabled && !isHovered;

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () =>
      setPrefersReducedMotion(motionPreference.matches);

    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () =>
      motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(
    () => () => {
      if (transitionTimeout.current !== null) {
        window.clearTimeout(transitionTimeout.current);
      }
    },
    [],
  );

  const transitionTo = useCallback(
    (index: number) => {
      if (transitionLock.current || index === activeIndex) return;

      transitionLock.current = true;
      setIsTransitioning(true);
      setActiveIndex(index);
      transitionTimeout.current = window.setTimeout(
        () => {
          transitionLock.current = false;
          transitionTimeout.current = null;
          setIsTransitioning(false);
        },
        prefersReducedMotion ? 0 : SLIDE_TRANSITION_MS,
      );
    },
    [activeIndex, prefersReducedMotion],
  );

  useEffect(() => {
    if (!isPlaying) return;

    const timeout = window.setTimeout(() => {
      transitionTo(nextIndex);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, isPlaying, nextIndex, transitionTo]);

  function showPrevious() {
    transitionTo((activeIndex - 1 + slides.length) % slides.length);
  }

  function showNext() {
    transitionTo(nextIndex);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) showNext();
    else showPrevious();
  }

  return (
    <section
      aria-label="Community stories"
      aria-roledescription="carousel"
      className="group relative h-full w-full overflow-hidden rounded-[1.7rem] bg-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 sm:rounded-[2rem] [touch-action:pan-y]"
      onKeyDown={handleKeyDown}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setIsHovered(false);
      }}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      role="region"
      tabIndex={0}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const isPreloadCandidate = isActive || index === nextIndex;

        return (
          <div
            aria-hidden={!isActive}
            aria-label={`${String(index + 1).padStart(2, "0")} of ${String(slides.length).padStart(2, "0")}`}
            aria-roledescription="slide"
            className={`absolute inset-0 transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            key={slide.src}
            role="group"
          >
            <Image
              alt={slide.alt}
              className={`object-cover object-center transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isActive ? "scale-[1.025]" : "scale-100"
              }`}
              fill
              loading={isPreloadCandidate ? undefined : "lazy"}
              preload={isPreloadCandidate}
              sizes="(max-width: 639px) 90vw, (max-width: 1023px) calc(100vw - 64px), (max-width: 1279px) 55vw, 50vw"
              src={slide.src}
            />
          </div>
        );
      })}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-stretch gap-3 p-4 text-white sm:flex-row sm:items-end sm:justify-between sm:p-6 md:p-7">
        <div className="min-w-0 pb-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-200 sm:text-xs">
            {activeSlide.category}
          </p>
          <p className="mt-1.5 max-w-sm text-pretty text-sm font-semibold leading-5 sm:text-base sm:leading-6">
            {activeSlide.caption}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end rounded-full border border-white/20 bg-slate-950/35 p-1.5 shadow-lg shadow-slate-950/15 backdrop-blur-md">
          <div
            aria-label="Choose a slide"
            className="flex items-center gap-1.5 px-1"
            role="group"
          >
            {slides.map((slide, index) => (
              <button
                aria-current={index === activeIndex ? "true" : undefined}
                aria-label={`Show slide ${index + 1}: ${slide.category}`}
                className={`h-2 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-wait ${
                  index === activeIndex
                    ? "w-5 bg-white"
                    : "w-2 bg-white/55 hover:bg-white/85"
                }`}
                disabled={isTransitioning}
                key={slide.src}
                onClick={() => transitionTo(index)}
                type="button"
              />
            ))}
          </div>

          <span
            aria-label={`Slide ${String(activeIndex + 1).padStart(2, "0")} of ${String(slides.length).padStart(2, "0")}`}
            className="min-w-[2.4rem] border-l border-white/20 px-2 text-center text-[0.68rem] font-semibold tabular-nums text-white/90"
          >
            {String(activeIndex + 1).padStart(2, "0")}/
            {String(slides.length).padStart(2, "0")}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <span
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {activeSlide.category}: {activeSlide.caption}
            </span>
            <button
              aria-label={
                isAutoplayEnabled
                  ? "Pause slide autoplay"
                  : "Resume slide autoplay"
              }
              aria-pressed={!isAutoplayEnabled}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => {
                if (isAutoplayEnabled) {
                  setIsPausedByUser(true);
                  return;
                }

                setIsPausedByUser(false);
                if (prefersReducedMotion) setUserRequestedPlayback(true);
              }}
              type="button"
            >
              {isPlaying ? (
                <Pause aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <Play aria-hidden="true" className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              aria-label="Previous slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-50"
              disabled={isTransitioning}
              onClick={showPrevious}
              type="button"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <button
              aria-label="Next slide"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-50"
              disabled={isTransitioning}
              onClick={showNext}
              type="button"
            >
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
