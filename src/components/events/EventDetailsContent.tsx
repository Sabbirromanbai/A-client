"use client";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LogOut,
  MapPin,
  Tag,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiClientError, apiClient } from "@/app/lib/api-client";
import {
  getEventVolunteers,
  type CommunityEvent,
  type EventVolunteer,
  type EventVolunteerList,
} from "@/app/lib/events";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EventThumbnail from "@/components/events/EventThumbnail";

type EventDetailsContentProps = {
  event: CommunityEvent;
};

type ParticipationResponse = {
  success: true;
  events: Array<{ _id: string }>;
};

type ParticipationActionResponse = {
  success: true;
  message?: string;
  count: number;
  volunteers: EventVolunteer[];
};

type VolunteerState =
  | { status: "loading" }
  | { status: "ready"; data: EventVolunteerList }
  | { status: "error" };

const volunteerGuidelines = [
  "Arrive 15 minutes early.",
  "Wear comfortable clothing suitable for the work.",
  "Bring requested relief/distribution items.",
];

function formatEventDate(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEventTime(date: string) {
  return new Date(date).toLocaleTimeString("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function isParticipationActionResponse(
  value: unknown,
): value is ParticipationActionResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("success" in value) ||
    value.success !== true ||
    !("count" in value) ||
    typeof value.count !== "number" ||
    !Number.isInteger(value.count) ||
    value.count < 0 ||
    !("volunteers" in value) ||
    !Array.isArray(value.volunteers)
  ) {
    return false;
  }

  return value.volunteers.every(
    (volunteer) =>
      typeof volunteer === "object" &&
      volunteer !== null &&
      "name" in volunteer &&
      typeof volunteer.name === "string" &&
      (!("image" in volunteer) || typeof volunteer.image === "string"),
  );
}

