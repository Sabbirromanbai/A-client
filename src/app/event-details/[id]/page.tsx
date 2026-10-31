import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getEventById } from "@/app/lib/events";
import EventLoadError from "@/components/events/EventLoadError";
import EventDetailsContent from "@/components/events/EventDetailsContent";

type EventDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  await connection();
  const { id } = await params;
  if (!/^[\da-fA-F]{24}$/.test(id)) notFound();

  let event;
  try {
    event = await getEventById(id);
  } catch (error) {
    console.error(`Failed to load event ${id}.`, error);
    return (
      <main className="flex-1 bg-[#fbfdf9] dark:bg-slate-950">
        <section className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
          <EventLoadError />
        </section>
      </main>
    );
  }

  if (!event) notFound();

  return <EventDetailsContent event={event} key={event._id} />;
}
