import {
  ArrowRight,
  CalendarDays,
  BookOpen,
  CircleAlert,
  HeartHandshake,
  HandHeart,
  Heart,
  Sparkles,
  Sprout,
  UsersRound,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import NewsletterForm from "@/components/NewsletterForm";
import HeroImageSlider from "@/components/home/HeroImageSlider";
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

type GalleryPhoto = {
  title: string;
  category: string;
  description: string;
  date: string;
  dateTime: string;
  location: string;
  image: string;
  alt: string;
  categoryIcon: LucideIcon;
};

const galleryPhotos: GalleryPhoto[] = [
  {
    title: "Community Together",
    category: "Teamwork",
    description:
      "Neighbors shared time, care, and fresh produce with families in need.",
    date: "October 18, 2026",
    dateTime: "2026-10-18",
    location: "Dhaka",
    image: "/image-1.jpg",
    alt: "Volunteers distributing fresh food to families at a community event.",
    categoryIcon: UsersRound,
  },
  {
    title: "Growing a Greener Future",
    category: "Tree Plantation",
    description:
      "Local volunteers planted young trees to help their neighborhood thrive.",
    date: "October 4, 2026",
    dateTime: "2026-10-04",
    location: "Sylhet",
    image: "/image-2.jpg",
    alt: "Community volunteers planting trees together.",
    categoryIcon: Sprout,
  },
  {
    title: "Helping Hands",
    category: "Volunteering",
    description:
      "A team effort turned a well-loved public space into a cleaner place to gather.",
    date: "September 20, 2026",
    dateTime: "2026-09-20",
    location: "Rajshahi",
    image: "/image-4.jpg",
    alt: "Volunteers working together to clean a neighborhood park.",
    categoryIcon: HandHeart,
  },
  {
    title: "Making a Difference",
    category: "Community Care",
    description:
      "Patient mentors made room for curiosity, confidence, and new possibilities.",
    date: "September 6, 2026",
    dateTime: "2026-09-06",
    location: "Chattogram",
    image: "/image-3.jpg",
    alt: "A volunteer helping children learn in a community classroom.",
    categoryIcon: HeartHandshake,
  },
  {
    title: "Learning Opens Doors",
    category: "Education",
    description:
      "Young learners and caring mentors spent an inspiring day discovering new ideas.",
    date: "August 23, 2026",
    dateTime: "2026-08-23",
    location: "Khulna",
    image: "/image-3.jpg",
    alt: "Children taking part in a community learning session.",
    categoryIcon: BookOpen,
  },
  {
    title: "Food Shared, Hope Grown",
    category: "Food Drive",
    description:
      "A neighborhood food drive brought fresh essentials and friendly support to local families.",
    date: "August 9, 2026",
    dateTime: "2026-08-09",
    location: "Dhaka",
    image: "/image-1.jpg",
    alt: "Community volunteers sharing fresh groceries with families.",
    categoryIcon: Heart,
  },
];

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
    <div className="hero-art relative mx-auto aspect-[1.38] w-full sm:aspect-[1.55] lg:aspect-auto lg:h-[30rem] lg:min-h-0">
      <div
        aria-hidden="true"
        className="absolute inset-[3%] rounded-[1.75rem] border border-emerald-300/65 dark:border-emerald-800/60 sm:rounded-[2rem]"
      />

      <div className="hero-photo absolute inset-0 overflow-hidden rounded-[1.5rem] border border-white/90 bg-emerald-100 shadow-[0_32px_90px_-38px_rgba(16,87,57,0.42)] dark:border-emerald-900/80 dark:bg-slate-900 sm:rounded-[2rem]">
        <HeroImageSlider />
      </div>

      <div className="hero-badge absolute right-3 top-3 flex max-w-[13rem] items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2 text-xs font-semibold leading-4 text-emerald-900 shadow-lg shadow-emerald-950/10 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-emerald-200 sm:right-5 sm:top-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300">
          <Sparkles className="h-4 w-4" />
        </span>
        Making an Impact Together
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <article className="group overflow-hidden rounded-[1.4rem] border border-emerald-950/[0.07] bg-white shadow-[0_12px_36px_-26px_rgba(15,76,51,0.38)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
      <div className="relative aspect-[16/9] overflow-hidden bg-emerald-50 dark:bg-slate-800">
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

      <div className="p-5 sm:p-6">
        <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
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
    <section className="bg-white px-5 py-16 dark:bg-slate-950 sm:px-8 sm:py-20 lg:px-10">
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
      <section className="hero-stage relative isolate grid w-full overflow-hidden border-b border-emerald-100/70 bg-gradient-to-br from-[#f7faf6] via-[#fbfcf8] to-[#edf6ef] dark:border-emerald-950 dark:from-[#071b14] dark:via-[#0b1c16] dark:to-[#10291f] lg:min-h-[35rem] lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -left-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-emerald-200/25 blur-3xl dark:bg-emerald-500/10" />
          <div className="absolute -bottom-48 left-[30%] h-80 w-80 rounded-full bg-teal-100/35 blur-3xl dark:bg-teal-900/15" />
          <div className="absolute -right-36 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-300/15 blur-3xl dark:bg-emerald-700/15" />
        </div>

        <div className="hero-copy relative z-10 mx-auto flex w-full max-w-[43rem] flex-col justify-center px-5 pb-7 pt-10 text-center sm:px-8 sm:pb-9 sm:pt-12 lg:mx-0 lg:px-12 lg:py-12 lg:text-left xl:px-16">
          <div className="mb-6 inline-flex self-center items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-emerald-800 shadow-sm shadow-emerald-950/[0.04] backdrop-blur dark:border-emerald-800/80 dark:bg-slate-900/75 dark:text-emerald-300 sm:text-sm lg:self-start">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            GOOD THINGS HAPPEN WHEN WE SHOW UP
          </div>

          <h1 className="text-balance text-[clamp(2.85rem,5.2vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-slate-950 dark:text-white">
            <span className="block">Together We</span>
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

          <p className="mx-auto mt-6 max-w-[30rem] text-pretty text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8 lg:mx-0">
            Find your people, join community events, and turn a little time
            together into a lasting positive impact.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:items-start lg:justify-start">
            <Link
              className="hero-cta group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition duration-300 hover:-translate-y-0.5 hover:from-emerald-600 hover:to-teal-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 sm:min-h-14 sm:px-7 sm:text-base"
              href="/upcoming-events"
            >
              <CalendarDays className="h-[1.125rem] w-[1.125rem]" />
              Explore Events
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              className="hero-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white/75 px-6 text-sm font-semibold text-emerald-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/75 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/50 sm:min-h-14 sm:px-7 sm:text-base"
              href="/create-event"
            >
              <UsersRound className="h-[1.125rem] w-[1.125rem]" />
              Create Event
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-left lg:justify-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-900/60 dark:text-emerald-300 dark:ring-emerald-800">
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

        <div className="relative w-full px-3 pb-7 sm:px-8 sm:pb-9 lg:px-8 lg:py-10 xl:px-10">
          <CommunityPhoto />
        </div>
      </section>

      <HeroStats />

      <Suspense fallback={<UpcomingEventsLoading />}>
        <UpcomingCommunityEvents />
      </Suspense>

      {/* Why GoodTogether Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 to-white px-5 py-16 dark:from-slate-900 dark:to-slate-950 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
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

          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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
                  className="group relative flex h-full flex-col rounded-[1.5rem] border border-emerald-950/[0.07] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(15,76,51,0.42)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/10 motion-reduce:transform-none dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-800 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition duration-300 group-hover:scale-105 group-hover:bg-emerald-700 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900">
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </div>

                    <span className="text-sm font-bold tracking-widest text-emerald-200 dark:text-emerald-900">
                      {feature.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                    {feature.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-5 h-1 w-9 rounded-full bg-emerald-500 transition-all duration-300 group-hover:w-16 motion-reduce:transition-none" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Gallery Section */}
      <section className="bg-white px-5 py-16 dark:bg-slate-950 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
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

          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPhotos.map((photo) => {
              const CategoryIcon = photo.categoryIcon;

              return (
                <article
                  key={photo.title}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-emerald-950/[0.07] bg-white shadow-[0_12px_36px_-26px_rgba(15,76,51,0.38)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/10 motion-reduce:transform-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50 dark:bg-slate-800 sm:aspect-[16/10]">
                    <Image
                      alt={photo.alt}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
                      fill
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                      src={photo.image}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/5"
                    />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-slate-950/45 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                      <CategoryIcon
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      />
                      {photo.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                      {photo.title}
                    </h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {photo.description}
                    </p>
                    <div className="mt-5 grid gap-2.5 border-t border-slate-100 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      <p className="flex items-center gap-2.5">
                        <CalendarDays
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        />
                        <time dateTime={photo.dateTime}>{photo.date}</time>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <MapPin
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        />
                        {photo.location}, Bangladesh
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white px-5 pb-16 pt-4 dark:bg-slate-950 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] border border-emerald-900/10 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 px-5 py-12 text-center shadow-[0_28px_80px_-40px_rgba(4,70,49,0.65)] sm:rounded-[2rem] sm:px-12 sm:py-16 lg:py-20">
          {/* Background Decorations */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/10 sm:h-72 sm:w-72" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-72 w-72 rounded-full border border-white/10 sm:h-80 sm:w-80" />
          <div className="pointer-events-none absolute right-[10%] top-8 h-32 w-32 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-100 backdrop-blur">
              <Heart className="h-4 w-4" />
              Stay Connected
            </span>

            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-white sm:mt-6 sm:text-5xl">
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
