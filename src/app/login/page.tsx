"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
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
        showToast(
          error.message ||
            "Google sign-in is unavailable because the Google provider is not configured.",
          "error",
        );
      }
    } catch {
      showToast(
        "Google sign-in is unavailable because the Google provider is not configured.",
        "error",
      );
    } finally {
      setIsLoading(false);
      setLoadingMethod(null);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-50 px-4 py-8 text-slate-900 sm:px-6 lg:py-12">
      <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-emerald-200/60 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-lime-200/70 blur-3xl" />

      {toast && (
        <div
          aria-live="polite"
          className={`fixed right-4 top-4 z-20 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl sm:right-6 sm:top-6 ${
            toast.type === "success"
              ? "border-emerald-200 bg-white text-emerald-800"
              : "border-red-200 bg-white text-red-700"
          }`}
          role={toast.type === "error" ? "alert" : "status"}
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
              toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
            }`}
          >
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-emerald-700 p-10 text-white lg:flex xl:p-14">
          <div>
            <Link className="inline-flex items-center gap-3" href="/">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-emerald-700">
                G
              </span>
              <span className="text-lg font-semibold tracking-wide">GoodTogether</span>
            </Link>
            <div className="mt-24 max-w-sm">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Better together
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Small moments. Meaningful connections.
              </h1>
              <p className="mt-6 text-base leading-7 text-emerald-100">
                Sign in to keep building a kinder, more connected community with GoodTogether.
              </p>
            </div>
          </div>
          <p className="text-sm text-emerald-200">A little good goes a long way.</p>
        </div>

        <div className="p-7 sm:p-10 lg:p-12 xl:p-14">
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-600/25 lg:hidden">
              G
            </div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to GoodTogether</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Continue where you left off.</p>
          </div>

          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.35 12.23c0-.78-.07-1.54-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
              <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z" />
              <path fill="#FBBC05" d="M6.53 13.85A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.27.3-1.85V7.62H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.38l3.24-2.53Z" />
              <path fill="#EA4335" d="M12 6.12c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.84 3.26 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.37l3.24 2.53c.77-2.31 2.93-4.03 5.47-4.03Z" />
            </svg>
            {loadingMethod === "google" ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form className="space-y-5" onSubmit={handleEmailLogin} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email address
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
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

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
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
              className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {loadingMethod === "email" ? "Signing you in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            New to GoodTogether?{" "}
            <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
