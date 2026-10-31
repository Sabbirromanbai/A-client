"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  Clock3,
  HandHeart,
  LoaderCircle,
  Mail,
  PencilLine,
  ShieldCheck,
  Sparkles,
  UsersRound,
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
import { ApiClientError, apiClient } from "@/app/lib/api-client";
import {
  getEventVolunteers,
  type CommunityEvent,
} from "@/app/lib/events";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { authClient } from "@/lib/auth-client";

type UserEvent = CommunityEvent & {
  createdAt?: string;
  joinedAt?: string;
};

type DashboardData = {
  joinedEvents: UserEvent[];
  createdEvents: UserEvent[];
  communityImpact: number | null;
};

type Activity = {
  eventId: string;
  title: string;
  type: "Joined event" | "Created event";
  date: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUserEvent(value: unknown): UserEvent | null {
  if (!isRecord(value)) return null;

  const { _id, title, description, eventType, location, eventDate } = value;
  if (
    typeof _id !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof eventType !== "string" ||
    typeof location !== "string" ||
    typeof eventDate !== "string" ||
    !Number.isFinite(Date.parse(eventDate))
  ) {
    return null;
  }

  return {
    _id,
    title,
    description,
    eventType,
    location,
    eventDate,
    thumbnailUrl:
      typeof value.thumbnailUrl === "string" ? value.thumbnailUrl : undefined,
    creatorEmail:
      typeof value.creatorEmail === "string" ? value.creatorEmail : undefined,
    createdAt:
      typeof value.createdAt === "string" &&
      Number.isFinite(Date.parse(value.createdAt))
        ? value.createdAt
        : undefined,
    joinedAt:
      typeof value.joinedAt === "string" &&
      Number.isFinite(Date.parse(value.joinedAt))
        ? value.joinedAt
        : undefined,
  };
}

function parseEventList(value: unknown): UserEvent[] {
  if (
    !isRecord(value) ||
    value.success !== true ||
    !Array.isArray(value.events)
  ) {
    throw new Error("The events service returned an invalid response.");
  }

  const events = value.events.map(parseUserEvent);
  if (events.some((event) => event === null)) {
    throw new Error("The events service returned an invalid event.");
  }

  return events.filter((event): event is UserEvent => event !== null);
}

function dateValue(value: unknown): Date | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function formatDate(value: unknown, options?: Intl.DateTimeFormatOptions) {
  const date = dateValue(value);
  if (!date) return "Unavailable";
  return date.toLocaleDateString("en-BD", options);
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "G"
  );
}

function validateImageUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function ProfileLoading() {
  return (
    <main
      aria-label="Loading profile"
      className="flex-1 bg-[#fbfdf9] dark:bg-slate-950"
      role="status"
    >
      <section className="mx-auto max-w-7xl space-y-7 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <Skeleton className="h-56 w-full rounded-[2rem]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-28 rounded-2xl" key={index} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </section>
      <span className="sr-only">Loading your GoodTogether profile…</span>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card className="group rounded-2xl border-slate-200/80 bg-white/90 shadow-[0_12px_35px_-28px_rgba(15,76,51,0.42)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-900">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {detail}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const shortcuts = [
  {
    href: "/joined-events",
    title: "My Joined Events",
    detail: "See what you’re showing up for",
    icon: CalendarDays,
  },
  {
    href: "/manage-events",
    title: "Manage My Events",
    detail: "Keep your initiatives moving",
    icon: UsersRound,
  },
  {
    href: "/create-event",
    title: "Create New Event",
    detail: "Bring your community together",
    icon: HandHeart,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const {
    data: session,
    isPending,
  } = authClient.useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const requestInProgress = useRef(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [joinedResponse, createdResponse] = await Promise.all([
        apiClient.get<unknown>("api/participants"),
        apiClient.get<unknown>("api/events/my-events"),
      ]);
      const joinedEvents = parseEventList(joinedResponse);
      const createdEvents = parseEventList(createdResponse);
      const volunteerCounts = await Promise.all(
        createdEvents.map(async (event) => {
          try {
            return (await getEventVolunteers(event._id)).count;
          } catch (error) {
            console.error(
              `Could not load volunteers for event ${event._id}.`,
              error,
            );
            return null;
          }
        }),
      );
      const communityImpact = volunteerCounts.every(
        (count): count is number => count !== null,
      )
        ? volunteerCounts.reduce((total, count) => total + count, 0)
        : null;

      setDashboard({ joinedEvents, createdEvents, communityImpact });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.replace(`/login?callbackURL=${encodeURIComponent("/profile")}`);
        return;
      }

      console.error("Could not load profile activity.", error);
      setLoadError("Your profile activity couldn’t be loaded. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace(`/login?callbackURL=${encodeURIComponent("/profile")}`);
      return;
    }
    const timeout = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timeout);
  }, [isPending, loadDashboard, router, session]);

  function openEditProfile() {
    if (!session) return;
    setName(session.user.name || "");
    setImageUrl(session.user.image || "");
    setFieldError("");
    setIsEditOpen(true);
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInProgress.current) return;

    const cleanName = name.trim();
    const cleanImageUrl = imageUrl.trim();
    if (!cleanName || cleanName.length > 80) {
      setFieldError("Enter a name between 1 and 80 characters.");
      return;
    }
    if (!validateImageUrl(cleanImageUrl)) {
      setFieldError("Use a valid HTTP or HTTPS photo URL.");
      return;
    }

    requestInProgress.current = true;
    setIsSaving(true);
    setFieldError("");
    try {
      const { error } = await authClient.updateUser({
        name: cleanName,
        image: cleanImageUrl || null,
      });
      if (error) {
        throw new Error(error.message || "Your profile couldn’t be updated.");
      }

      toast.success("Your profile was updated.", {
        id: "profile-feedback",
      });
      setIsEditOpen(false);
    } catch (error) {
      console.error("Could not update profile.", error);
      const message =
        error instanceof Error
          ? error.message
          : "Your profile couldn’t be updated. Please try again.";
      setFieldError(message);
      toast.error(message, { id: "profile-feedback" });
    } finally {
      requestInProgress.current = false;
      setIsSaving(false);
    }
  }

  if (isPending || !session) {
    return <ProfileLoading />;
  }

  const user = session.user;
  const displayName = user.name?.trim() || "GoodTogether member";
  const memberSince = formatDate(user.createdAt, {
    month: "short",
    year: "numeric",
  });
  const activities: Activity[] = dashboard
    ? [
        ...dashboard.joinedEvents.flatMap((event) =>
          event.joinedAt
            ? [
                {
                  eventId: event._id,
                  title: event.title,
                  type: "Joined event" as const,
                  date: event.joinedAt,
                },
              ]
            : [],
        ),
        ...dashboard.createdEvents.flatMap((event) =>
          event.createdAt
            ? [
                {
                  eventId: event._id,
                  title: event.title,
                  type: "Created event" as const,
                  date: event.createdAt,
                },
              ]
            : [],
        ),
      ]
        .sort((first, second) => Date.parse(second.date) - Date.parse(first.date))
        .slice(0, 6)
    : [];

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#fbfdf9] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-32 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/30" />
        <div className="absolute -right-36 top-96 h-96 w-96 rounded-full bg-lime-100/50 blur-3xl dark:bg-teal-950/20" />
      </div>

      <section className="mx-auto w-full max-w-7xl space-y-8 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              YOUR GOODTOGETHER SPACE
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Your community, your impact
            </h1>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
            A home for the moments you show up and the good you help set in
            motion.
          </p>
        </header>

        <Card className="relative overflow-hidden rounded-[2rem] border-emerald-100/80 bg-white/90 py-0 shadow-[0_28px_90px_-50px_rgba(15,76,51,0.44)] dark:border-slate-800 dark:bg-slate-900/90">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-36 overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 sm:h-40"
          >
            <div className="absolute -right-8 -top-28 h-72 w-72 rounded-full border border-white/15" />
            <div className="absolute -right-1 top-[-5.5rem] h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -bottom-28 left-[45%] h-56 w-56 rounded-full bg-lime-300/10 blur-2xl" />
          </div>
          <CardContent className="relative grid gap-6 px-5 pb-6 pt-20 sm:px-8 sm:pb-8 sm:pt-24 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end">
              <Avatar className="h-28 w-28 shrink-0 rounded-[2rem] border-4 border-white bg-white shadow-xl dark:border-slate-900 dark:bg-slate-900 sm:h-32 sm:w-32">
                <AvatarImage
                  alt={`${displayName}'s profile photo`}
                  className="rounded-[1.65rem]"
                  src={user.image || undefined}
                />
                <AvatarFallback className="rounded-[1.65rem] bg-gradient-to-br from-emerald-100 to-teal-200 text-3xl font-bold text-emerald-800 dark:from-emerald-900 dark:to-teal-900 dark:text-emerald-100">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 pb-1">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
                  <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  Community Member
                </span>
                <h2 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  {displayName}
                </h2>
                <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-600 dark:text-slate-400">
                  <Mail
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                  />
                  {user.email}
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <CalendarDays
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300"
                  />
                  Member since {memberSince}
                </p>
              </div>
            </div>
            <Button
              className="h-11 w-full rounded-xl border-emerald-200 bg-white/80 font-semibold text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-200 dark:hover:bg-slate-800/80 sm:w-auto"
              onClick={openEditProfile}
              variant="outline"
            >
              <PencilLine aria-hidden="true" className="h-4 w-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton className="h-28 rounded-2xl" key={index} />
            ))}
          </div>
        ) : loadError ? (
          <Card className="rounded-2xl border-rose-200 bg-white/90 dark:border-rose-900 dark:bg-slate-900">
            <CardContent className="flex flex-col items-center px-6 py-10 text-center">
              <CircleAlert
                aria-hidden="true"
                className="h-9 w-9 text-rose-600 dark:text-rose-400"
              />
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                {loadError}
              </p>
              <Button
                className="mt-4 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                onClick={() => void loadDashboard()}
              >
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : dashboard ? (
          <>
            <section aria-label="Community activity statistics">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  detail="Events you’ve signed up for"
                  icon={CalendarDays}
                  label="Joined Events"
                  value={String(dashboard.joinedEvents.length)}
                />
                <StatCard
                  detail="Initiatives you’re organizing"
                  icon={HandHeart}
                  label="Created Events"
                  value={String(dashboard.createdEvents.length)}
                />
                <StatCard
                  detail="Volunteers across your events"
                  icon={UsersRound}
                  label="Community Impact"
                  value={
                    dashboard.communityImpact === null
                      ? "Unavailable"
                      : String(dashboard.communityImpact)
                  }
                />
                <StatCard
                  detail="Part of the community"
                  icon={Clock3}
                  label="Member Since"
                  value={memberSince}
                />
              </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-3xl border-slate-200/80 bg-white/90 shadow-[0_16px_50px_-36px_rgba(15,76,51,0.4)] dark:border-slate-800 dark:bg-slate-900/90">
                <CardHeader className="px-5 pb-2 pt-6 sm:px-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                        THE DETAILS
                      </p>
                      <CardTitle className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                        Personal information
                      </CardTitle>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-5 pb-7 pt-4 sm:px-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Full name
                    </p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Email address
                    </p>
                    <p className="mt-1 break-all font-medium text-slate-800 dark:text-slate-200">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Your email is managed securely by your account.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Profile photo
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage alt="" src={user.image || undefined} />
                        <AvatarFallback className="bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm text-slate-600 dark:text-slate-400">
                        {user.image ? "Photo set" : "Initials shown"}
                      </span>
                      <Button
                        className="ml-auto rounded-lg text-emerald-800 dark:text-emerald-300"
                        onClick={openEditProfile}
                        size="sm"
                        variant="ghost"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-200/80 bg-white/90 shadow-[0_16px_50px_-36px_rgba(15,76,51,0.4)] dark:border-slate-800 dark:bg-slate-900/90">
                <CardHeader className="px-5 pb-2 pt-6 sm:px-7">
                  <p className="text-xs font-bold tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                    YOUR STORY SO FAR
                  </p>
                  <CardTitle className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    Recent activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-7 pt-3 sm:px-7">
                  {activities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-950/50">
                      <Sparkles
                        aria-hidden="true"
                        className="mx-auto h-6 w-6 text-emerald-600 dark:text-emerald-400"
                      />
                      <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Your story starts with one step
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Joined and created events will appear here.
                      </p>
                    </div>
                  ) : (
                    <ol className="space-y-0">
                      {activities.map((activity, index) => (
                        <li className="relative flex gap-3 pb-5 last:pb-0" key={`${activity.type}:${activity.eventId}`}>
                          {index < activities.length - 1 && (
                            <span
                              aria-hidden="true"
                              className="absolute bottom-0 left-[0.875rem] top-8 w-px bg-emerald-100 dark:bg-slate-700"
                            />
                          )}
                          <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-4 ring-white dark:bg-emerald-950 dark:text-emerald-300 dark:ring-slate-900">
                            {activity.type === "Joined event" ? (
                              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                            ) : (
                              <HandHeart aria-hidden="true" className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              className="line-clamp-1 text-sm font-semibold text-slate-900 transition-colors hover:text-emerald-700 dark:text-white dark:hover:text-emerald-300"
                              href={`/event-details/${encodeURIComponent(activity.eventId)}`}
                            >
                              {activity.title}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {activity.type} ·{" "}
                              {formatDate(activity.date, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>
            </div>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                    KEEP THE GOOD GOING
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Your next steps
                  </h2>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {shortcuts.map(({ href, title, detail, icon: Icon }) => (
                  <Link
                    className="group rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    href={href}
                    key={href}
                  >
                    <Card className="h-full rounded-2xl border-slate-200/80 bg-white/85 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:border-emerald-200 group-hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/85 dark:group-hover:border-emerald-900">
                      <CardContent className="flex items-center gap-4 p-5">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Icon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold text-slate-900 dark:text-white">
                            {title}
                          </span>
                          <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                            {detail}
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 shrink-0 text-emerald-700 transition-transform duration-300 group-hover:translate-x-1 dark:text-emerald-300"
                        />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>

      <Dialog
        onOpenChange={(open) => {
          if (!isSaving) setIsEditOpen(open);
        }}
        open={isEditOpen}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border-emerald-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-w-lg sm:p-8">
          <DialogHeader>
            <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <PencilLine aria-hidden="true" className="h-5 w-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Edit your profile
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Keep your community profile up to date. Your email stays private
              and cannot be changed here.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSaveProfile}>
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-slate-800">
                <AvatarImage alt="" src={imageUrl.trim() || undefined} />
                <AvatarFallback className="bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">
                  {getInitials(name || displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                  {name.trim() || displayName}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                autoComplete="name"
                className="h-11 rounded-xl"
                id="profile-name"
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email address</Label>
              <Input
                className="h-11 rounded-xl bg-slate-50 text-slate-500 dark:bg-slate-950"
                id="profile-email"
                readOnly
                value={user.email}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-image">Profile photo URL</Label>
              <Input
                autoComplete="url"
                className="h-11 rounded-xl"
                id="profile-image"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                type="url"
                value={imageUrl}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Leave blank to use your initials instead.
              </p>
            </div>

            {fieldError && (
              <p
                aria-live="polite"
                className="text-sm font-medium text-rose-600 dark:text-rose-400"
                role="alert"
              >
                {fieldError}
              </p>
            )}

            <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
              <Button
                className="rounded-xl"
                disabled={isSaving}
                onClick={() => setIsEditOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                className="rounded-xl bg-emerald-700 px-5 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
