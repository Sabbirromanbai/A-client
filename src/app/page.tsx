import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Heart,
  Sparkles,
  UsersRound,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import NewsletterForm from "@/components/NewsletterForm";
import HeroStats from "@/components/home/HeroStats";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiUrl } from "./lib/api-url";

type Event = {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  thumbnailUrl?: string;
  location: string;
  eventDate: string;
};

async function getUpcomingEvents(now: number): Promise<Event[]> {
  const response = await fetch(getApiUrl("api/events?limit=6"), {
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error(`The events service returned status ${response.status}.`);
  }

  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("success" in data) ||
    data.success !== true ||
    !("events" in data) ||
    !Array.isArray(data.events)
  ) {
    throw new Error("The events service returned an invalid response.");
  }

  const events = data.events.filter(
    (event): event is Event =>
      typeof event === "object" &&
      event !== null &&
      "_id" in event &&
      typeof event._id === "string" &&
      "title" in event &&
      typeof event.title === "string" &&
      "description" in event &&
      typeof event.description === "string" &&
      "eventType" in event &&
      typeof event.eventType === "string" &&
      "location" in event &&
      typeof event.location === "string" &&
      "eventDate" in event &&
      typeof event.eventDate === "string" &&
      Number.isFinite(Date.parse(event.eventDate)) &&
      (!("thumbnailUrl" in event) || typeof event.thumbnailUrl === "string"),
  );

  return events
    .filter(
      (event) =>
        Date.parse(event.eventDate) > now &&
        event.title.trim().toLowerCase() !== "tree plantation",
    )
    .sort((a, b) => Date.parse(a.eventDate) - Date.parse(b.eventDate))
    .slice(0, 6);
}

async function loadUpcomingEvents(): Promise<{
  events: Event[];
  failed: boolean;
}> {
  const now = Date.now();
  try {
    return { events: await getUpcomingEvents(now), failed: false };
  } catch (error) {
    console.error("Failed to load upcoming community events.", error);
    return { events: [], failed: true };
  }
}

