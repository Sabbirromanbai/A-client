"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1450, suffix: "+", label: "Active Volunteers" },
  { value: 180, suffix: "+", label: "Events Completed" },
  { value: 24000, suffix: "+", label: "Lives Impacted" },
  { value: 100, suffix: "%", label: "Community Driven" },
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
      className="border-y border-emerald-100 bg-white/80 px-5 py-10 dark:border-emerald-950 dark:bg-slate-950/70 sm:px-8 sm:py-12 lg:px-10"
      ref={sectionRef}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div className="text-center" key={stat.label}>
            <p className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 sm:text-4xl">
              <span>{formatValue(values[index])}</span>
              {stat.suffix}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300 sm:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
