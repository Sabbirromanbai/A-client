import { ArrowRight, CalendarDays, Heart, Sparkles, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function CommunityPhoto() {
  return (
    <div className="hero-art relative mx-auto aspect-[0.94] w-full max-w-[34rem]">
      <div aria-hidden="true" className="absolute inset-[1%] rounded-[2.75rem] border border-emerald-200/70 dark:border-emerald-800/60" />
      <div className="hero-photo group absolute inset-[6%] overflow-hidden rounded-[2rem] border border-white/80 bg-emerald-100 shadow-[0_32px_90px_-38px_rgba(16,87,57,0.42)] dark:border-slate-700 dark:bg-slate-900 sm:rounded-[2.5rem]">
        <Image
          alt="Volunteer taking part in a community event"
          className="hero-photo-image object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          fetchPriority="high"
          fill
          loading="eager"
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 42vw"
          src="/goodtogether-hero-v2.jpg"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-transparent to-slate-950/5 dark:from-slate-950/45" />
      </div>

      <div className="hero-badge absolute right-0 top-[13%] flex max-w-[16rem] items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-3 text-sm font-semibold leading-5 text-emerald-900 shadow-xl shadow-emerald-950/15 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-emerald-200 sm:-right-4 sm:px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
          <Sparkles aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
        </span>
        Making an Impact Together
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative isolate flex flex-1 items-center overflow-hidden bg-[#fbfdf9] transition-colors duration-300 dark:bg-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-48 h-[26rem] w-[26rem] rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/40" />
        <div className="absolute -right-52 bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-lime-100/60 blur-3xl dark:bg-teal-950/30" />
      </div>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:py-16">
        <div className="hero-copy relative z-10 mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm shadow-emerald-950/[0.03] dark:border-emerald-800/80 dark:bg-slate-900/80 dark:text-emerald-300 sm:text-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            GOOD THINGS HAPPEN WHEN WE SHOW UP
          </div>

          <h1 className="text-balance text-[2.8rem] font-bold leading-[1.08] tracking-[-0.055em] text-slate-950 dark:text-white sm:text-6xl lg:text-[4.25rem]">
            Together We
            <span className="relative mt-1 inline-block pb-2 text-emerald-700 dark:text-emerald-400">
              Make Change<span className="text-slate-950 dark:text-white">.</span>
              <svg aria-hidden="true" className="hero-underline absolute -bottom-0.5 left-0 h-3 w-full overflow-visible text-emerald-400 dark:text-emerald-600" fill="none" viewBox="0 0 330 12">
                <path
                  className="hero-underline-path"
                  d="M3 8c75-7 170-8 324-2"
                  pathLength="1"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="5"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-lg text-pretty text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8 lg:mx-0">
            Find your people, join community events, and turn a little time together into a lasting positive impact.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              className="hero-cta group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 px-7 text-base font-semibold text-white shadow-lg shadow-emerald-700/20 transition duration-300 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-700/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              href="/upcoming-events"
            >
              <CalendarDays aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
              Explore Events
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              className="hero-cta inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white/75 px-7 text-base font-semibold text-emerald-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/75 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/50 dark:focus-visible:ring-offset-slate-950"
              href="/create-event"
            >
              <UsersRound aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
              Create Event
            </Link>
          </div>

          <div className="mt-9 flex items-center justify-center gap-3 text-left lg:justify-start">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <Heart className="h-[1.125rem] w-[1.125rem]" />
            </span>
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Small actions. Lasting impact.</span>
              <span className="block">Your next good thing starts here.</span>
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[36rem] px-4 pb-8 pt-2 sm:px-8 sm:pb-10 lg:px-6 lg:py-6">
          <CommunityPhoto />
        </div>
      </section>
    </main>
  );
}
