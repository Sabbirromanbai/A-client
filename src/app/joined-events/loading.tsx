import { Skeleton } from "@/components/ui/skeleton";

export default function JoinedEventsLoading() {
  return (
    <main
      aria-label="Loading joined events"
      className="flex-1 bg-[#fbfdf9] dark:bg-slate-950"
    >
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              key={index}
            >
              <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
              <Skeleton className="mt-5 h-5 w-24" />
              <Skeleton className="mt-3 h-7 w-3/4" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
