import { ArrowUpRight, CalendarDays, HeartHandshake, UsersRound } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/brand/BrandLogo";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/upcoming-events", label: "Upcoming Events" },
  { href: "/login", label: "Sign In" },
  { href: "/register", label: "Create Account" },
];

const getInvolvedLinks = [
  { href: "/create-event", label: "Create an Event", icon: CalendarDays },
  { href: "/joined-events", label: "Joined Events", icon: UsersRound },
  { href: "/manage-events", label: "Manage Events", icon: HeartHandshake },
];

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100/80 bg-[#f7faf7] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-14 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16 lg:px-10 lg:py-16">
        <div className="max-w-sm">
          <Link
            aria-label="GoodTogether home"
            className="inline-flex rounded-xl outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-slate-950"
            href="/"
          >
            <BrandLogo />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-500 dark:text-slate-400">
            Find your people, show up for your community, and make a positive
            difference together.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h2 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
            Quick Links
          </h2>
          <ul className="mt-4 space-y-3">
            {quickLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  className="group inline-flex items-center gap-1 text-sm transition-colors duration-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-emerald-300"
                  href={href}
                >
                  {label}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Get involved">
          <h2 className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">
            Get Involved
          </h2>
          <ul className="mt-4 space-y-3">
            {getInvolvedLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  className="group inline-flex items-center gap-2.5 text-sm transition-colors duration-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:hover:text-emerald-300"
                  href={href}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  {label}
                  <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-emerald-100/80 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© GoodTogether. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Made for good, made together
            <HeartHandshake aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
