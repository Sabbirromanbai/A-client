
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import BrandLogo from "@/components/brand/BrandLogo";
import { authClient } from "@/lib/auth-client";

const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const requestInProgress = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function notifyRegistrationError(message: string) {
    toast.error(message, { id: "register-feedback" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInProgress.current) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const image = String(formData.get("image") ?? "").trim();

    if (!name) {
      notifyRegistrationError("Please enter your name.");
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      notifyRegistrationError("Please enter a valid email address.");
      return;
    }

    if (!passwordRequirements.test(password)) {
      notifyRegistrationError(
        "Password must be at least 6 characters and include one uppercase and one lowercase letter."
      );
      return;
    }

    if (image) {
      try {
        const imageUrl = new URL(image);
        if (!/^https?:$/.test(imageUrl.protocol)) {
          throw new Error("Invalid image URL");
        }
      } catch {
        notifyRegistrationError("Please enter a valid profile photo URL.");
        return;
      }
    }

    requestInProgress.current = true;
    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        ...(image ? { image } : {}),
      });

      if (error) {
        notifyRegistrationError(
          error.message || "We couldn't create your account. Please try again."
        );
        return;
      }

      toast.success("Your account is ready! Welcome to GoodTogether.", {
        id: "register-feedback",
      });
      router.replace("/");
    } catch {
      notifyRegistrationError(
        "Something went wrong. Please check your details and try again."
      );
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    if (requestInProgress.current) return;

    requestInProgress.current = true;
    setIsGoogleLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        notifyRegistrationError(error.message || "Google sign-up is unavailable.");
      }
    } catch {
      notifyRegistrationError("Google sign-up is unavailable.");
    } finally {
      requestInProgress.current = false;
      setIsGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-[#f0fdf7] px-4 py-8 text-slate-900 transition-colors duration-500 dark:bg-[#06140f] dark:text-slate-100 sm:px-6 lg:py-12">

      {/* Background */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-emerald-300/30 blur-[110px] dark:bg-emerald-700/15" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-lime-300/30 blur-[120px] dark:bg-lime-700/10" />

      {/* Main Card */}
      <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/85 bg-white/85 shadow-[0_30px_100px_-30px_rgba(4,120,87,0.28)] backdrop-blur-2xl transition-colors duration-500 dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/40 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Left Branding Panel */}
        <div className="relative hidden min-h-[720px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#047857] via-[#065f46] to-[#022c22] p-10 text-white lg:flex xl:p-14">

          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full border border-white/10 bg-emerald-300/[0.06] backdrop-blur-2xl" />
          <div className="pointer-events-none absolute right-12 top-1/2 h-32 w-32 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative z-10">
            <Link href="/" aria-label="GoodTogether home" className="inline-flex rounded-xl">
              <BrandLogo inverse />
            </Link>

            <div className="mt-16 max-w-sm xl:mt-24">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-emerald-100 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-lime-300" />
                </span>
                JOIN OUR COMMUNITY
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight xl:text-5xl">
                Be part of something
                <span className="mt-2 block text-emerald-200">
                  bigger than yourself.
                </span>
              </h1>

              <p className="mt-6 text-base leading-8 text-emerald-100/90">
                Every meaningful change starts with someone taking the first
                step. Join GoodTogether and turn small actions into lasting
                impact.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl">
                  <span className="text-2xl">🌱</span>
                  <p className="mt-3 text-sm font-bold">Grow Together</p>
                  <p className="mt-1 text-xs text-emerald-100/70">
                    Build meaningful connections.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl">
                  <span className="text-2xl">💚</span>
                  <p className="mt-3 text-sm font-bold">Make an Impact</p>
                  <p className="mt-1 text-xs text-emerald-100/70">
                    Turn kindness into action.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-sm text-emerald-200/80">
            Together We Make Change.
          </p>
        </div>

        {/* Registration Form */}
        <div className="relative p-7 sm:p-10 lg:p-12 xl:p-14">

          <div className="mb-8 text-center lg:text-left">
            <BrandLogo className="mb-7 lg:hidden" orientation="stacked" />

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
              Start your journey
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Create your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Join a community that makes every day meaningful.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Full name
              </label>
              <input
                autoComplete="name"
                id="name"
                name="name"
                placeholder="Alex Morgan"
                required
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email address
              </label>
              <input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>

              <div className="relative">
                <input
                  autoComplete="new-password"
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:hover:bg-slate-800 dark:hover:text-emerald-300"
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

              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                At least 6 characters, including uppercase and lowercase letters.
              </p>
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Profile photo URL <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="image"
                name="image"
                placeholder="https://example.com/photo.jpg"
                type="url"
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
              />
            </div>

            <button
              className="group relative min-h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-700/25 focus:outline-none focus:ring-4 focus:ring-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-full"
              disabled={isLoading || isGoogleLoading}
              type="submit"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">
                {isLoading ? "Creating your account..." : "Create your account"}
              </span>
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-900/5 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-slate-800 sm:rounded-full"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignUp}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.35 12.23c0-.78-.07-1.54-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
              <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z" />
              <path fill="#FBBC05" d="M6.53 13.85A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.27.3-1.85V7.62H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.38l3.24-2.53Z" />
              <path fill="#EA4335" d="M12 6.12c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.84 3.26 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.37l3.24 2.53c.77-2.31 2.93-4.03 5.47-4.03Z" />
            </svg>
            {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link className="font-bold text-emerald-700 transition-colors hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300" href="/login">
              Sign in →
            </Link>
          </p>

        </div>
      </section>
    </main>
  );
}
