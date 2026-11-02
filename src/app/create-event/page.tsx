"use client";

import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Image as ImageIcon,
  LoaderCircle,
  Mail,
  MapPin,
  Snowflake,
  Sprout,
  Trees,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApiClientError, apiClient } from "@/app/lib/api-client";
import EventThumbnail from "@/components/events/EventThumbnail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

const eventTypes: { name: string; icon: LucideIcon }[] = [
  { name: "Donation", icon: HandHeart },
  { name: "Cleanup", icon: Sprout },
  { name: "Plantation", icon: Trees },
  { name: "Winter Relief", icon: Snowflake },
  { name: "Food Drive", icon: Utensils },
  { name: "Health Camp", icon: HeartPulse },
  { name: "Education", icon: GraduationCap },
];

const imagePresets = [
  {
    label: "Winter Clothes",
    url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Blanket Relief",
    url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Cleanup",
    url: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    label: "Tree Plantation",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",
  },
];

type FieldName =
  | "title"
  | "eventType"
  | "eventDate"
  | "location"
  | "thumbnailUrl"
  | "description";

type FieldErrors = Partial<Record<FieldName, string>>;
type CreatedEventResponse = {
  success: true;
  event: { _id: string };
};

type CreateEventPayload = {
  title: string;
  description: string;
  eventType: string;
  thumbnailUrl: string;
  location: string;
  eventDate: string;
};

