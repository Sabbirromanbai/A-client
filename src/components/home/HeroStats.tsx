"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  HeartHandshake,
  Sparkles,
  UsersRound,
} from "lucide-react";

const stats = [
  { value: 1450, suffix: "+", label: "Active Volunteers", icon: UsersRound },
  { value: 180, suffix: "+", label: "Events Completed", icon: CalendarDays },
  { value: 24000, suffix: "+", label: "Lives Impacted", icon: HeartHandshake },
  { value: 100, suffix: "%", label: "Community Driven", icon: Sparkles },
];

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function HeroStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [values, setValues] = useState(() => stats.map(() => 0));

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setValues(stats.map(({ value }) => value));
        } else {
          setHasEntered(true);
        }
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !hasEntered ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setValues(stats.map(({ value }) => Math.round(value * easedProgress)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [hasEntered]);

  return (
    <section
      aria-label="GoodTogether community impact"
      className="relative isolate overflow-hidden px-5 py-5 sm:px-8 sm:py-7 lg:px-10"
      ref={sectionRef}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-emerald-50/70 dark:bg-emerald-950/20"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-7 overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 px-4 py-8 shadow-[0_24px_70px_-35px_rgba(4,70,49,0.65)] sm:gap-8 sm:px-8 sm:py-9 lg:grid-cols-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-32 h-72 w-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl"
        />
        {stats.map((stat, index) => (
          <div
            className="relative flex min-w-0 items-center justify-center gap-3 text-left sm:gap-4"
            key={stat.label}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-emerald-100 sm:h-12 sm:w-12">
              <stat.icon aria-hidden="true" className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight text-white tabular-nums sm:text-3xl">
                <span>{formatValue(values[index])}</span>
                {stat.suffix}
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-emerald-100/85 sm:text-sm">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
