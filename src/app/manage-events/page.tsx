"use client";

import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  ApiClientError,
  apiClient,
} from "@/app/lib/api-client";
import type { CommunityEvent } from "@/app/lib/events";
import EventThumbnail from "@/components/events/EventThumbnail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

type EventsResponse = {
  success: true;
  events: CommunityEvent[];
};

type EventPayload = Pick<
  CommunityEvent,
  "title" | "description" | "eventType" | "thumbnailUrl" | "location" | "eventDate"
>;

type EventField = keyof EventPayload;
type EventFieldErrors = Partial<Record<EventField, string>>;

const requiredFields: EventField[] = [
  "title",
  "eventType",
  "eventDate",
  "location",
  "thumbnailUrl",
  "description",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCommunityEvent(value: unknown): value is CommunityEvent {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.eventType === "string" &&
    (typeof value.thumbnailUrl === "string" ||
      value.thumbnailUrl === undefined) &&
    typeof value.location === "string" &&
    (typeof value.eventDate === "string" ||
      value.eventDate instanceof Date) &&
    Number.isFinite(Date.parse(String(value.eventDate)))
  );
}

function toLocalDateTime(value: string) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function formatEventDate(value: string) {
  return new Date(value).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function validateImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function EventListSkeleton() {
  return (
    <div aria-label="Loading your events" className="space-y-3" role="status">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          key={index}
        >
          <Skeleton className="h-16 w-20 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="hidden h-9 w-24 sm:block" />
        </div>
      ))}
      <span className="sr-only">Loading your events…</span>
    </div>
  );
}

