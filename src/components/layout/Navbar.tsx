"use client";

import {
  CalendarDays,
  CalendarCheck,
  CalendarHeart,
  CalendarPlus,
  ChevronDown,
  ClipboardList,
  House,
  LogIn,
  LogOut,
  Menu,
  Moon,
  ArrowUpRight,
  Settings,
  Sun,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import BrandLogo from "@/components/brand/BrandLogo";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

const profileLinks = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/create-event", label: "Create Event", icon: CalendarDays },
  { href: "/manage-events", label: "Manage Events", icon: Settings },
  { href: "/joined-events", label: "Joined Events", icon: Users },
];

const mobileProfileLinks = [
  { href: "/create-event", label: "Create Event", icon: CalendarPlus },
  { href: "/manage-events", label: "Manage Events", icon: ClipboardList },
  { href: "/joined-events", label: "Joined Events", icon: CalendarCheck },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const logoutRequestInProgress = useRef(false);
  const user = session?.user;
  const userInitial = (user?.name?.trim().charAt(0) || user?.email?.charAt(0) || "G").toUpperCase();

  useEffect(() => {
    function updateScrollState() {
      setIsScrolled(window.scrollY > 12);
    }

    function handlePointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (isMobileMenuOpen) {
          mobileMenuButtonRef.current?.focus();
        }
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
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    if (logoutRequestInProgress.current) return;

    logoutRequestInProgress.current = true;
    setIsLoggingOut(true);
    try {
      const { error } = await authClient.signOut();
      if (error) {
        toast.error(error.message || "We couldn’t log you out. Please try again.", {
          id: "logout-feedback",
        });
        return;
      }

      toast.success("You’ve been logged out.", { id: "logout-feedback" });
      setIsMobileMenuOpen(false);
      try {
        await refetch();
      } catch (error) {
        console.error("Could not refresh the session after logout.", error);
      }
    } catch (error) {
      console.error("Could not log out.", error);
      toast.error("We couldn’t log you out. Please try again.", {
        id: "logout-feedback",
      });
    } finally {
      logoutRequestInProgress.current = false;
      setIsLoggingOut(false);
    }
  }

  function closeMenus() {
    setIsMobileMenuOpen(false);
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
        <div className="grid min-h-[4.25rem] grid-cols-[1fr_auto] items-center gap-1 px-2 py-2 sm:min-h-[4.75rem] sm:gap-3 sm:px-5 md:grid-cols-[1fr_auto_1fr]">
          <Link
            aria-label="GoodTogether home"
            className="group min-w-0 shrink-0 justify-self-start rounded-xl outline-none transition-opacity duration-200 hover:opacity-85 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            href="/"
            onClick={closeMenus}
          >
            <BrandLogo compact />
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

          <div className="hidden items-center justify-self-end gap-1 sm:gap-2 md:flex">
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
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`Account menu for ${user.name || user.email}`}
                    className="group inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-full border border-white/80 bg-white/65 py-1 pl-1 pr-2 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-white/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700/80 dark:bg-slate-900/65 dark:hover:border-emerald-800 dark:hover:bg-slate-900"
                  >
                    <Avatar className="h-8 w-8 ring-1 ring-emerald-600/10">
                      <AvatarImage alt="" src={user.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-200 text-sm font-bold text-emerald-800 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-100">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ease-out group-hover:translate-y-0.5 group-hover:text-emerald-700 group-data-[popup-open]:rotate-180 dark:group-hover:text-emerald-300"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 overflow-hidden rounded-2xl border border-white/75 bg-white/90 p-1.5 text-slate-700 shadow-[0_20px_60px_-24px_rgba(15,76,51,0.38)] backdrop-blur-2xl dark:border-slate-700/80 dark:bg-slate-900/92 dark:text-slate-200 dark:shadow-black/50"
                    sideOffset={12}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="mb-1 border-b border-emerald-100/80 px-3 py-3 dark:border-slate-800">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "GoodTogether member"}</p>
                        <p className="mt-0.5 truncate text-xs font-normal text-slate-500 dark:text-slate-400">{user.email}</p>
                      </DropdownMenuLabel>
                      {profileLinks.map(({ href, label, icon: Icon }) => (
                        <DropdownMenuItem
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 focus:bg-emerald-50 focus:text-emerald-800 dark:text-slate-300 dark:focus:bg-emerald-950/60 dark:focus:text-emerald-200"
                          key={href}
                          render={<Link href={href} />}
                        >
                          <Icon aria-hidden="true" className="h-4 w-4 text-emerald-700 transition-transform duration-200 group-hover:scale-110 dark:text-emerald-300" />
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  aria-label={isLoggingOut ? "Logging out" : "Logout"}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose-200/70 bg-white/65 text-rose-600 shadow-sm transition-all duration-200 hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-wait disabled:opacity-60 dark:border-rose-900/70 dark:bg-slate-900/65 dark:text-rose-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 sm:w-auto sm:gap-2 sm:px-3"
                  disabled={isLoggingOut}
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  <span className="hidden text-sm font-medium sm:inline">
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </span>
                </button>
              </>
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

          </div>
          <div className="flex items-center justify-self-end gap-0.5 px-0 pb-2 min-[360px]:gap-1 min-[360px]:px-1 md:hidden">
            <button
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200/80 bg-emerald-50/55 text-emerald-800 shadow-sm transition-colors duration-200 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700/90 dark:bg-slate-900/60 dark:text-emerald-200 dark:hover:border-emerald-800 dark:hover:bg-slate-900 min-[360px]:h-9 min-[360px]:w-9"
              disabled={!isReady}
              onClick={toggleTheme}
              type="button"
            >
              {isDark ? (
                <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              )}
            </button>

            {user ? (
              <Link
                aria-label={`View ${user.name || "your"} profile`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full outline-none ring-1 ring-emerald-500/60 transition-shadow hover:ring-2 focus-visible:ring-2 min-[360px]:h-9 min-[360px]:w-9"
                href="/profile"
                onClick={closeMenus}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage alt="" src={user.image || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-200 text-sm font-bold text-emerald-800 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-100">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                aria-label="Login"
                className="inline-flex h-8 shrink-0 items-center justify-center gap-0.5 rounded-full border border-emerald-700/35 bg-emerald-100/55 px-1 text-[0.7rem] font-semibold text-emerald-900 shadow-sm transition-colors hover:border-emerald-700/55 hover:bg-emerald-100/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-emerald-400/25 dark:bg-emerald-950/55 dark:text-emerald-100 dark:hover:border-emerald-300/50 min-[360px]:h-9 min-[360px]:gap-1 min-[360px]:px-2 min-[360px]:text-xs"
                href="/login"
                onClick={closeMenus}
              >
                <LogIn aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                Login
              </Link>
            )}

            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close mobile navigation" : "Open mobile navigation"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 text-slate-600 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/75 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-800 dark:hover:bg-slate-900/75 dark:hover:text-emerald-200 min-[360px]:h-9 min-[360px]:w-9"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              ref={mobileMenuButtonRef}
              type="button"
            >
              {isMobileMenuOpen ? (
                <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Menu aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

          <nav
            aria-hidden={!isMobileMenuOpen}
            aria-label="Mobile navigation"
            className={`absolute left-2 right-2 top-[calc(100%+0.5rem)] z-40 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl border border-white/75 bg-white/95 p-2.5 shadow-[0_20px_60px_-24px_rgba(15,76,51,0.38)] backdrop-blur-2xl transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-black/50 md:hidden ${
              isMobileMenuOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible pointer-events-none -translate-y-2 scale-[0.98] opacity-0"
            }`}
            id="mobile-navigation"
            inert={!isMobileMenuOpen}
          >
            <Link
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
              href="/"
              onClick={closeMenus}
            >
              <House aria-hidden="true" className="h-4 w-4 text-emerald-700 dark:text-emerald-300" strokeWidth={1.8} />
              Home
            </Link>
            <Link
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
              href="/upcoming-events"
              onClick={closeMenus}
            >
              <CalendarDays aria-hidden="true" className="h-4 w-4 text-emerald-700 dark:text-emerald-300" strokeWidth={1.8} />
              Upcoming Events
            </Link>

            {user &&
              mobileProfileLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-800 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
                    href={href}
                    key={href}
                    onClick={closeMenus}
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 text-emerald-700 dark:text-emerald-300" strokeWidth={1.8} />
                    {label}
                  </Link>
                ))}

            {!user && !isPending && (
              <Link
                className="group flex items-center gap-3 rounded-xl border border-emerald-700/25 bg-emerald-100/55 px-3 py-3 text-sm font-semibold text-emerald-900 transition-colors duration-200 hover:border-emerald-700/45 hover:bg-emerald-100/85 dark:border-emerald-400/20 dark:bg-emerald-950/45 dark:text-emerald-100 dark:hover:border-emerald-300/40 dark:hover:bg-emerald-900/50"
                href="/login"
                onClick={closeMenus}
              >
                <Users aria-hidden="true" className="h-4 w-4 text-emerald-700 dark:text-emerald-300" strokeWidth={1.8} />
                Join Community
              </Link>
            )}

            {user && (
              <>
                <div className="my-2 border-t border-emerald-100/80 dark:border-slate-800" />
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <Avatar className="h-9 w-9 shrink-0 ring-1 ring-emerald-600/10">
                    <AvatarImage alt="" src={user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-teal-200 text-sm font-bold text-emerald-800 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-100">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name || "GoodTogether member"}</span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                  </span>
                </div>
                <button
                  aria-label={isLoggingOut ? "Logging out" : "Logout"}
                  className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-300/70 bg-rose-50/70 px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:border-rose-400 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-wait disabled:opacity-60 dark:border-rose-900/70 dark:bg-rose-950/35 dark:text-rose-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/60"
                  disabled={isLoggingOut}
                  onClick={() => void handleLogout()}
                  type="button"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            )}
          </nav>
      </div>
    </header>
  );
}
