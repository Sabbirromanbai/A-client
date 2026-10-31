"use client";

import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type MouseEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { CommunityEvent } from "@/app/lib/events";
import EventThumbnail from "@/components/events/EventThumbnail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const categories = [
  "All",
  "Donation",
  "Cleanup",
  "Plantation",
  "Winter Relief",
  "Food Drive",
  "Health Camp",
  "Education",
] as const;

type Category = (typeof categories)[number];

type UpcomingEventsBrowserProps = {
  events: CommunityEvent[];
};

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeCategory(category: string) {
  return category.toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesCategory(event: CommunityEvent, category: Category) {
  if (category === "All") return true;

  const type = normalizeCategory(`${event.eventType} ${event.title}`);
  const selected = normalizeCategory(category);
  if (type.includes(selected)) return true;

  if (category === "Plantation") {
    return type.includes("treeplanting");
  }
  if (category === "Cleanup") {
    return type.includes("cleanupdrive") || type.includes("cleaning");
  }
  if (category === "Donation") {
    return type.includes("donations") || type.includes("blooddonation");
  }

  return false;
}

function EventCard({ event }: { event: CommunityEvent }) {
  const organizerName =
    event.organizer?.name?.trim() ||
    event.creatorEmail ||
    "Community organizer";

  return (
    <Card className="h-full rounded-2xl border border-slate-200/80 bg-white py-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50 dark:bg-slate-800">
        <EventThumbnail
          alt={event.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          src={event.thumbnailUrl}
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:border-slate-700 dark:bg-slate-950/90 dark:text-emerald-300">
          {event.eventType}
        </span>
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
          <time dateTime={event.eventDate}>{formatEventDate(event.eventDate)}</time>
        </span>
      </div>

      <CardHeader className="px-5 pt-5 sm:px-6">
        <CardTitle className="line-clamp-1 text-xl font-bold text-slate-900 dark:text-white">
          {event.title}
        </CardTitle>
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-400">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="mt-auto space-y-3 px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 sm:px-6">
        <p className="flex items-center gap-2">
          <MapPin
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span className="line-clamp-1">{event.location}</span>
        </p>
        <p className="flex items-center gap-2">
          <UserRound
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span className="line-clamp-1">{organizerName}</span>
        </p>
      </CardContent>

      <CardFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
        <Link
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          href={`/event-details/${encodeURIComponent(event._id)}`}
        >
          View Event
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function UpcomingEventsBrowser({
  events,
}: UpcomingEventsBrowserProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const loginRedirectInProgress = useRef(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const matchesSearch =
          !normalizedQuery ||
          [
            event.title,
            event.location,
            event.eventType,
            event.description,
          ].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));

        return (
          matchesSearch && matchesCategory(event, activeCategory)
        );
      }),
    [activeCategory, events, normalizedQuery],
  );

  function handleCreateEventClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isPending) {
      event.preventDefault();
      return;
    }

    if (!session) {
      event.preventDefault();
      if (loginRedirectInProgress.current) return;

      loginRedirectInProgress.current = true;
      toast.error("Please log in to create an event.", {
        id: "create-event-login-required",
      });
      window.setTimeout(
        () =>
          router.push(
            `/login?callbackURL=${encodeURIComponent("/create-event")}`,
          ),
        400,
      );
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <header className="mb-9 flex flex-col justify-between gap-6 sm:mb-10 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            FUTURE COMMUNITY DRIVES
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Upcoming Events
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Find a meaningful way to show up. Explore what’s happening in your
            community and make a difference together.
          </p>
        </div>

        <Link
          aria-disabled={isPending}
          className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 ${
            isPending ? "cursor-wait opacity-70" : ""
          }`}
          href="/create-event"
          onClick={handleCreateEventClick}
        >
          {isPending ? "Checking account…" : "Create Event"}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </header>

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-5">
        <div className="relative max-w-xl">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            aria-label="Search events"
            className="h-11 rounded-lg border-slate-200 bg-slate-50 pl-10 pr-10 text-sm dark:border-slate-700 dark:bg-slate-950"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by event, location, category..."
            type="text"
            value={query}
          />
          {query && (
            <Button
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              onClick={() => setQuery("")}
              size="icon"
              variant="ghost"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div
          aria-label="Filter events by category"
          className="mt-4 flex flex-wrap gap-2"
          role="group"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <Button
                aria-pressed={isActive}
                className={
                  isActive
                    ? "h-9 rounded-full border border-emerald-700 bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    : "h-9 rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
                }
                key={category}
                onClick={() => setActiveCategory(category)}
                type="button"
                variant="outline"
              >
                {category}
              </Button>
            );
          })}
        </div>
      </div>

      <div
        aria-live="polite"
        className="mb-5 text-sm font-medium text-slate-600 dark:text-slate-400"
      >
        {filteredEvents.length}{" "}
        {filteredEvents.length === 1 ? "event" : "events"} to explore
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {filteredEvents.map((event) => (
            <EventCard event={event} key={event._id} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-6 py-14 text-center dark:border-emerald-900 dark:bg-slate-900/70">
          <CalendarDays
            aria-hidden="true"
            className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400"
          />
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {events.length === 0
              ? "No upcoming events just yet"
              : "No events match your filters"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            {events.length === 0
              ? "Check back soon to find a new way to connect and make a difference."
              : "Try another search or category to discover more community events."}
          </p>
          {events.length > 0 && (query || activeCategory !== "All") && (
            <Button
              className="mt-5 rounded-lg"
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
              }}
              variant="outline"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