export default function ManageEventsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingEvent, setEditingEvent] = useState<CommunityEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<CommunityEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<EventFieldErrors>({});
  const requestInProgress = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCurrentTime(Date.now());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const response = await apiClient.get<EventsResponse>(
        "api/events/my-events",
      );
      if (
        !response ||
        response.success !== true ||
        !Array.isArray(response.events) ||
        response.events.some((event) => !isCommunityEvent(event))
      ) {
        throw new Error("The events service returned an invalid response.");
      }

      setEvents(
        response.events.map((event) => ({
          ...event,
          eventDate: new Date(event.eventDate).toISOString(),
        })),
      );
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(
          `/login?callbackURL=${encodeURIComponent("/manage-events")}`,
        );
        return;
      }

      console.error("Could not load your events.", error);
      setLoadError("Your events couldn’t be loaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(
        `/login?callbackURL=${encodeURIComponent("/manage-events")}`,
      );
      return;
    }

    const timeout = window.setTimeout(() => void loadEvents(), 0);
    return () => window.clearTimeout(timeout);
  }, [isPending, loadEvents, router, session]);

  function openEditor(event: CommunityEvent) {
    setFieldErrors({});
    setEditingEvent(event);
  }

  function clearFieldError(field: EventField) {
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEvent || requestInProgress.current) return;

    const formData = new FormData(event.currentTarget);
    const rawDate = String(formData.get("eventDate") ?? "");
    const parsedDate = new Date(rawDate);
    const payload: EventPayload = {
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      eventType: String(formData.get("eventType") ?? "").trim(),
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      eventDate: Number.isFinite(parsedDate.getTime())
        ? parsedDate.toISOString()
        : "",
    };
    const errors: EventFieldErrors = {};

    for (const field of requiredFields) {
      if (!payload[field]) errors[field] = "This field is required.";
    }
    if (
      !Number.isFinite(parsedDate.getTime()) ||
      parsedDate.getTime() <= Date.now()
    ) {
      errors.eventDate = "Choose a future date and time.";
    }
    if (payload.thumbnailUrl && !validateImageUrl(payload.thumbnailUrl)) {
      errors.thumbnailUrl = "Enter a valid HTTP or HTTPS image URL.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0], { id: "manage-event-feedback" });
      return;
    }

    requestInProgress.current = true;
    setIsSaving(true);
    try {
      const response = await apiClient.put<{
        success: true;
        event: CommunityEvent;
      }, EventPayload>(
        `api/events/${encodeURIComponent(editingEvent._id)}`,
        payload,
      );

      if (response.success !== true || !isCommunityEvent(response.event)) {
        throw new Error("The events service returned an invalid response.");
      }

      toast.success("Event updated successfully.", {
        id: "manage-event-feedback",
      });
      setEditingEvent(null);
      await loadEvents();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(
          `/login?callbackURL=${encodeURIComponent("/manage-events")}`,
        );
        return;
      }

      console.error("Could not update event.", error);
      toast.error(
        error instanceof ApiClientError && error.status === 400
          ? error.message
          : "The event couldn’t be updated. Please try again.",
        { id: "manage-event-feedback" },
      );
    } finally {
      requestInProgress.current = false;
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingEvent || requestInProgress.current) return;

    requestInProgress.current = true;
    setIsDeleting(true);
    try {
      const response = await apiClient.delete<{ success: true }>(
        `api/events/${encodeURIComponent(deletingEvent._id)}`,
      );
      if (!response || response.success !== true) {
        throw new Error("The events service could not confirm deletion.");
      }

      toast.success("Event deleted successfully.", {
        id: "manage-event-feedback",
      });
      setDeletingEvent(null);
      await loadEvents();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(
          `/login?callbackURL=${encodeURIComponent("/manage-events")}`,
        );
        return;
      }

      console.error("Could not delete event.", error);
      toast.error(
        error instanceof ApiClientError && error.status === 404
          ? "This event is no longer available."
          : "The event couldn’t be deleted. Please try again.",
        { id: "manage-event-feedback" },
      );
    } finally {
      requestInProgress.current = false;
      setIsDeleting(false);
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
        <header className="mb-9 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              <CalendarDays aria-hidden="true" className="h-4 w-4" />
              YOUR COMMUNITY WORK
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Manage My Events
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
              Keep your community initiatives up to date and ready for
              volunteers.
            </p>
          </div>
          <Button
            className="h-11 rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            nativeButton={false}
            render={<Link href="/create-event" />}
          >
            <Plus aria-hidden="true" />
            Create Event
          </Button>
        </header>

        {isLoading ? (
          <EventListSkeleton />
        ) : loadError ? (
          <Card className="rounded-2xl border-rose-200 bg-white/90 dark:border-rose-900 dark:bg-slate-900">
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
                className="mt-5 rounded-lg"
                onClick={() => void loadEvents()}
                variant="outline"
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-emerald-200 bg-white/75 dark:border-emerald-900 dark:bg-slate-900/70">
            <CardContent className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CalendarDays aria-hidden="true" className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                No events to manage yet
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Create a community event and it will appear here for you to
                manage.
              </p>
              <Button
                className="mt-6 rounded-xl bg-emerald-700 px-5 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                nativeButton={false}
                render={<Link href="/create-event" />}
              >
                Create your first event
                <ChevronRight aria-hidden="true" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-3xl border-slate-200/80 bg-white/90 py-0 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <CardHeader className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
              <CardTitle className="text-lg font-bold text-slate-950 dark:text-white">
                Your events
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                {events.length} {events.length === 1 ? "event" : "events"} to
                manage
              </CardDescription>
            </CardHeader>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Event</th>
                    <th className="px-4 py-4 font-semibold">Date</th>
                    <th className="px-4 py-4 font-semibold">Location</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {events.map((event) => {
                    const isUpcoming =
                      Date.parse(event.eventDate) > currentTime;
                    return (
                      <tr
                        className="transition-colors hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"
                        key={event._id}
                      >
                        <td className="px-6 py-4">
                          <div className="flex min-w-64 items-center gap-3">
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-emerald-50 dark:bg-slate-800">
                              <EventThumbnail
                                alt={event.title}
                                sizes="80px"
                                src={event.thumbnailUrl}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">
                                {event.title}
                              </p>
                              <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {event.eventType}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays
                              aria-hidden="true"
                              className="h-4 w-4 text-emerald-700 dark:text-emerald-400"
                            />
                            {formatEventDate(event.eventDate)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                          <span className="inline-flex max-w-48 items-center gap-2">
                            <MapPin
                              aria-hidden="true"
                              className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400"
                            />
                            <span className="truncate">{event.location}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isUpcoming
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {isUpcoming ? (
                              <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                            ) : (
                              <Check aria-hidden="true" className="h-3.5 w-3.5" />
                            )}
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              aria-label={`Edit ${event.title}`}
                              className="rounded-lg border-emerald-200 bg-emerald-50/70 text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                              onClick={() => openEditor(event)}
                              size="sm"
                              variant="outline"
                            >
                              <Pencil aria-hidden="true" />
                              Edit
                            </Button>
                            <Button
                              aria-label={`Delete ${event.title}`}
                              className="rounded-lg border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
                              onClick={() => setDeletingEvent(event)}
                              size="sm"
                              variant="outline"
                            >
                              <Trash2 aria-hidden="true" />
                              Delete
                            </Button>
                            <Button
                              aria-label={`View ${event.title}`}
                              className="rounded-lg border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                              nativeButton={false}
                              render={
                                <Link
                                  href={`/event-details/${encodeURIComponent(event._id)}`}
                                />
                              }
                              size="sm"
                              variant="outline"
                            >
                              <Eye aria-hidden="true" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              {events.map((event) => {
                const isUpcoming = Date.parse(event.eventDate) > currentTime;
                return (
                  <article className="p-4 sm:p-5" key={event._id}>
                    <div className="flex gap-4">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-emerald-50 dark:bg-slate-800">
                        <EventThumbnail
                          alt={event.title}
                          sizes="96px"
                          src={event.thumbnailUrl}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          {event.eventType}
                        </span>
                        <h2 className="mt-2 line-clamp-2 font-bold text-slate-900 dark:text-white">
                          {event.title}
                        </h2>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <p className="flex items-center gap-2">
                        <CalendarDays
                          aria-hidden="true"
                          className="h-4 w-4 text-emerald-700 dark:text-emerald-400"
                        />
                        {formatEventDate(event.eventDate)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin
                          aria-hidden="true"
                          className="h-4 w-4 text-emerald-700 dark:text-emerald-400"
                        />
                        <span className="truncate">{event.location}</span>
                      </p>
                      <p>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isUpcoming
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {isUpcoming ? "Upcoming" : "Completed"}
                        </span>
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <Button
                        className="min-w-0 rounded-lg border-emerald-200 bg-emerald-50/70 px-2 text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                        onClick={() => openEditor(event)}
                        variant="outline"
                      >
                        <Pencil aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        className="min-w-0 rounded-lg border-rose-200 bg-rose-50 px-2 text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/60"
                        onClick={() => setDeletingEvent(event)}
                        variant="outline"
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                      <Button
                        className="min-w-0 rounded-lg border-slate-200 bg-slate-50 px-2 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/event-details/${encodeURIComponent(event._id)}`}
                          />
                        }
                        variant="outline"
                      >
                        <Eye aria-hidden="true" />
                        View
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </Card>
        )}
      </section>

      <Dialog
        onOpenChange={(open) => {
          if (!open && !isSaving) setEditingEvent(null);
        }}
        open={Boolean(editingEvent)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200 bg-white p-0 dark:border-slate-800 dark:bg-slate-900 sm:max-w-2xl">
          {editingEvent && (
            <form key={editingEvent._id} onSubmit={handleUpdate}>
              <DialogHeader className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <DialogTitle className="text-xl font-bold text-slate-950 dark:text-white">
                  Edit event
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
                  Update the details volunteers see for this initiative.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Event title</Label>
                  <Input
                    aria-invalid={Boolean(fieldErrors.title)}
                    defaultValue={editingEvent.title}
                    id="edit-title"
                    maxLength={120}
                    name="title"
                    onChange={() => clearFieldError("title")}
                    required
                  />
                  {fieldErrors.title && (
                    <p className="text-xs text-rose-600">{fieldErrors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Category</Label>
                  <Input
                    aria-invalid={Boolean(fieldErrors.eventType)}
                    defaultValue={editingEvent.eventType}
                    id="edit-type"
                    name="eventType"
                    onChange={() => clearFieldError("eventType")}
                    required
                  />
                  {fieldErrors.eventType && (
                    <p className="text-xs text-rose-600">
                      {fieldErrors.eventType}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Date and time</Label>
                  <Input
                    aria-invalid={Boolean(fieldErrors.eventDate)}
                    defaultValue={toLocalDateTime(editingEvent.eventDate)}
                    id="edit-date"
                    min={
                      currentTime
                        ? toLocalDateTime(
                            new Date(currentTime + 60_000).toISOString(),
                          )
                        : undefined
                    }
                    name="eventDate"
                    onChange={() => clearFieldError("eventDate")}
                    required
                    type="datetime-local"
                  />
                  {fieldErrors.eventDate && (
                    <p className="text-xs text-rose-600">
                      {fieldErrors.eventDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    aria-invalid={Boolean(fieldErrors.location)}
                    defaultValue={editingEvent.location}
                    id="edit-location"
                    maxLength={180}
                    name="location"
                    onChange={() => clearFieldError("location")}
                    required
                  />
                  {fieldErrors.location && (
                    <p className="text-xs text-rose-600">
                      {fieldErrors.location}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-thumbnail">Thumbnail image URL</Label>
                  <Input
                    aria-invalid={Boolean(fieldErrors.thumbnailUrl)}
                    defaultValue={editingEvent.thumbnailUrl ?? ""}
                    id="edit-thumbnail"
                    name="thumbnailUrl"
                    onChange={() => clearFieldError("thumbnailUrl")}
                    required
                    type="url"
                  />
                  {fieldErrors.thumbnailUrl && (
                    <p className="text-xs text-rose-600">
                      {fieldErrors.thumbnailUrl}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    aria-invalid={Boolean(fieldErrors.description)}
                    className="min-h-28"
                    defaultValue={editingEvent.description}
                    id="edit-description"
                    maxLength={5000}
                    name="description"
                    onChange={() => clearFieldError("description")}
                    required
                  />
                  {fieldErrors.description && (
                    <p className="text-xs text-rose-600">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
                <Button
                  disabled={isSaving}
                  onClick={() => setEditingEvent(null)}
                  type="button"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving && (
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                    />
                  )}
                  {isSaving ? "Saving…" : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeletingEvent(null);
        }}
        open={Boolean(deletingEvent)}
      >
        <DialogContent className="rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-950 dark:text-white">
              Delete this event?
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              “{deletingEvent?.title}” will be permanently removed. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              disabled={isDeleting}
              onClick={() => setDeletingEvent(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
              type="button"
            >
              {isDeleting && (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              )}
              {isDeleting ? "Deleting…" : "Delete event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
