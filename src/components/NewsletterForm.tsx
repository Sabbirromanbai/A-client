"use client";

import { ArrowRight } from "lucide-react";
import type { FormEvent } from "react";

export default function NewsletterForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      className="mx-auto mt-7 flex max-w-xl flex-col gap-2 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.45)] sm:mt-9 sm:flex-row sm:rounded-full"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        required
        placeholder="Enter your email address"
        aria-label="Email address"
        className="min-h-12 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 sm:rounded-full sm:pl-5"
      />

      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:rounded-full"
      >
        Subscribe
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
