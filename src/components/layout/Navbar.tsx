"use client";

import {
  CalendarDays,
  ChevronDown,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "@/components/brand/BrandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";
import { authClient } from "@/lib/auth-client";

const profileLinks = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/create-event", label: "Create Event", icon: CalendarDays },
  { href: "/manage-events", label: "Manage Events", icon: Settings },
  { href: "/joined-events", label: "Joined Events", icon: Users },
];

export default function Navbar() {
  const { isDark, isReady, toggleTheme } = useTheme();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageErrorUrl, setImageErrorUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = session?.user;
  const userInitial = (user?.name?.trim().charAt(0) || user?.email?.charAt(0) || "G").toUpperCase();
  const profileImageUrl = user?.image && user.image !== imageErrorUrl ? user.image : null;

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (!error) {
        await refetch();
        setIsMenuOpen(false);
      }
    } catch {
      // Keep the current session visible when logout cannot be completed.
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex min-h-[4.5rem] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          aria-label="GoodTogether home"
          className="group shrink-0 rounded-xl outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          href="/"
        >
          <BrandLogo />
        </Link>

        <nav aria-label="Main navigation" className="flex min-w-0 flex-1 justify-center">
          <Link
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 sm:px-4"
            href="/upcoming-events"
          >
            <CalendarDays aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span>Upcoming Events</span>
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
            disabled={!isReady}
            onClick={toggleTheme}
            type="button"
          >
            {isReady ? (
              isDark ? <Sun aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" /> : <Moon aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            ) : (
              <span aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
            )}
          </button>

          {isPending ? (
            <span aria-label="Checking account" className="h-10 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                className="inline-flex max-w-44 items-center gap-2 rounded-full border border-emerald-100 bg-white py-1.5 pl-1.5 pr-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen((open) => !open)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200"
                >
                  {profileImageUrl ? (
                    // Google avatar hosts are dynamic, so this image intentionally uses the browser loader.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setImageErrorUrl(profileImageUrl)}
                      src={profileImageUrl}
                    />
                  ) : (
                    userInitial
                  )}
                </span>
                <span className="hidden max-w-24 truncate sm:inline">{user.name || user.email}</span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-xl shadow-emerald-950/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30" role="menu">
                  <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "GoodTogether member"}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                  {profileLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
                      href={href}
                      key={href}
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                    >
                      <Icon aria-hidden="true" className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
                    disabled={isLoggingOut}
                    onClick={handleLogout}
                    role="menuitem"
                    type="button"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-500 hover:to-teal-500 hover:shadow-lg hover:shadow-emerald-600/35 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 sm:px-4"
              href="/login"
            >
              <LogIn aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
