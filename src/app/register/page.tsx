"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import BrandLogo from "@/components/brand/BrandLogo";
import { authClient } from "@/lib/auth-client";

const passwordRequirements = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const image = String(formData.get("image") ?? "").trim();

    if (!name) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!passwordRequirements.test(password)) {
      setErrorMessage(
        "Password must be at least 6 characters and include one uppercase and one lowercase letter.",
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
        setErrorMessage("Please enter a valid profile photo URL.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        ...(image ? { image } : {}),
      });

      if (error) {
        setErrorMessage(error.message || "We couldn't create your account. Please try again.");
        return;
      }

      setSuccessMessage("Your account is ready! Taking you to GoodTogether...");
      window.setTimeout(() => router.replace("/"), 1200);
    } catch {
      setErrorMessage("Something went wrong. Please check your details and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    if (isLoading || isGoogleLoading) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsGoogleLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (error) {
        setErrorMessage(
          error.message ||
            "Google sign-up is unavailable because the Google provider is not configured.",
        );
      }
    } catch {
      setErrorMessage(
        "Google sign-up is unavailable because the Google provider is not configured.",
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 p-4 sm:p-6 lg:p-8">
      {/* Dynamic Background Mesh Grids & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-600/30 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-600/25 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-teal-500/20 blur-[130px] pointer-events-none" />

      {/* Main Glassmorphism Split / Hero Card */}
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-emerald-950/50">
        
        {/* Left Side: Modern Interactive / Branding Banner */}
        <div className="hidden w-1/2 flex-col justify-between border-r border-white/10 bg-gradient-to-br from-emerald-950/60 via-slate-900/80 to-slate-950/90 p-12 lg:flex">
          <div className="space-y-6">
            <BrandLogo className="h-10 w-auto" orientation="horizontal" />
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Join GoodTogether Community
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Empower your journey with every action.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience a modern platform built for high-performance collaboration, transparent community impact, and seamless onboarding.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <p className="text-xs italic text-slate-300">
              "GoodTogether made organizing our community initiatives effortless. The platform feels smooth, incredibly fast, and inspiring."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                AM
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Alex Morgan</p>
                <p className="text-[11px] text-slate-400">Community Lead</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-End Registration Form */}
        <div className="w-full p-8 sm:p-12 lg:w-1/2">
          <div className="mb-8 lg:hidden">
            <BrandLogo className="mb-4" orientation="stacked" />
          </div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create an Account
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Enter your details below to get started with your account.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="name">
                Full Name
              </label>
              <input
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-md outline-none transition duration-200 focus:border-emerald-500 focus:bg-slate-950/80 focus:ring-2 focus:ring-emerald-500/20"
                id="name"
                name="name"
                placeholder="Alex Morgan"
                required
                type="text"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="email">
                Email Address
              </label>
              <input
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-md outline-none transition duration-200 focus:border-emerald-500 focus:bg-slate-950/80 focus:ring-2 focus:ring-emerald-500/20"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-md outline-none transition duration-200 focus:border-emerald-500 focus:bg-slate-950/80 focus:ring-2 focus:ring-emerald-500/20"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Min. 6 chars with uppercase & lowercase letters.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300" htmlFor="image">
                Profile Photo URL <span className="font-normal text-slate-500">(optional)</span>
              </label>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder-slate-500 backdrop-blur-md outline-none transition duration-200 focus:border-emerald-500 focus:bg-slate-950/80 focus:ring-2 focus:ring-emerald-500/20"
                id="image"
                name="image"
                placeholder="https://example.com/photo.jpg"
                type="url"
              />
            </div>

            {errorMessage && (
              <div aria-live="polite" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300 backdrop-blur-md" role="alert">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div aria-live="polite" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 backdrop-blur-md" role="status">
                {successMessage}
              </div>
            )}

            <button
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || isGoogleLoading}
              type="submit"
            >
              {isLoading ? "Creating account..." : "Get Started Now"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 backdrop-blur-md transition duration-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || isGoogleLoading}
            onClick={handleGoogleSignUp}
            type="button"
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M21.35 12.23c0-.78-.07-1.54-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
              <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.75Z" />
              <path fill="#FBBC05" d="M6.53 13.85A5.85 5.85 0 0 1 6.23 12c0-.64.11-1.27.3-1.85V7.62H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.38l3.24-2.53Z" />
              <path fill="#EA4335" d="M12 6.12c1.44 0 2.73.5 3.75 1.49l2.81-2.81C16.84 3.26 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.71 5.37l3.24 2.53c.77-2.31 2.93-4.03 5.47-4.03Z" />
            </svg>
            {isGoogleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link className="font-semibold text-emerald-400 transition hover:text-emerald-300 hover:underline" href="/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}