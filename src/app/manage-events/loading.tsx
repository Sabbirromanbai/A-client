import { Skeleton } from "@/components/ui/skeleton";

export default function ManageEventsLoading() {
  return (
    <main
      aria-label="Loading your events"
      className="flex-1 bg-[#fbfdf9] dark:bg-slate-950"
    >
      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <div className="mt-9 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton className="h-24 w-full rounded-2xl" key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
