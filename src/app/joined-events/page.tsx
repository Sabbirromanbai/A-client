"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  LoaderCircle,
  MapPin,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiClientError, apiClient } from "@/app/lib/api-client";
import {
  getEventVolunteers,
  type CommunityEvent,
} from "@/app/lib/events";
import EventThumbnail from "@/components/events/EventThumbnail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

type JoinedEvent = {
  event: CommunityEvent;
  volunteerCount: number | null;
};

type ParticipantsResponse = {
  success: true;
  events: Array<{ _id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isParticipantsResponse(value: unknown): value is ParticipantsResponse {
  return (
    isRecord(value) &&
    value.success === true &&
    Array.isArray(value.events) &&
    value.events.every(
      (event) => isRecord(event) && typeof event._id === "string",
    )
  );
}

function parseEvent(value: unknown): CommunityEvent | null {
  if (!isRecord(value) || !isRecord(value.event)) return null;

  const event = value.event;
  if (
    typeof event._id !== "string" ||
    typeof event.title !== "string" ||
    typeof event.description !== "string" ||
    typeof event.eventType !== "string" ||
    typeof event.location !== "string" ||
    typeof event.eventDate !== "string" ||
    !Number.isFinite(Date.parse(event.eventDate))
  ) {
    return null;
  }

  const organizer = isRecord(event.organizer) ? event.organizer : null;
  return {
    _id: event._id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    location: event.location,
    eventDate: event.eventDate,
    thumbnailUrl:
      typeof event.thumbnailUrl === "string" ? event.thumbnailUrl : undefined,
    creatorEmail:
      typeof event.creatorEmail === "string" ? event.creatorEmail : undefined,
    organizer:
      organizer &&
      (typeof organizer.name === "string" || organizer.name === null) &&
      (typeof organizer.image === "string" || organizer.image === null) &&
      typeof organizer.emailVerified === "boolean"
        ? {
            name: organizer.name,
            image: organizer.image,
            emailVerified: organizer.emailVerified,
          }
        : null,
  };
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventCardsSkeleton() {
  return (
    <div
      aria-label="Loading joined events"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <Card
          className="overflow-hidden rounded-3xl border-slate-200/80 bg-white py-0 dark:border-slate-800 dark:bg-slate-900"
          key={index}
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <CardContent className="space-y-4 p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Loading your upcoming joined events…</span>
    </div>
  );
}

export default function JoinedEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [eventToLeave, setEventToLeave] = useState<CommunityEvent | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const leaveRequestInProgress = useRef(false);

  const loadJoinedEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const participation = await apiClient.get<unknown>("api/participants");
      if (!isParticipantsResponse(participation)) {
        throw new Error("The participation service returned an invalid response.");
      }

      const ids = [...new Set(participation.events.map(({ _id }) => _id))];
      const events = await Promise.all(
        ids.map(async (id) => {
          const response = await apiClient.get<unknown>(
            `api/events/${encodeURIComponent(id)}`,
          );
          const event = parseEvent(response);
          if (!event) {
            throw new Error("The events service returned an invalid event.");
          }
          return event;
        }),
      );

      const upcomingEvents = events
        .filter((event) => Date.parse(event.eventDate) > Date.now())
        .sort(
          (first, second) =>
            Date.parse(first.eventDate) - Date.parse(second.eventDate),
        );

      const entries = await Promise.all(
        upcomingEvents.map(async (event): Promise<JoinedEvent> => {
          try {
            const volunteers = await getEventVolunteers(event._id);
            return { event, volunteerCount: volunteers.count };
          } catch (error) {
            console.error(
              `Could not load volunteer count for event ${event._id}.`,
              error,
            );
            return { event, volunteerCount: null };
          }
        }),
      );

      setJoinedEvents(entries);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(
          `/login?callbackURL=${encodeURIComponent("/joined-events")}`,
        );
        return;
      }

      console.error("Could not load joined events.", error);
      setLoadError("Your joined events couldn’t be loaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(
        `/login?callbackURL=${encodeURIComponent("/joined-events")}`,
      );
      return;
    }

    const timeout = window.setTimeout(() => void loadJoinedEvents(), 0);
    return () => window.clearTimeout(timeout);
  }, [isPending, loadJoinedEvents, router, session]);

  async function handleLeaveEvent() {
    if (!eventToLeave || leaveRequestInProgress.current) return;

    leaveRequestInProgress.current = true;
    setIsLeaving(true);
    try {
      const response = await apiClient.delete<unknown>("api/participants", {
        body: { eventId: eventToLeave._id },
      });

      if (
        !isRecord(response) ||
        response.success !== true ||
        typeof response.count !== "number" ||
        !Number.isInteger(response.count) ||
        response.count < 0
      ) {
        throw new Error("The participation service could not confirm leaving.");
      }

      setJoinedEvents((current) =>
        current.filter(({ event }) => event._id !== eventToLeave._id),
      );
      toast.success("You left this event successfully!", {
        id: "joined-events-feedback",
      });
      setEventToLeave(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(
          `/login?callbackURL=${encodeURIComponent("/joined-events")}`,
        );
        return;
      }

      console.error("Could not leave event.", error);
      toast.error(
        error instanceof ApiClientError && error.status === 404
          ? "This event is no longer available."
          : "You couldn’t leave this event. Please try again.",
        { id: "joined-events-feedback" },
      );
    } finally {
      leaveRequestInProgress.current = false;
      setIsLeaving(false);
    }
  }

  if (isPending || !session) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#fbfdf9] px-5 py-20 dark:bg-slate-950">
        <p
          aria-live="polite"
          className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
          role="status"
        >
          <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
          {isPending ? "Checking your account…" : "Redirecting to sign in…"}
        </p>
      </main>
    );
  }

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#fbfdf9] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-32 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/30" />
        <div className="absolute -right-40 top-48 h-96 w-96 rounded-full bg-lime-100/50 blur-3xl dark:bg-teal-950/20" />
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <header className="mb-9 max-w-2xl sm:mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            YOUR COMMUNITY COMMITMENTS
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            My Joined Events
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Your upcoming events and the impact you&apos;re preparing to make.
          </p>
        </header>

        {isLoading ? (
          <EventCardsSkeleton />
        ) : loadError ? (
          <Card className="rounded-3xl border-rose-200 bg-white/90 dark:border-rose-900 dark:bg-slate-900">
            <CardContent className="flex flex-col items-center px-6 py-12 text-center">
              <CircleAlert
                aria-hidden="true"
                className="h-10 w-10 text-rose-600 dark:text-rose-400"
              />
              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                Events unavailable
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {loadError}
              </p>
              <Button
                className="mt-6 rounded-xl bg-emerald-700 px-5 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                onClick={() => void loadJoinedEvents()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : joinedEvents.length === 0 ? (
          <Card className="overflow-hidden rounded-3xl border-emerald-100 bg-white/85 shadow-[0_24px_70px_-44px_rgba(15,76,51,0.4)] dark:border-slate-800 dark:bg-slate-900/85">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center sm:py-20">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900">
                <CalendarDays aria-hidden="true" className="h-8 w-8" />
              </span>
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your next good thing is out there
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                You don&apos;t have any upcoming joined events yet. Find a
                community project and make your next impact together.
              </p>
              <Button
                className="mt-7 rounded-xl bg-emerald-700 px-5 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                nativeButton={false}
                render={<Link href="/upcoming-events" />}
              >
                Explore upcoming events
                <ArrowRight aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {joinedEvents.map(({ event, volunteerCount }) => {
              const organizerName =
                event.organizer?.name?.trim() ||
                event.creatorEmail ||
                "Community organizer";

              return (
                <Card
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white py-0 shadow-[0_12px_36px_-26px_rgba(15,76,51,0.4)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_50px_-28px_rgba(15,76,51,0.34)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900"
                  key={event._id}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50 dark:bg-slate-800">
                    <EventThumbnail
                      alt={event.title}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      src={event.thumbnailUrl}
                    />
                    <span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm dark:border-slate-700 dark:bg-slate-950/90 dark:text-emerald-300">
                      {event.eventType}
                    </span>
                    <span className="absolute bottom-4 right-4 inline-flex flex-col items-center rounded-xl border border-white/15 bg-slate-950/80 px-3 py-2 text-white shadow-lg backdrop-blur-md">
                      <CalendarDays
                        aria-hidden="true"
                        className="mb-1 h-4 w-4 text-emerald-300"
                      />
                      <time
                        className="text-center text-xs font-semibold"
                        dateTime={event.eventDate}
                      >
                        {formatEventDate(event.eventDate)}
                      </time>
                    </span>
                  </div>

                  <CardHeader className="px-5 pt-5 sm:px-6">
                    <CardTitle className="line-clamp-1 text-xl font-bold text-slate-900 dark:text-white">
                      {event.title}
                    </CardTitle>
                    <p className="line-clamp-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">
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
                    <p className="flex items-center gap-2">
                      <UsersRound
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                      <span>
                        {volunteerCount === null
                          ? "Volunteer count unavailable"
                          : `${volunteerCount} ${
                              volunteerCount === 1 ? "volunteer" : "volunteers"
                            }`}
                      </span>
                    </p>
                  </CardContent>

                  <CardFooter className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
                    <Button
                      className="h-10 min-w-0 rounded-lg bg-emerald-700 px-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 sm:px-3 sm:text-sm"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/event-details/${encodeURIComponent(event._id)}`}
                        />
                      }
                    >
                      View Event
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Button>
                    <Button
                      className="h-10 min-w-0 rounded-lg border border-rose-200 bg-white px-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40 sm:px-3 sm:text-sm"
                      onClick={() => setEventToLeave(event)}
                      variant="outline"
                    >
                      Leave Event
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => {
          if (!open && !isLeaving) setEventToLeave(null);
        }}
        open={Boolean(eventToLeave)}
      >
        <DialogContent className="rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Leave this event?
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              You&apos;ll no longer be listed as a volunteer for{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {eventToLeave?.title}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              className="rounded-xl"
              disabled={isLeaving}
              onClick={() => setEventToLeave(null)}
              variant="outline"
            >
              Keep my place
            </Button>
            <Button
              className="rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              disabled={isLeaving}
              onClick={() => void handleLeaveEvent()}
            >
              {isLeaving ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                  Leaving…
                </>
              ) : (
                "Yes, leave event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
