
import {
  ArrowUpRight,
  CalendarDays,
  HeartHandshake,
  UsersRound,
  Sparkles,
  Heart,
  Leaf,
  MoveUpRight,
} from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";

const quickLinks = [
  { href: "/", label: "Home", icon: Heart },
  { href: "/upcoming-events", label: "Upcoming Events", icon: CalendarDays },
  { href: "/login", label: "Sign In", icon: ArrowUpRight },
  { href: "/register", label: "Create Account", icon: UsersRound },
];

const getInvolvedLinks = [
  { href: "/create-event", label: "Create an Event", icon: CalendarDays },
  { href: "/joined-events", label: "Joined Events", icon: UsersRound },
  { href: "/manage-events", label: "Manage Events", icon: HeartHandshake },
];

export default function Footer() {
  return (
    <footer className="relative isolate w-full min-w-0 overflow-hidden border-t border-emerald-100/80 bg-[#f7faf7] text-slate-600 dark:border-slate-800 dark:bg-[#080f0d] dark:text-slate-400">

      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-emerald-200/25 blur-[100px] dark:bg-emerald-900/15" />
        <div className="absolute -bottom-48 -left-40 h-96 w-96 rounded-full bg-teal-200/20 blur-[100px] dark:bg-teal-900/10" />
      </div>

      {/* Top Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-70" />

      <div className="mx-auto w-full min-w-0 max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">

        {/* Main Footer */}
        <div className="grid min-w-0 grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1fr] lg:gap-20">

          {/* Brand Column */}
          <div className="min-w-0 max-w-md">
            <Link
              aria-label="GoodTogether home"
              className="inline-flex rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950"
              href="/"
            >
              <BrandLogo />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
              Find your people, show up for your community, and make a
              positive difference together. Every small action can create
              a meaningful change.
            </p>

            {/* Brand Message */}
            <div className="mt-7 inline-flex max-w-full flex-wrap items-center gap-3 rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 shadow-sm shadow-emerald-950/[0.03] backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <Leaf className="h-5 w-5" />
              </span>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Together We Make Change.
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Small actions. Lasting impact.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links" className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Sparkles className="h-[18px] w-[18px]" />
              </span>

              <h2 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                Quick Links
              </h2>
            </div>

            <ul className="mt-6 space-y-4">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-3 text-sm transition-colors duration-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-emerald-300"
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 text-emerald-600/70 transition-all duration-200 group-hover:scale-110 group-hover:text-emerald-600 dark:text-emerald-500"
                    />
                    <span>{label}</span>
                    <MoveUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get Involved */}
          <nav aria-label="Get involved" className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <HeartHandshake className="h-[18px] w-[18px]" />
              </span>

              <h2 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
                Get Involved
              </h2>
            </div>

            <ul className="mt-6 space-y-4">
              {getInvolvedLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-3 text-sm transition-colors duration-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-emerald-300"
                  >
                    <Icon
                      aria-hidden="true"
                      className="h-4 w-4 text-emerald-600/70 transition-all duration-200 group-hover:scale-110 group-hover:text-emerald-600 dark:text-emerald-500"
                    />
                    <span>{label}</span>
                    <MoveUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 border-t border-emerald-100/80 pt-7 dark:border-slate-800 sm:mt-16">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

            <p className="text-center text-xs leading-6 text-slate-500 dark:text-slate-500 sm:text-left">
              ©{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                GoodTogether
              </span>
              . All rights reserved.
            </p>

            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/70 px-4 py-2 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Building a better community
            </div>

            <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
              Made with
              <Heart
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600"
              />
              for a better community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
