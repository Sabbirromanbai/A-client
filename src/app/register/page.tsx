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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100 sm:px-6">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-950/50" />
      <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-lime-200/70 blur-3xl dark:bg-lime-950/30" />

      <section className="relative w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-900/10 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-10">
        <div className="mb-8 flex w-full flex-col items-center text-center">
          <BrandLogo className="mb-5" orientation="stacked" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Join a community that makes every day a little better.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="name">
              Full name
            </label>
            <input
              autoComplete="name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              id="name"
              name="name"
              placeholder="Alex Morgan"
              required
              type="text"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
              Email address
            </label>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              id="password"
              name="password"
              placeholder="At least 6 characters"
              required
              type="password"
            />
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Use at least 6 characters, with uppercase and lowercase letters.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="image">
              Profile photo URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              id="image"
              name="image"
              placeholder="https://example.com/photo.jpg"
              type="url"
            />
          </div>

          {errorMessage && (
            <p aria-live="polite" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p aria-live="polite" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" role="status">
              {successMessage}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || isGoogleLoading}
            type="submit"
          >
            {isLoading ? "Creating your account..." : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        </div>

        <button
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:bg-slate-800"
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
          {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="mt-7 text-center text-sm text-slate-500 dark:text-slate-400">
          Want to learn more?{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" href="/">
            Return home
          </Link>
        </p>
      </section>
    </main>
  );
}
