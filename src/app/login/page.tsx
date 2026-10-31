
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import BrandLogo from "@/components/brand/BrandLogo";
import { authClient } from "@/lib/auth-client";

type Toast = {
  message: string;
  type: "error" | "success";
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMethod, setLoadingMethod] = useState<"email" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function showToast(message: string, type: Toast["type"]) {
    setToast({ message, type });
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    if (!password) {
      showToast("Please enter your password.", "error");
      return;
    }

    setIsLoading(true);
    setLoadingMethod("email");

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        showToast(error.message || "Invalid email or password. Please try again.", "error");
        return;
      }

      showToast("Welcome back! Taking you to GoodTogether...", "success");
      window.setTimeout(() => router.replace("/"), 900);
    } catch {
      showToast("Invalid email or password. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setLoadingMethod(null);
    }
  }

  async function handleGoogleLogin() {
    setToast(null);
    setIsLoading(true);
    setLoadingMethod("google");

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        showToast(error.message || "Google sign-in is unavailable.", "error");
      }
    } catch {
      showToast("Google sign-in is unavailable.", "error");
    } finally {
      setIsLoading(false);
      setLoadingMethod(null);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f0fdf7] px-4 py-8 text-slate-900 transition-colors duration-500 dark:bg-[#06140f] dark:text-slate-100 sm:px-6 lg:py-12">

      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-emerald-300/30 blur-[110px] dark:bg-emerald-700/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-lime-300/30 blur-[120px] dark:bg-lime-700/10" />

      {/* Toast */}
      {toast && (
        <div
          aria-live="polite"
          className={`fixed right-4 top-4 z-30 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl sm:right-6 sm:top-6 ${
            toast.type === "success"
              ? "border-emerald-200 bg-white/90 text-emerald-800 dark:border-emerald-800 dark:bg-slate-900/90 dark:text-emerald-300"
              : "border-red-200 bg-white/90 text-red-700 dark:border-red-900 dark:bg-slate-900/90 dark:text-red-300"
          }`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
            {toast.type === "success" ? "✓" : "!"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Main Card */}
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 shadow-[0_30px_100px_-30px_rgba(4,120,87,0.25)] backdrop-blur-2xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/40 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Left Panel */}
        <div className="relative hidden min-h-[650px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#047857] via-[#065f46] to-[#022c22] p-10 text-white lg:flex xl:p-14">

          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-white/10 bg-emerald-300/[0.06] backdrop-blur-2xl" />
          <div className="pointer-events-none absolute right-12 top-1/2 h-32 w-32 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative z-10">
            <Link
              aria-label="GoodTogether home"
              className="inline-flex rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white"
              href="/"
            >
              <BrandLogo inverse />
            </Link>

            <div className="mt-24 max-w-sm">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-100 backdrop-blur-xl">
                <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" />
                BETTER TOGETHER
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-5xl">
                Small moments.
                <span className="mt-2 block text-emerald-200">
                  Meaningful connections.
                </span>
              </h1>

              <p className="mt-6 max-w-sm text-base leading-8 text-emerald-100/90">
                Sign in to keep building a kinder, more connected community
                with GoodTogether.
              </p>

              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-700 bg-amber-100 text-sm">🌱</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-700 bg-sky-100 text-sm">🤝</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-700 bg-orange-100 text-sm">💚</span>
                </div>
                <p className="text-xs leading-5 text-emerald-100">
                  Connect. Participate.
                  <br />
                  Make a difference.
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-emerald-200/80">
            Together We Make Change.
          </p>
        </div>

        {/* Right Panel */}
        <div className="relative p-7 sm:p-10 lg:p-12 xl:p-14">

          <div className="mb-8 text-center lg:text-left">
            <BrandLogo className="mb-7 lg:hidden" orientation="stacked" />

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              Welcome back
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Sign in to GoodTogether
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Continue where you left off.
            </p>
          </div>

          {/* Google Login */}
          <button
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-900/5 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-slate-800"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.35 12.23c0-.78-.07-1.54-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
              <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z" />
              <path fill="#FBBC05" d="M6.53 13.85A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.27.3-1.85V7.62H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.38l3.24-2.53Z" />
              <path fill="#EA4335" d="M12 6.12c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.84 3.26 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.37l3.24 2.53c.77-2.31 2.93-4.03 5.47-4.03Z" />
            </svg>
            {loadingMethod === "google" ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Email Form */}
          <form className="space-y-5" onSubmit={handleEmailLogin} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="email">
                Email address
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 text-sm text-slate-900 outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="password">
                Password
              </label>

              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-4 pr-12 text-sm text-slate-900 outline-none backdrop-blur-xl transition-all duration-300 placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                />

                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? (
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 4.24A10.84 10.84 0 0 1 12 4c5 0 8.5 4 9.5 8a11.5 11.5 0 0 1-2.03 4.02m-3.4 2.2A10.8 10.8 0 0 1 12 20c-5 0-8.5-4-9.5-8a11.4 11.4 0 0 1 3.7-5.4" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <input
                checked={rememberMe}
                className="h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
                name="rememberMe"
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
              />
              Remember me
            </label>

            <button
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-emerald-700/30 focus:outline-none focus:ring-4 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">
                {loadingMethod === "email" ? "Signing you in..." : "Sign in to your account"}
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            New to GoodTogether?{" "}
            <Link className="font-bold text-emerald-700 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300" href="/register">
              Create an account →
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}
