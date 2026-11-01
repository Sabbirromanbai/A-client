import type { HTMLAttributes } from "react";

type BrandLogoProps = HTMLAttributes<HTMLDivElement> & {
  compact?: boolean;
  inverse?: boolean;
  orientation?: "horizontal" | "stacked";
};

export default function BrandLogo({
  className = "",
  compact = false,
  inverse = false,
  orientation = "horizontal",
  ...props
}: BrandLogoProps) {
  const isStacked = orientation === "stacked";

  return (
    <div
      aria-label="GoodTogether — Together We Make Change."
      className={`flex ${compact ? "w-auto gap-0.5 min-[360px]:gap-1.5 md:w-full md:gap-2.5" : "w-full gap-2.5"} ${isStacked ? "flex-col items-center text-center" : "items-center"} ${className}`}
      {...props}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl shadow-lg transition-colors duration-300 ${
          inverse
            ? "bg-white text-emerald-700 shadow-emerald-950/10"
            : "bg-emerald-50 text-emerald-600 shadow-emerald-600/15 dark:bg-emerald-950/60 dark:text-emerald-300"
        } ${isStacked ? "h-14 w-14" : compact ? "h-8 w-8 min-[360px]:h-9 min-[360px]:w-9 md:h-10 md:w-10" : "h-10 w-10"}`}
      >
        <svg aria-hidden="true" className={isStacked ? "h-8 w-8" : compact ? "h-5 w-5 md:h-6 md:w-6" : "h-6 w-6"} fill="none" viewBox="0 0 48 48">
          <path
            d="M24 40.5S7 30.7 7 18.2C7 12.8 10.8 9 15.6 9c3.3 0 6.4 1.9 8.4 4.9C26 10.9 29.1 9 32.4 9 37.2 9 41 12.8 41 18.2c0 12.5-17 22.3-17 22.3Z"
            fill="currentColor"
            opacity="0.95"
          />
          <circle cx="17" cy="18" fill={inverse ? "#047857" : "#ecfdf5"} r="3.2" />
          <circle cx="31" cy="18" fill={inverse ? "#047857" : "#ecfdf5"} r="3.2" />
          <path
            d="M11.5 29.5c1.2-4.2 4.4-6.2 8.2-6.2 1.7 0 3.2.4 4.3 1.2 1.1-.8 2.6-1.2 4.3-1.2 3.8 0 7 2 8.2 6.2"
            stroke={inverse ? "#047857" : "#ecfdf5"}
            strokeLinecap="round"
            strokeWidth="2.4"
          />
        </svg>
      </span>
      <span className={`flex ${compact ? "min-w-0" : ""} flex-col`}>
        <span className={`font-bold tracking-tight ${compact ? "whitespace-nowrap" : ""} ${inverse ? "text-white" : "text-slate-900 dark:text-white"} ${isStacked ? "text-lg" : compact ? "text-[0.72rem] min-[360px]:text-[0.9rem] md:text-lg" : "text-base sm:text-lg"}`}>
          Good<span className="text-emerald-500">Together</span>
        </span>
        <span className={`${compact ? "whitespace-nowrap text-[0.55rem] tracking-normal md:text-[0.62rem] md:tracking-[0.14em]" : "text-[0.62rem] tracking-[0.14em]"} font-medium leading-4 ${inverse ? "text-emerald-100" : "text-emerald-600/80 dark:text-emerald-400"}`}>
          Together We Make Change.
        </span>
      </span>
    </div>
  );
}
