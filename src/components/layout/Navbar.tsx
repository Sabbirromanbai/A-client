"use client";

import {
  CalendarDays,
  CalendarHeart,
  ChevronDown,
  LogOut,
  Menu,
  ArrowUpRight,
  Settings,
  User,
  Users,
  X,
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

function CommunityMark({ className = "h-[1.125rem] w-[1.125rem]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 19c.4-3 2.2-4.6 5.5-4.6s5.1 1.6 5.5 4.6M14.4 14.8c.7-.5 1.5-.8 2.6-.8 2.2 0 3.4 1.1 3.7 3.3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function SunMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.65" />
      <path d="M12 2.8v2m0 14.4v2m9.2-9.2h-2M4.8 12h-2m15.7-6.5-1.4 1.4M6.9 17.1l-1.4 1.4m13 0-1.4-1.4M6.9 6.9 5.5 5.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.65" />
    </svg>
  );
}

function MoonStarMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M18.5 14.2A7.4 7.4 0 0 1 9.8 5.5 7.7 7.7 0 1 0 18.5 14.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.65" />
      <path d="m17.5 3.2.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Zm3.1 7.1.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4.4-1.1Z" fill="currentColor" />
    </svg>
  );
}

export default function Navbar() {
  const { isDark, isReady, toggleTheme } = useTheme();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageErrorUrl, setImageErrorUrl] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const user = session?.user;
  const userInitial = (user?.name?.trim().charAt(0) || user?.email?.charAt(0) || "G").toUpperCase();
  const profileImageUrl = user?.image && user.image !== imageErrorUrl ? user.image : null;

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 12);
    }

    function handlePointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (!error) {
        await refetch();
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    } catch {
      // Keep the current session visible when logout cannot be completed.
    } finally {
      setIsLoggingOut(false);
    }
  }

  function closeMenus() {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }

  function renderProfileLinks() {
    return profileLinks.map(({ href, label, icon: Icon }) => (
      <Link
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition duration-200 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
        href={href}
        key={href}
        onClick={closeMenus}
      >
        <Icon aria-hidden="true" className="h-4 w-4 text-emerald-700 transition-transform duration-200 group-hover:scale-110 dark:text-emerald-300" />
        {label}
      </Link>
    ));
  }

  function renderLogoutButton() {
    return (
      <button
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors duration-200 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-950/40"
        disabled={isLoggingOut}
        onClick={handleLogout}
        type="button"
      >
        <LogOut aria-hidden="true" className="h-4 w-4" />
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
    );
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`relative mx-auto max-w-7xl rounded-[1.4rem] border backdrop-blur-2xl transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out ${
          isScrolled
            ? "translate-y-0 border-emerald-200/75 bg-white/90 shadow-[0_14px_40px_-20px_rgba(15,76,51,0.42)] dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-black/40"
            : "border-white/75 bg-white/72 shadow-[0_10px_36px_-22px_rgba(15,76,51,0.3)] dark:border-slate-700/70 dark:bg-slate-950/72 dark:shadow-black/25"
        }`}
        ref={headerRef}
      >
        <div className="grid min-h-[4.25rem] grid-cols-[1fr_auto] items-center gap-3 px-3 py-2 sm:min-h-[4.75rem] sm:px-5 md:grid-cols-[1fr_auto_1fr]">
          <Link
            aria-label="GoodTogether home"
            className="group min-w-0 justify-self-start rounded-xl outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            href="/"
            onClick={closeMenus}
          >
            <BrandLogo />
          </Link>

          <nav aria-label="Main navigation" className="hidden justify-self-center md:block">
            <Link
              className="group inline-flex items-center gap-2.5 rounded-full border border-transparent px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-emerald-200/80 hover:bg-white/70 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:border-emerald-900/80 dark:hover:bg-slate-900/70 dark:hover:text-emerald-200"
              href="/upcoming-events"
            >
              <CalendarHeart aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-emerald-700 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 dark:text-emerald-300" />
              <span>Upcoming Events</span>
            </Link>
          </nav>

          <div className="flex items-center justify-self-end gap-1 sm:gap-2">
            <button
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="group relative flex h-10 w-[4.35rem] shrink-0 items-center rounded-[1.05rem] border border-emerald-200/80 bg-emerald-50/55 px-1 shadow-[inset_0_1px_2px_rgba(16,87,57,0.08)] backdrop-blur-xl transition-colors duration-300 hover:border-emerald-300 hover:bg-emerald-50/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700/90 dark:bg-slate-900/60 dark:hover:border-emerald-800 dark:hover:bg-slate-900 dark:focus-visible:ring-offset-slate-950"
              disabled={!isReady}
              onClick={toggleTheme}
              type="button"
            >
              <span aria-hidden="true" className={`absolute left-[0.55rem] text-amber-600 transition-opacity duration-200 dark:text-amber-300 ${isDark ? "opacity-55" : "opacity-0"}`}>
                <SunMark />
              </span>
              <span aria-hidden="true" className={`absolute right-[0.55rem] text-indigo-500 transition-opacity duration-200 dark:text-indigo-200 ${isDark ? "opacity-0" : "opacity-55"}`}>
                <MoonStarMark />
              </span>
              <span
                aria-hidden="true"
                className={`relative z-10 flex h-[1.75rem] w-[1.75rem] items-center justify-center rounded-[0.7rem] border border-white/80 bg-white/90 text-amber-600 shadow-[0_2px_8px_rgba(15,76,51,0.16)] transition-transform duration-300 ease-out group-hover:shadow-[0_3px_10px_rgba(15,76,51,0.22)] dark:border-slate-600 dark:bg-slate-800 dark:text-indigo-200 dark:shadow-black/25 ${isDark ? "translate-x-[2rem]" : "translate-x-0"}`}
              >
                {isDark ? <MoonStarMark /> : <SunMark />}
              </span>
            </button>

            {isPending ? (
              <span aria-label="Checking account" className="h-10 w-10 animate-pulse rounded-full bg-slate-200/70 dark:bg-slate-800/80 sm:w-24" />
            ) : user ? (
              <div className="relative">
                <button
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                  aria-label={`Account menu for ${user.name || user.email}`}
                  className="group inline-flex h-10 max-w-48 items-center gap-2 rounded-full border border-white/80 bg-white/65 py-1 pl-1 pr-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-white/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700/80 dark:bg-slate-900/65 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:bg-slate-900"
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 text-sm font-bold text-emerald-800 ring-1 ring-emerald-600/10 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-100"
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
                  <span className="hidden max-w-28 truncate sm:inline">{user.name || user.email}</span>
                  <ChevronDown aria-hidden="true" className={`hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 overflow-hidden rounded-2xl border border-white/75 bg-white/90 p-1.5 shadow-[0_20px_60px_-24px_rgba(15,76,51,0.38)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-900/92 dark:shadow-black/50">
                    <div className="mb-1 border-b border-emerald-100/80 px-3 py-3 dark:border-slate-800">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "GoodTogether member"}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    {renderProfileLinks()}
                    <div className="mt-1 border-t border-emerald-100/80 pt-1 dark:border-slate-800">
                      {renderLogoutButton()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                aria-label="Join Community"
                className="group inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[0.9rem] border border-emerald-700/35 bg-emerald-100/55 px-2.5 text-[0.72rem] font-semibold tracking-[0.015em] text-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_3px_10px_-6px_rgba(16,87,57,0.38)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-700/55 hover:bg-emerald-100/85 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_7px_16px_-8px_rgba(16,87,57,0.46)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:border-emerald-400/25 dark:bg-emerald-950/55 dark:text-emerald-100 dark:hover:border-emerald-300/50 dark:hover:bg-emerald-900/55 dark:focus-visible:ring-offset-slate-950 sm:gap-2 sm:px-3.5"
                href="/login"
              >
                <CommunityMark className="h-[1.05rem] w-[1.05rem] shrink-0 text-emerald-700 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-300" />
                <span className="hidden min-[440px]:inline">Join Community</span>
                <ArrowUpRight aria-hidden="true" className="h-[0.95rem] w-[0.95rem] shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}

            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close mobile navigation" : "Open mobile navigation"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-600 transition-all duration-200 hover:border-emerald-200/80 hover:bg-white/75 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900/75 dark:hover:text-emerald-200 md:hidden"
              onClick={() => {
                setIsMobileMenuOpen((open) => !open);
                setIsProfileMenuOpen(false);
              }}
              type="button"
            >
              {isMobileMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-40 rounded-2xl border border-white/75 bg-white/92 p-2.5 shadow-[0_20px_60px_-24px_rgba(15,76,51,0.38)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-900/92 dark:shadow-black/50 md:hidden"
            id="mobile-navigation"
          >
            <Link
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
              href="/upcoming-events"
              onClick={closeMenus}
            >
              <CalendarHeart aria-hidden="true" className="h-[1.125rem] w-[1.125rem] text-emerald-700 dark:text-emerald-300" />
              Upcoming Events
            </Link>

            {!user && !isPending && (
              <Link
                className="group flex items-center gap-3 rounded-xl border border-emerald-700/25 bg-emerald-100/55 px-3 py-3 text-sm font-semibold text-emerald-900 transition-colors duration-200 hover:border-emerald-700/45 hover:bg-emerald-100/85 dark:border-emerald-400/20 dark:bg-emerald-950/45 dark:text-emerald-100 dark:hover:border-emerald-300/40 dark:hover:bg-emerald-900/50"
                href="/login"
                onClick={closeMenus}
              >
                <CommunityMark className="h-[1.125rem] w-[1.125rem] text-emerald-700 dark:text-emerald-300" />
                Join Community
                <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4" />
              </Link>
            )}

            {user && (
              <>
                <div className="mx-3 my-2 border-t border-emerald-100/80 dark:border-slate-800" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-teal-200 text-sm font-bold text-emerald-800 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-100">
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
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "GoodTogether member"}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                  </span>
                </div>
                {renderProfileLinks()}
                <div className="mt-1 border-t border-emerald-100/80 pt-1 dark:border-slate-800">
                  {renderLogoutButton()}
                </div>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