function CommunityPhoto() {
  return (
    <div className="hero-art relative mx-auto aspect-[0.94] w-full max-w-[34rem]">
      <div
        aria-hidden="true"
        className="absolute inset-[1%] rounded-[2.75rem] border border-emerald-200/70 dark:border-emerald-800/60"
      />

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

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-transparent to-slate-950/5 dark:from-slate-950/45"
        />
      </div>

      <div className="hero-badge absolute right-0 top-[13%] flex max-w-[16rem] items-center gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-3 text-sm font-semibold leading-5 text-emerald-900 shadow-xl shadow-emerald-950/15 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-emerald-200 sm:-right-4 sm:px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
          <Sparkles className="h-[1.125rem] w-[1.125rem]" />
        </span>
        Making an Impact Together
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-52 overflow-hidden bg-emerald-50 dark:bg-slate-800">
        {event.thumbnailUrl ? (
          <Image
            src={event.thumbnailUrl}
            alt={event.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Heart className="h-12 w-12 text-emerald-300" />
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm dark:bg-slate-900/95 dark:text-emerald-300">
          {event.eventType}
        </span>
      </div>

      <div className="p-6">
        <h3 className="line-clamp-1 text-xl font-bold text-slate-900 dark:text-white">
          {event.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {event.description}
        </p>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            {new Date(event.eventDate).toLocaleDateString("en-BD", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            {event.location}
          </p>
        </div>

        <Link
          href={`/event-details/${encodeURIComponent(event._id)}`}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-950"
        >
          View Details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function UpcomingEventsHeading() {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-emerald-600">
          Make a Difference
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Upcoming Community Events
        </h2>
        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Discover meaningful events and become part of something good.
        </p>
      </div>
      <Link
        href="/upcoming-events"
        className="inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400"
      >
        Explore All Events
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function UpcomingEventsSection({ children }: { children: ReactNode }) {
  return (
    <section className="bg-white px-5 py-20 dark:bg-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <UpcomingEventsHeading />
        {children}
      </div>
    </section>
  );
}

async function UpcomingCommunityEvents() {
  await connection();
  const { events, failed } = await loadUpcomingEvents();
  if (failed) {
    return (
      <UpcomingEventsSection>
        <div
          className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/70 px-6 py-16 text-center dark:border-rose-900/70 dark:bg-rose-950/20"
          role="alert"
        >
          <CircleAlert className="mx-auto h-10 w-10 text-rose-600 dark:text-rose-400" />
          <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
            Events couldn&apos;t be loaded
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Please try again later or explore all community events.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400"
            href="/upcoming-events"
          >
            Explore All Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </UpcomingEventsSection>
    );
  }

  return (
    <UpcomingEventsSection>
      {events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <CalendarDays className="mx-auto h-10 w-10 text-emerald-500" />
          <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
            No Upcoming Events
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            New community events will appear here soon.
          </p>
        </div>
      )}
    </UpcomingEventsSection>
  );
}

function UpcomingEventsLoading() {
  return (
    <UpcomingEventsSection>
      <div
        aria-label="Loading upcoming events"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            key={index}
          >
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="mt-5 h-6 w-3/4" />
            <Skeleton className="mt-3 h-12 w-full" />
            <Skeleton className="mt-5 h-10 w-full" />
          </div>
        ))}
        <span className="sr-only">Loading upcoming community events…</span>
      </div>
    </UpcomingEventsSection>
  );
}

export default function Home() {
  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#fbfdf9] transition-colors duration-300 dark:bg-slate-950">
      {/* Background Decorations */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-48 h-[26rem] w-[26rem] rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/40" />
        <div className="absolute -right-52 bottom-[-12rem] h-[32rem] w-[32rem] rounded-full bg-lime-100/60 blur-3xl dark:bg-teal-950/30" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:py-16">
        <div className="hero-copy relative z-10 mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm dark:border-emerald-800/80 dark:bg-slate-900/80 dark:text-emerald-300 sm:text-sm">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            GOOD THINGS HAPPEN WHEN WE SHOW UP
          </div>

          <h1 className="text-balance text-[2.8rem] font-bold leading-[1.08] tracking-[-0.055em] text-slate-950 dark:text-white sm:text-6xl lg:text-[4.25rem]">
            Together We
            <span className="relative mt-1 inline-block pb-2 text-emerald-700 dark:text-emerald-400">
              Make Change
              <span className="text-slate-950 dark:text-white">.</span>
              <svg
                aria-hidden="true"
                className="hero-underline absolute -bottom-0.5 left-0 h-3 w-full overflow-visible text-emerald-400 dark:text-emerald-600"
                fill="none"
                viewBox="0 0 330 12"
              >
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
            Find your people, join community events, and turn a little time
            together into a lasting positive impact.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link
              className="hero-cta group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 px-7 text-base font-semibold text-white shadow-lg shadow-emerald-700/20 transition duration-300 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
              href="/upcoming-events"
            >
              <CalendarDays className="h-[1.125rem] w-[1.125rem]" />
              Explore Events
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              className="hero-cta inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white/75 px-7 text-base font-semibold text-emerald-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/75 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/50"
              href="/create-event"
            >
              <UsersRound className="h-[1.125rem] w-[1.125rem]" />
              Create Event
            </Link>
          </div>

          <div className="mt-9 flex items-center justify-center gap-3 text-left lg:justify-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <Heart className="h-[1.125rem] w-[1.125rem]" />
            </span>

            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Small actions. Lasting impact.
              </span>
              <span className="block">Your next good thing starts here.</span>
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[36rem] px-4 pb-8 pt-2 sm:px-8 sm:pb-10 lg:px-6 lg:py-6">
          <CommunityPhoto />
        </div>
      </section>

      <HeroStats />

      <Suspense fallback={<UpcomingEventsLoading />}>
        <UpcomingCommunityEvents />
      </Suspense>

      {/* Why GoodTogether Section */}
      <section className="relative overflow-hidden bg-[#f5faf6] px-5 py-24 dark:bg-slate-900/60 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-700 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Why GoodTogether
            </span>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Small Actions,{" "}
              <span className="text-emerald-600">Big Impact.</span>
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              Making a positive difference should be simple. Find opportunities,
              connect with people, and create meaningful change together.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CalendarDays,
                number: "01",
                title: "Discover Events",
                description:
                  "Explore meaningful community events and find opportunities that match your interests.",
              },
              {
                icon: UsersRound,
                number: "02",
                title: "Join Community",
                description:
                  "Meet like-minded people and become part of a community that cares.",
              },
              {
                icon: Heart,
                number: "03",
                title: "Make an Impact",
                description:
                  "Turn your time and energy into real positive changes in people's lives.",
              },
              {
                icon: Sparkles,
                number: "04",
                title: "Create Events",
                description:
                  "Start your own initiative and inspire others to participate in something meaningful.",
              },
            ].map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.number}
                  className="group relative rounded-3xl border border-emerald-100 bg-white p-7 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400">
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="text-sm font-bold tracking-widest text-emerald-200 dark:text-emerald-900">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-6 h-1 w-10 rounded-full bg-emerald-500 transition-all duration-300 group-hover:w-20" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section className="bg-white px-5 py-24 dark:bg-slate-950 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                Our Community
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Moments That <span className="text-emerald-600">Matter.</span>
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-500 dark:text-slate-400">
                Every small action creates a beautiful story. Explore the
                moments that bring our community together.
              </p>
            </div>

            <Link
              href="/upcoming-events"
              className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:gap-3 dark:text-emerald-400"
            >
              Join Our Community
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Community Together",
                category: "Teamwork",
                image:
                  "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8",
              },
              {
                title: "Growing a Greener Future",
                category: "Tree Plantation",
                image:
                  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
              },
              {
                title: "Helping Hands",
                category: "Volunteering",
                image:
                  "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
              },
              {
                title: "Making a Difference",
                category: "Community Care",
                image:
                  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b",
              },
            ].map((photo) => (
              <article
                key={photo.title}
                className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  aria-label={photo.title}
                  className="relative aspect-[16/10] overflow-hidden bg-emerald-50 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02] dark:bg-slate-800"
                  role="img"
                  style={{
                    backgroundImage: `url("${photo.image}?auto=format&fit=crop&w=1200&q=85")`,
                  }}
                />
                <div className="p-5">
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {photo.category}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                    {photo.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white px-5 pb-24 pt-10 dark:bg-slate-950 sm:px-8 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 px-6 py-16 text-center shadow-2xl shadow-emerald-900/15 sm:px-12 lg:py-20">
          {/* Background Decorations */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-20 top-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur">
              <Heart className="h-4 w-4" />
              Stay Connected
            </span>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Be Part of Something{" "}
              <span className="text-emerald-300">Good.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">
              Stay updated with upcoming community events, inspiring stories,
              and opportunities to make a positive difference.
            </p>

            <NewsletterForm />

            <p className="mt-4 text-xs text-emerald-100/60">
              No spam. Just good news and meaningful opportunities.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