export default function EventDetailsContent({
  event,
}: EventDetailsContentProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [participationStatus, setParticipationStatus] = useState<
    "ready" | "joining" | "joined" | "leaving"
  >("ready");
  const participationRequestInProgress = useRef(false);
  const loginRedirectInProgress = useRef(false);
  const [checkedKey, setCheckedKey] = useState<string | null>(null);
  const [volunteerState, setVolunteerState] = useState<VolunteerState>({
    status: "loading",
  });
  const userId = session?.user.id;
  const participationKey = userId ? `${userId}:${event._id}` : null;
  const isCheckingParticipation =
    isPending || Boolean(userId && checkedKey !== participationKey);
  const hasJoined = Boolean(
    userId &&
      checkedKey === participationKey &&
      participationStatus === "joined",
  );
  const volunteerCount =
    volunteerState.status === "ready" ? volunteerState.data.count : null;

  useEffect(() => {
    let active = true;
    getEventVolunteers(event._id)
      .then((data) => {
        if (active) setVolunteerState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Could not load event volunteers.", error);
        setVolunteerState({ status: "error" });
      });

    return () => {
      active = false;
    };
  }, [event._id]);

  useEffect(() => {
    if (isPending || !userId) return;

    let active = true;
    apiClient
      .get<ParticipationResponse>("api/participants")
      .then((response) => {
        if (
          response.success !== true ||
          !Array.isArray(response.events) ||
          response.events.some((joinedEvent) => typeof joinedEvent?._id !== "string")
        ) {
          throw new Error("The participation service returned an invalid response.");
        }

        if (!active) return;
        setParticipationStatus(
          response.events.some((joinedEvent) => joinedEvent._id === event._id)
            ? "joined"
            : "ready",
        );
        setCheckedKey(`${userId}:${event._id}`);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Could not check event participation.", error);
        setParticipationStatus("ready");
        setCheckedKey(`${userId}:${event._id}`);
        toast.error(
          "We couldn’t check your participation. You can still try to join.",
          { id: "participation-check-error" },
        );
      });

    return () => {
      active = false;
    };
  }, [event._id, isPending, userId]);

  function redirectToLogin() {
    if (loginRedirectInProgress.current) return;

    loginRedirectInProgress.current = true;
    toast.error("Please log in to join this event.", {
      id: "join-event-login-required",
    });
    const returnPath = `/event-details/${encodeURIComponent(event._id)}`;
    window.setTimeout(
      () =>
        router.push(
          `/login?callbackURL=${encodeURIComponent(returnPath)}`,
        ),
      400,
    );
  }

  function refreshVolunteers() {
    setVolunteerState({ status: "loading" });
    void getEventVolunteers(event._id)
      .then((data) => setVolunteerState({ status: "ready", data }))
      .catch((error: unknown) => {
        console.error("Could not refresh event volunteers.", error);
        setVolunteerState({ status: "error" });
      });
  }

  async function handleParticipationToggle() {
    if (!userId) {
      redirectToLogin();
      return;
    }
    if (
      isCheckingParticipation ||
      participationStatus === "joining" ||
      participationStatus === "leaving" ||
      participationRequestInProgress.current
    ) {
      return;
    }

    const isLeaving = hasJoined;
    participationRequestInProgress.current = true;
    setParticipationStatus(isLeaving ? "leaving" : "joining");

    try {
      const response = isLeaving
        ? await apiClient.delete<ParticipationActionResponse>(
            "api/participants",
            { body: { eventId: event._id } },
          )
        : await apiClient.post<
            ParticipationActionResponse,
            { eventId: string }
          >("api/participants", { eventId: event._id });

      if (!response.success) {
        throw new Error("The participation service could not confirm your change.");
      }

      setParticipationStatus(isLeaving ? "ready" : "joined");
      setCheckedKey(`${userId}:${event._id}`);
      toast.success(
        isLeaving
          ? "You left this event successfully!"
          : "You joined this event successfully!",
        { id: "event-participation-feedback" },
      );

      if (isParticipationActionResponse(response)) {
        setVolunteerState({
          status: "ready",
          data: { count: response.count, volunteers: response.volunteers },
        });
      } else {
        console.error("The participation service returned an invalid roster.");
        refreshVolunteers();
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setParticipationStatus(isLeaving ? "joined" : "ready");
        redirectToLogin();
        return;
      }

      if (!isLeaving && error instanceof ApiClientError && error.status === 409) {
        setParticipationStatus("joined");
        setCheckedKey(`${userId}:${event._id}`);
        toast.info("You’re already joined to this event.", {
          id: "event-participation-feedback",
        });
        refreshVolunteers();
        return;
      }

      console.error(
        isLeaving ? "Could not leave event." : "Could not join event.",
        error,
      );
      setParticipationStatus(isLeaving ? "joined" : "ready");
      toast.error(
        error instanceof Error
          ? error.message
          : isLeaving
            ? "We couldn’t leave this event. Please try again."
            : "We couldn’t join this event. Please try again.",
        { id: "event-participation-feedback" },
      );
    } finally {
      participationRequestInProgress.current = false;
    }
  }

  const isActionInProgress =
    participationStatus === "joining" || participationStatus === "leaving";
  const isParticipationDisabled =
    isCheckingParticipation ||
    isActionInProgress;
  const participationLabel = participationStatus === "leaving"
    ? "Leaving event…"
    : participationStatus === "joining"
      ? "Joining event…"
      : hasJoined
        ? "Tap to Leave"
    : isCheckingParticipation
      ? "Checking participation…"
      : "Join Event";
  const organizerName = event.organizer?.name?.trim() || "Community organizer";

  return (
    <main className="flex-1 bg-[#fbfdf9] dark:bg-slate-950">
      <article className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <Link
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          href="/upcoming-events"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Upcoming Events
        </Link>

        <Card className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white py-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative h-[24rem] overflow-hidden bg-emerald-950 sm:h-[30rem]">
            <EventThumbnail
              alt={event.title}
              sizes="(max-width: 768px) 100vw, 80rem"
              src={event.thumbnailUrl}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/5"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-md">
                <Tag aria-hidden="true" className="h-4 w-4" />
                {event.eventType}
              </span>
              <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm font-medium text-white/90 sm:text-base">
                <MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />
                {event.location}
              </p>
            </div>
          </div>

          <CardContent className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-start gap-3">
                <CalendarDays
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Date
                  </p>
                  <time className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-100" dateTime={event.eventDate}>
                    {formatEventDate(event.eventDate)}
                  </time>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Time
                  </p>
                  <time className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-100" dateTime={event.eventDate}>
                    {formatEventTime(event.eventDate)}
                  </time>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UsersRound
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Confirmed volunteers
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {volunteerCount === null
                      ? volunteerState.status === "error"
                        ? "Count unavailable"
                        : "Loading count…"
                      : `${volunteerCount} ${volunteerCount === 1 ? "volunteer" : "volunteers"}`}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {event.location}
                  </p>
                </div>
              </div>
            </div>

            <Button
              className={`h-12 w-full rounded-xl px-7 text-base font-bold shadow-md transition hover:-translate-y-0.5 disabled:translate-y-0 lg:w-auto ${
                hasJoined || participationStatus === "leaving"
                  ? "border border-rose-200 bg-white text-rose-700 shadow-rose-900/5 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
                  : "bg-emerald-700 text-white shadow-emerald-900/15 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              }`}
              disabled={isParticipationDisabled}
              onClick={handleParticipationToggle}
              type="button"
            >
              {(isCheckingParticipation || isActionInProgress) && (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              )}
              {!isCheckingParticipation &&
                !isActionInProgress &&
                (hasJoined ? (
                  <LogOut aria-hidden="true" />
                ) : (
                  <CheckCircle2 aria-hidden="true" />
                ))}
              {participationLabel}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-950 dark:text-white">
                About this Social Initiative
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-base leading-7 text-slate-600 dark:text-slate-300">
                {event.description}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-950 dark:text-white">
                Volunteer Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {volunteerGuidelines.map((guideline) => (
                  <li
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                    key={guideline}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                    {guideline}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.4fr]">
          <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-950 dark:text-white">
                Initiative Organizer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="size-16 ring-2 ring-emerald-100 dark:ring-emerald-900">
                  {event.organizer?.image && (
                    <AvatarImage
                      alt={organizerName}
                      src={event.organizer.image}
                    />
                  )}
                  <AvatarFallback className="bg-emerald-100 text-lg font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    {getInitials(organizerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 dark:text-white">
                    {organizerName}
                  </p>
                </div>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                <UsersRound aria-hidden="true" className="h-4 w-4" />
                Community organizer
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold text-slate-950 dark:text-white">
                Confirmed Volunteers
              </CardTitle>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {volunteerCount ?? "—"}
              </span>
            </CardHeader>
            <CardContent>
              {volunteerState.status === "loading" && (
                <div
                  aria-label="Loading confirmed volunteers"
                  className="flex items-center gap-3 py-4 text-sm text-slate-500 dark:text-slate-400"
                  role="status"
                >
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin text-emerald-600"
                  />
                  Loading confirmed volunteers…
                </div>
              )}

              {volunteerState.status === "error" && (
                <div
                  className="flex flex-col items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200 sm:flex-row sm:items-center sm:justify-between"
                  role="alert"
                >
                  <p>Volunteer information couldn’t be loaded.</p>
                  <Button
                    className="rounded-lg"
                    onClick={refreshVolunteers}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Try again
                  </Button>
                </div>
              )}

              {volunteerState.status === "ready" &&
                (volunteerState.data.volunteers.length > 0 ? (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {volunteerState.data.volunteers.map((volunteer, index) => (
                      <li
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40"
                        key={`${volunteer.name}-${index}`}
                      >
                        <Avatar className="size-10">
                          {volunteer.image && (
                            <AvatarImage
                              alt={volunteer.name}
                              src={volunteer.image}
                            />
                          )}
                          <AvatarFallback className="bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                            {getInitials(volunteer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {volunteer.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
                    No confirmed volunteers yet. Be the first to join.
                  </p>
                ))}
            </CardContent>
          </Card>
        </div>
      </article>

    </main>
  );
}