function getLocalDateTimeMinimum() {
  const date = new Date(Date.now() + 60_000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function validateImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-rose-600 dark:text-rose-400" id={id}>
      {message}
    </p>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [eventType, setEventType] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [minimumDateTime, setMinimumDateTime] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMinimumDateTime(getLocalDateTimeMinimum());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (isPending || session) return;
    router.replace(
      `/login?callbackURL=${encodeURIComponent("/create-event")}`,
    );
  }, [isPending, router, session]);

  function clearFieldError(field: FieldName) {
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const formData = new FormData(event.currentTarget);
    const rawEventDate = String(formData.get("eventDate") ?? "");
    const parsedEventDate = new Date(rawEventDate);
    const nextErrors: FieldErrors = {};
    const title = String(formData.get("title") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title) nextErrors.title = "Enter an event title.";
    if (!eventType) nextErrors.eventType = "Choose an event type.";
    if (
      !rawEventDate ||
      !Number.isFinite(parsedEventDate.getTime()) ||
      parsedEventDate.getTime() <= Date.now()
    ) {
      nextErrors.eventDate = "Choose a future time today or a future date.";
    }
    if (!location) nextErrors.location = "Enter the event location or venue.";
    if (!thumbnailUrl.trim()) {
      nextErrors.thumbnailUrl = "Add an event thumbnail image URL.";
    } else if (!validateImageUrl(thumbnailUrl.trim())) {
      nextErrors.thumbnailUrl =
        "Enter a valid image URL starting with http:// or https://.";
    }
    if (!description) nextErrors.description = "Add an event description.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors)[0];
      toast.error(firstError || "Check the highlighted fields and try again.", {
        id: "create-event-feedback",
      });
      return;
    }

    const payload: CreateEventPayload = {
      title,
      description,
      eventType,
      thumbnailUrl: thumbnailUrl.trim(),
      location,
      eventDate: parsedEventDate.toISOString(),
    };

    submissionInProgress.current = true;
    setIsSubmitting(true);
    try {
      const response = await apiClient.post<
        CreatedEventResponse,
        CreateEventPayload
      >("api/events", payload);

      if (
        response.success !== true ||
        typeof response.event?._id !== "string" ||
        !/^[\da-fA-F]{24}$/.test(response.event._id)
      ) {
        throw new Error("The events service returned an invalid response.");
      }

      toast.success("Event published successfully! 🎉", {
        id: "create-event-feedback",
      });
      router.push(`/event-details/${encodeURIComponent(response.event._id)}`);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        toast.error("Please log in to create an event.", {
          id: "create-event-login-required",
        });
        router.replace(
          `/login?callbackURL=${encodeURIComponent("/create-event")}`,
        );
        return;
      }

      console.error("Could not create event.", error);
      toast.error(
        error instanceof ApiClientError && error.status === 400
          ? error.message
          : "Something went wrong. Please try again.",
        { id: "create-event-feedback" },
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  if (isPending || !session) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#f7fbf8] px-5 py-20 dark:bg-slate-950">
        <p
          aria-live="polite"
          className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
          {isPending ? "Checking your account…" : "Redirecting to sign in…"}
        </p>
      </main>
    );
  }

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#f7fbf8] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-48 top-0 h-[34rem] w-[34rem] rounded-full bg-emerald-200/35 blur-3xl dark:bg-emerald-900/20" />
        <div className="absolute -right-48 top-64 h-[32rem] w-[32rem] rounded-full bg-lime-100/45 blur-3xl dark:bg-teal-950/25" />
      </div>

      <section className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
        <Link
          className="group inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
          href="/upcoming-events"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
          />
          Back to Upcoming Events
        </Link>

        <header className="mx-auto mb-7 mt-7 max-w-3xl text-center sm:mb-10 sm:mt-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/75 px-4 py-2 text-xs font-bold tracking-[0.14em] text-emerald-800 shadow-sm backdrop-blur dark:border-emerald-800/80 dark:bg-slate-900/70 dark:text-emerald-300">
            <HandHeart aria-hidden="true" className="h-4 w-4" />
            SOCIAL SERVICE DRIVE
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Create a Community Event
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Organize a local relief effort, environmental cleanup, or community
            support drive.
          </p>
        </header>

        <div className="mx-auto grid max-w-6xl items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] lg:gap-6">
          <Card className="overflow-hidden rounded-[1.5rem] border border-emerald-950/[0.07] bg-white/95 py-0 shadow-[0_24px_70px_-40px_rgba(4,120,87,0.34)] ring-1 ring-emerald-950/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 dark:ring-white/5">
            <CardHeader className="border-b border-emerald-950/[0.06] px-5 py-5 dark:border-slate-800 sm:px-8 sm:py-6">
              <CardTitle className="text-xl font-bold text-slate-950 dark:text-white">
                Event details
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Share the essentials so your community knows how to take part.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 py-5 sm:px-8 sm:py-8">
              <form
                className="space-y-7"
                noValidate
                onSubmit={handleSubmit}
              >
                <div className="space-y-2.5">
                  <Label
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    htmlFor="title"
                  >
                    Event Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    aria-describedby={errors.title ? "title-error" : undefined}
                    aria-invalid={Boolean(errors.title)}
                    autoComplete="off"
                    className="h-11 rounded-xl border-slate-200 bg-white/80 px-3.5 text-sm focus-visible:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-950/60"
                    id="title"
                    maxLength={120}
                    name="title"
                    onChange={() => clearFieldError("title")}
                    placeholder="e.g. Community garden day"
                    required
                  />
                  <FieldError id="title-error" message={errors.title} />
                </div>

                <fieldset
                  aria-describedby={
                    errors.eventType ? "eventType-error" : undefined
                  }
                  className="space-y-3"
                >
                  <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Event Type <span className="text-rose-500">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {eventTypes.map(({ name, icon: Icon }) => {
                      const selected = eventType === name;
                      return (
                        <label
                          className={`group relative flex min-h-20 cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/60 focus-within:ring-2 focus-within:ring-emerald-500/30 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30 sm:gap-3 sm:px-3 ${
                            selected
                              ? "border-emerald-600 bg-emerald-50 shadow-sm shadow-emerald-900/5 dark:border-emerald-500 dark:bg-emerald-950/50"
                              : errors.eventType
                                ? "border-rose-300 bg-white dark:border-rose-900 dark:bg-slate-950"
                                : "border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-950/40"
                          }`}
                          key={name}
                        >
                          <input
                            aria-describedby={
                              errors.eventType
                                ? "eventType-error"
                                : undefined
                            }
                            checked={selected}
                            className="peer sr-only"
                            name="eventType"
                            onChange={() => {
                              setEventType(name);
                              clearFieldError("eventType");
                            }}
                            required
                            type="radio"
                            value={name}
                          />
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              selected
                                ? "bg-emerald-700 text-white dark:bg-emerald-500"
                                : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-900/60 dark:group-hover:text-emerald-200"
                            }`}
                          >
                            <Icon aria-hidden="true" className="h-5 w-5" />
                          </span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {name}
                          </span>
                          {selected && (
                            <CheckCircle2
                              aria-hidden="true"
                              className="absolute right-2 top-2 h-4 w-4 text-emerald-700 dark:text-emerald-300"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                  <FieldError
                    id="eventType-error"
                    message={errors.eventType}
                  />
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                      htmlFor="eventDate"
                    >
                      Event Date <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <CalendarDays
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-emerald-700 dark:text-emerald-400"
                      />
                      <Input
                        aria-describedby={
                          errors.eventDate ? "eventDate-error" : undefined
                        }
                        aria-invalid={Boolean(errors.eventDate)}
                        className={`h-11 rounded-xl bg-white/80 pl-10 pr-3 text-sm dark:bg-slate-950/60 ${
                          errors.eventDate
                            ? "border-rose-400 dark:border-rose-800"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        id="eventDate"
                        min={minimumDateTime || undefined}
                        name="eventDate"
                        onChange={() => clearFieldError("eventDate")}
                        required
                        type="datetime-local"
                      />
                    </div>
                    <FieldError
                      id="eventDate-error"
                      message={errors.eventDate}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <Label
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                      htmlFor="location"
                    >
                      Location / Venue <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700 dark:text-emerald-400"
                      />
                      <Input
                        aria-describedby={
                          errors.location ? "location-error" : undefined
                        }
                        aria-invalid={Boolean(errors.location)}
                        className={`h-11 rounded-xl bg-white/80 pl-10 pr-3 text-sm dark:bg-slate-950/60 ${
                          errors.location
                            ? "border-rose-400 dark:border-rose-800"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        id="location"
                        maxLength={180}
                        name="location"
                        onChange={() => clearFieldError("location")}
                        placeholder="City, neighborhood or venue"
                        required
                      />
                    </div>
                    <FieldError
                      id="location-error"
                      message={errors.location}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2.5">
                    <Label
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                      htmlFor="thumbnailUrl"
                    >
                      Thumbnail Image URL{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <ImageIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700 dark:text-emerald-400"
                      />
                      <Input
                        aria-describedby={
                          errors.thumbnailUrl
                            ? "thumbnailUrl-error"
                            : undefined
                        }
                        aria-invalid={Boolean(errors.thumbnailUrl)}
                        className={`h-11 rounded-xl bg-white/80 pl-10 pr-3 text-sm dark:bg-slate-950/60 ${
                          errors.thumbnailUrl
                            ? "border-rose-400 dark:border-rose-800"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        id="thumbnailUrl"
                        name="thumbnailUrl"
                        onChange={(event) => {
                          setThumbnailUrl(event.target.value);
                          clearFieldError("thumbnailUrl");
                        }}
                        placeholder="https://example.com/community-event.jpg"
                        required
                        type="url"
                        value={thumbnailUrl}
                      />
                    </div>
                    <FieldError
                      id="thumbnailUrl-error"
                      message={errors.thumbnailUrl}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="mr-1 self-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      Use a preset:
                    </span>
                    {imagePresets.map((preset) => (
                      <Button
                        className="h-8 rounded-full border-slate-200 bg-white/70 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200"
                        key={preset.label}
                        onClick={() => {
                          setThumbnailUrl(preset.url);
                          clearFieldError("thumbnailUrl");
                        }}
                        type="button"
                        variant="outline"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950">
                    {validateImageUrl(thumbnailUrl.trim()) ? (
                      <EventThumbnail
                        alt="Event thumbnail preview"
                        key={thumbnailUrl}
                        sizes="(max-width: 768px) 100vw, 700px"
                        src={thumbnailUrl.trim()}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                        <ImageIcon aria-hidden="true" className="h-8 w-8" />
                        <span className="text-xs font-medium">
                          Your image preview will appear here
                        </span>
                      </div>
                    )}
                    {validateImageUrl(thumbnailUrl.trim()) && (
                      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/20 bg-slate-950/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                        Live event preview
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    htmlFor="description"
                  >
                    Event Description{" "}
                    <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <AlignLeft
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-emerald-700 dark:text-emerald-400"
                    />
                    <Textarea
                      aria-describedby={
                        errors.description ? "description-error" : undefined
                      }
                      aria-invalid={Boolean(errors.description)}
                      className={`min-h-36 resize-y rounded-xl bg-white/80 py-3 pl-10 pr-3 text-sm leading-6 dark:bg-slate-950/60 ${
                        errors.description
                          ? "border-rose-400 dark:border-rose-800"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                      id="description"
                      maxLength={5000}
                      name="description"
                      onChange={() => clearFieldError("description")}
                      placeholder="What is the initiative about? Tell volunteers how they can help and what to expect."
                      required
                    />
                  </div>
                  <FieldError
                    id="description-error"
                    message={errors.description}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label
                    className="text-sm font-semibold text-slate-800 dark:text-slate-200"
                    htmlFor="organizerEmail"
                  >
                    Organizer Email
                  </Label>
                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700 dark:text-emerald-400"
                    />
                    <Input
                      className="h-11 rounded-xl border-slate-200 bg-slate-100/80 pl-10 pr-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300"
                      id="organizerEmail"
                      readOnly
                      value={session.user.email}
                    />
                  </div>
                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Your account is linked automatically when the event is
                    created.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                  <Button
                    className="group h-12 w-full rounded-xl bg-emerald-700 px-6 text-base font-bold text-white shadow-lg shadow-emerald-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-emerald-950/20 focus-visible:ring-emerald-600/40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="h-5 w-5 animate-spin"
                      />
                    ) : (
                      <HandHeart aria-hidden="true" className="h-5 w-5" />
                    )}
                    {isSubmitting ? "Creating your event…" : "Create Event"}
                    {!isSubmitting && (
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      />
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <Card className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-xl shadow-emerald-950/15 dark:border-emerald-800/50">
              <CardContent className="relative p-6 sm:p-7">
                <div
                  aria-hidden="true"
                  className="absolute -right-14 -top-16 h-48 w-48 rounded-full border border-white/10 bg-white/5 blur-sm"
                />
                <div className="relative">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-emerald-200 backdrop-blur">
                    <Sprout aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h2 className="mt-5 text-xl font-bold">
                    Small actions grow into lasting change.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-emerald-100/80">
                    Bring neighbors together around something that matters.
                    Clear details help volunteers show up ready to help.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-slate-200/80 bg-white/75 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  A helpful event page includes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {[
                    "A clear title and purpose",
                    "When and where to meet",
                    "A representative event image",
                  ].map((tip) => (
                    <li className="flex items-start gap-2.5" key={tip}>
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
