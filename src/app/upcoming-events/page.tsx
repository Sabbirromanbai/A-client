import { connection } from "next/server";
import {
  getEvents,
  getFutureEvents,
  type CommunityEvent,
} from "@/app/lib/events";
import EventLoadError from "@/components/events/EventLoadError";
import UpcomingEventsBrowser from "@/components/events/UpcomingEventsBrowser";

export default async function UpcomingEventsPage() {
  await connection();

  let events: CommunityEvent[];
  try {
    events = getFutureEvents(await getEvents());
  } catch (error) {
    console.error("Failed to load upcoming events.", error);
    return (
      <main className="flex-1 bg-[#fbfdf9] dark:bg-slate-950">
        <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <EventLoadError />
        </section>
      </main>
    );
  }

  return (
    <main className="relative isolate flex-1 overflow-hidden bg-[#fbfdf9] dark:bg-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl dark:bg-emerald-950/30" />
        <div className="absolute -right-40 top-48 h-96 w-96 rounded-full bg-lime-100/50 blur-3xl dark:bg-teal-950/20" />
      </div>

      <UpcomingEventsBrowser events={events} />
    </main>
  );
}
